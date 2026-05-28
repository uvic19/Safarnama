import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShieldAlert } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { expenseService } from '../../services/expenseService';
import { settlementService } from '../../services/settlementService';
import { computeBalances } from '../../lib/calculations';
import { Button } from '../../components/ui/button';
import BudgetProgressBar from '../../components/balance/BudgetProgressBar';
import ExpenseDonutChart from '../../components/balance/ExpenseDonutChart';
import BalanceCard from '../../components/balance/BalanceCard';

export default function BalancePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trip, setTrip] = useState(null);
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load Data
  useEffect(() => {
    if (!id) return;

    let unsubExpenses = () => {};
    let unsubSettlements = () => {};

    const loadCore = async () => {
      try {
        const tripDoc = await getDoc(doc(db, 'trips', id));
        if (tripDoc.exists()) setTrip({ id: tripDoc.id, ...tripDoc.data() });

        const m = await expenseService.getMembers(id);
        setMembers(m);

        unsubExpenses = expenseService.subscribeToExpenses(id, (exp) => setExpenses(exp));
        unsubSettlements = settlementService.subscribeToSettlements(id, (setl) => setSettlements(setl));
      } catch (e) {
        console.error('Failed to load balance page data', e);
      } finally {
        setLoading(false);
      }
    };

    loadCore();
    return () => {
      unsubExpenses();
      unsubSettlements();
    };
  }, [id]);

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-[900px] mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-white/[0.06] rounded-md" />
        <div className="h-32 w-full bg-white/[0.06] rounded-2xl" />
        <div className="h-48 w-full bg-white/[0.06] rounded-2xl" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p>Trip not found.</p>
        <button onClick={() => navigate('/dashboard')} className="text-sm underline mt-2">Back to dashboard</button>
      </div>
    );
  }

  // Calculate Balances
  const { balances, totalGroupSpent } = computeBalances(members, expenses, settlements);
  
  // Find current user's balance
  const currentUserBalanceObj = balances.find((b) => b.id === user?.uid) || null;
  const baseCurr = trip.base_currency || 'INR';
  let currentUserMessage = 'You are settled up.';
  let currentUserAmount = `${baseCurr} 0`;
  let currentUserColor = 'text-zinc-500';

  if (currentUserBalanceObj) {
    const cb = currentUserBalanceObj.current_balance;
    if (cb > 0.01) {
      currentUserMessage = 'You get back';
      currentUserAmount = `${baseCurr} ${Math.round(cb).toLocaleString('en-IN')}`;
      currentUserColor = 'text-emerald-400';
    } else if (cb < -0.01) {
      currentUserMessage = 'You owe';
      currentUserAmount = `${baseCurr} ${Math.abs(Math.round(cb)).toLocaleString('en-IN')}`;
      currentUserColor = 'text-rose-400';
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-[900px] mx-auto pb-24 md:pb-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate(`/trips/${id}`)}
          className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Balances</h1>
          <p className="text-sm text-muted-foreground">{trip.name}</p>
        </div>
      </div>

      {trip.mode === 'SOLO' && (
        <div className="mb-6 p-4 rounded-xl bg-blue-500/10 ring-1 ring-blue-500/20 text-blue-400 text-sm flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>This is a Solo trip. Balances and settlements are not applicable.</p>
        </div>
      )}

      {/* Overview Block */}
      <div className="mb-6 flex flex-col md:flex-row gap-3">
        <div className="flex-1 p-5 rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06]">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">My Balance</p>
          <div className="flex items-stretch justify-between gap-4">
            <div className="flex flex-col justify-end">
              <p className="text-sm text-muted-foreground mb-0.5">{currentUserMessage}</p>
              <p className={`font-mono text-3xl font-bold leading-none ${currentUserColor}`}>
                {currentUserAmount}
              </p>
            </div>
            {trip.mode !== 'SOLO' && (
              <Button asChild className="bg-primary text-primary-foreground font-medium rounded-md h-auto px-4">
                <Link to={`/trips/${id}/settlement`} className="flex items-center">
                  Settle Up <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex-1 p-5 rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06]">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Total Group Spends</p>
          <p className="font-mono text-3xl font-bold leading-none text-foreground mt-auto pt-1">
            {baseCurr} {Math.round(totalGroupSpent).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Budget & Charts */}
      {trip.total_budget && trip.total_budget > 0 && (
        <BudgetProgressBar totalSpent={totalGroupSpent} totalBudget={trip.total_budget} />
      )}
      
      <ExpenseDonutChart expenses={expenses} />

      {/* Individual Balances List */}
      {trip.mode !== 'SOLO' && (
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">Member Balances</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {balances
              .sort((a, b) => b.current_balance - a.current_balance) // Creditors first
              .map((b) => (
                <BalanceCard
                  key={b.id}
                  balanceObj={b}
                  isCurrentUser={b.id === user?.uid}
                  baseCurrency={baseCurr}
                />
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}
