export function computeBalances(members = [], expenses = [], settlements = []) {
  // 1. Initialize member objects
  const memberBalances = {};
  
  // Track total spent by all members for calculating group percentages
  let totalGroupSpent = 0;

  members.forEach(m => {
    memberBalances[m.id] = {
      id: m.id,
      name: m.offline_name || m.display_name || m.user_id?.slice(0, 8) || 'Unknown',
      role: m.role,
      total_paid: 0,
      total_owed: 0,
      settlements_paid: 0,
      settlements_received: 0,
      net_balance: 0,     // Just from expenses: total_paid - total_owed
      current_balance: 0, // Final balance: net_balance + settlements_paid - settlements_received
      upi_id: m.upi_id || null, // Capture upi_id directly from the member document
    };
  });

  // 2. Process APPROVED expenses
  expenses.forEach(expense => {
    if (expense.status !== 'APPROVED') return;

    const amount = Number(expense.amount);
    totalGroupSpent += amount;

    // Credit the person who paid
    if (memberBalances[expense.paid_by_id]) {
      memberBalances[expense.paid_by_id].total_paid += amount;
    }

    // Debit the people who share this expense
    const splitCount = expense.split_among?.length || 1;
    const splitAmount = amount / splitCount;

    expense.split_among?.forEach(memberId => {
      if (memberBalances[memberId]) {
        memberBalances[memberId].total_owed += splitAmount;
      }
    });
  });

  // 3. Process CONFIRMED settlements
  settlements.forEach(settlement => {
    if (settlement.status !== 'CONFIRMED') return;
    
    const amount = Number(settlement.amount);

    if (memberBalances[settlement.from_id]) {
      memberBalances[settlement.from_id].settlements_paid += amount;
    }
    
    if (memberBalances[settlement.to_id]) {
      memberBalances[settlement.to_id].settlements_received += amount;
    }
  });

  // 4. Calculate Final Balances
  Object.values(memberBalances).forEach(mb => {
    mb.net_balance = mb.total_paid - mb.total_owed;
    mb.current_balance = mb.net_balance + mb.settlements_paid - mb.settlements_received;
  });

  // Convert back to array
  return {
    balances: Object.values(memberBalances),
    totalGroupSpent
  };
}

/**
 * Standard min-transaction settlement algorithm.
 * Groups members into Debtors (owe money) and Creditors (owed money),
 * then iteratively matches the largest debtor with the largest creditor.
 */
export function simplifyDebts(balancesArray = []) {
  const debtors = [];
  const creditors = [];

  balancesArray.forEach(b => {
    // We round to 2 decimals to avoid floating point anomalies (e.g. 0.00000000001)
    const currentBalance = Math.round(b.current_balance * 100) / 100;

    if (currentBalance < -0.01) {
      debtors.push({ ...b, amount: -currentBalance });
    } else if (currentBalance > 0.01) {
      creditors.push({ ...b, amount: currentBalance });
    }
  });

  // Sort descending by absolute amount
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions = [];

  let d = 0;
  let c = 0;

  while (d < debtors.length && c < creditors.length) {
    const debtor = debtors[d];
    const creditor = creditors[c];

    const settledAmount = Math.min(debtor.amount, creditor.amount);

    transactions.push({
      fromId: debtor.id,
      fromName: debtor.name,
      toId: creditor.id,
      toName: creditor.name,
      amount: Math.round(settledAmount * 100) / 100,
      toUpiId: creditor.upi_id
    });

    debtor.amount -= settledAmount;
    creditor.amount -= settledAmount;

    // Move pointers if settled
    if (Math.abs(debtor.amount) < 0.01) d++;
    if (Math.abs(creditor.amount) < 0.01) c++;
  }

  return transactions;
}
