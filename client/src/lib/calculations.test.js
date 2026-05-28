import { describe, it, expect } from 'vitest';
import { computeBalances, simplifyDebts } from './calculations';

describe('calculations.js', () => {
  describe('computeBalances', () => {
    it('should correctly compute balances for an exact split', () => {
      const members = [
        { id: 'user1', display_name: 'Alice', role: 'KAPTAN' },
        { id: 'user2', display_name: 'Bob', role: 'MEMBER' },
        { id: 'user3', display_name: 'Charlie', role: 'MEMBER' },
      ];

      const expenses = [
        {
          status: 'APPROVED',
          amount: 300,
          paid_by_id: 'user1',
          split_mode: 'EXACT',
          split_details: {
            user1: 100,
            user2: 150,
            user3: 50,
          },
        },
      ];

      const { balances, totalGroupSpent } = computeBalances(members, expenses, []);

      expect(totalGroupSpent).toBe(300);
      expect(balances.length).toBe(3);

      const alice = balances.find(b => b.id === 'user1');
      const bob = balances.find(b => b.id === 'user2');
      const charlie = balances.find(b => b.id === 'user3');

      expect(alice.total_paid).toBe(300);
      expect(alice.total_owed).toBe(100);
      expect(alice.current_balance).toBe(200); // 300 - 100

      expect(bob.total_paid).toBe(0);
      expect(bob.total_owed).toBe(150);
      expect(bob.current_balance).toBe(-150);

      expect(charlie.total_paid).toBe(0);
      expect(charlie.total_owed).toBe(50);
      expect(charlie.current_balance).toBe(-50);
    });

    it('should correctly compute balances for an equal split', () => {
      const members = [
        { id: 'user1', display_name: 'Alice', role: 'KAPTAN' },
        { id: 'user2', display_name: 'Bob', role: 'MEMBER' },
      ];

      const expenses = [
        {
          status: 'APPROVED',
          amount: 100,
          paid_by_id: 'user1',
          split_mode: 'EQUAL',
          split_among: ['user1', 'user2'],
        },
      ];

      const { balances } = computeBalances(members, expenses, []);
      
      const alice = balances.find(b => b.id === 'user1');
      const bob = balances.find(b => b.id === 'user2');

      expect(alice.current_balance).toBe(50); // Paid 100, owed 50
      expect(bob.current_balance).toBe(-50); // Paid 0, owed 50
    });

    it('should incorporate confirmed settlements', () => {
      const members = [
        { id: 'user1', display_name: 'Alice' },
        { id: 'user2', display_name: 'Bob' },
      ];

      // Alice paid 100, split equally -> Bob owes Alice 50
      const expenses = [
        {
          status: 'APPROVED',
          amount: 100,
          paid_by_id: 'user1',
          split_mode: 'EQUAL',
          split_among: ['user1', 'user2'],
        },
      ];

      // Bob paid Alice 30
      const settlements = [
        {
          status: 'CONFIRMED',
          amount: 30,
          from_id: 'user2',
          to_id: 'user1',
        },
        {
          status: 'PENDING', // Should be ignored
          amount: 20,
          from_id: 'user2',
          to_id: 'user1',
        }
      ];

      const { balances } = computeBalances(members, expenses, settlements);

      const alice = balances.find(b => b.id === 'user1');
      const bob = balances.find(b => b.id === 'user2');

      // Alice: Net +50, but received 30 -> Balance is now 50 - 30 = 20
      expect(alice.net_balance).toBe(50);
      expect(alice.settlements_received).toBe(30);
      expect(alice.current_balance).toBe(20);

      // Bob: Net -50, but paid 30 -> Balance is now -50 + 30 = -20
      expect(bob.net_balance).toBe(-50);
      expect(bob.settlements_paid).toBe(30);
      expect(bob.current_balance).toBe(-20);
    });
  });

  describe('simplifyDebts', () => {
    it('should generate minimal transactions', () => {
      const balancesArray = [
        { id: 'user1', name: 'Alice', current_balance: 100, upi_id: 'alice@okbank' }, // Creditor
        { id: 'user2', name: 'Bob', current_balance: -60, upi_id: 'bob@okbank' },     // Debtor
        { id: 'user3', name: 'Charlie', current_balance: -40, upi_id: 'charlie@okbank' }, // Debtor
      ];

      const transactions = simplifyDebts(balancesArray);
      
      expect(transactions).toHaveLength(2);

      // Bob should pay Alice 60
      const tx1 = transactions.find(t => t.fromId === 'user2');
      expect(tx1.toId).toBe('user1');
      expect(tx1.amount).toBe(60);
      expect(tx1.toUpiId).toBe('alice@okbank');

      // Charlie should pay Alice 40
      const tx2 = transactions.find(t => t.fromId === 'user3');
      expect(tx2.toId).toBe('user1');
      expect(tx2.amount).toBe(40);
      expect(tx2.toUpiId).toBe('alice@okbank');
    });

    it('should handle floating point approximations correctly', () => {
       const balancesArray = [
        { id: 'user1', name: 'Alice', current_balance: 33.33333333 }, 
        { id: 'user2', name: 'Bob', current_balance: -33.33333333 },     
      ];

      const transactions = simplifyDebts(balancesArray);
      
      expect(transactions).toHaveLength(1);
      expect(transactions[0].amount).toBe(33.33); // Rounded to 2 decimals
    });
  });
});
