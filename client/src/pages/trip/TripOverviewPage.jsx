import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Receipt, Wallet, Clock, Users, CalendarDays } from 'lucide-react';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { expenseService } from '../../services/expenseService';
import ExpenseRow from '../../components/expense/ExpenseRow';
import NumpadSheet from '../../components/expense/NumpadSheet';
import { toast } from 'sonner';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

function StatBox({ label, value, sub, color = 'text-foreground' }) {
  return (
    <div className="p-[1.5px] rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06]">
      <div className="rounded-[calc(1rem-1.5px)] bg-[#18181B] p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className={`font-mono text-xl font-semibold leading-none ${color}`}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function SkeletonLine({ w = 'w-full', h = 'h-4' }) {
  return <div className={`${w} ${h} rounded-md bg-white/[0.06] animate-pulse`} />;
}

export default function TripOverviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trip, setTrip] = useState(null);
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [numpadOpen, setNumpadOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  const handleEditExpense = (expense) => {
    setExpenseToEdit(expense);
    setNumpadOpen(true);
  };

  const handleDeleteExpense = (expense) => {
    setExpenseToDelete(expense);
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;
    const expenseId = expenseToDelete.id;
    setExpenseToDelete(null);
    try {
      await expenseService.deleteExpense(id, expenseId);
      toast.success('Expense deleted!');
    } catch (e) {
      toast.error('Failed to delete expense');
      console.error(e);
    }
  };

  // Fetch trip + members
  useEffect(() => {
    if (!id) return;
    const fetchTrip = async () => {
      try {
        const tripDoc = await getDoc(doc(db, 'trips', id));
        if (tripDoc.exists()) setTrip({ id: tripDoc.id, ...tripDoc.data() });

        const memberSnap = await getDocs(collection(db, 'trips', id, 'members'));
        setMembers(memberSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error('Failed to load trip', e);
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

  // Real-time expenses (latest 5 shown in overview)
  useEffect(() => {
    if (!id) return;
    const unsub = expenseService.subscribeToExpenses(id, (data) => {
      setExpenses(data);
    });
    return unsub;
  }, [id]);

  const totalSpent = expenses
    .filter((e) => e.status === 'APPROVED')
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const pendingCount = expenses.filter((e) => e.status === 'PENDING').length;

  const daysLeft = trip?.end_date
    ? Math.max(0, Math.ceil((new Date(trip.end_date) - Date.now()) / 86400000))
    : null;

  const isKaptan = trip?.kaptan_id === user?.uid;

  const statusColors = {
    PLANNING:  'bg-blue-500/10 text-blue-400 ring-blue-500/20',
    CONFIRMED: 'bg-violet-500/10 text-violet-400 ring-violet-500/20',
    ONGOING:   'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
    COMPLETED: 'bg-zinc-500/10 text-zinc-400 ring-zinc-500/20',
    ARCHIVED:  'bg-zinc-700/10 text-zinc-500 ring-zinc-700/20',
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-[900px] mx-auto space-y-6 animate-pulse">
        <SkeletonLine w="w-48" h="h-8" />
        <SkeletonLine w="w-72" h="h-5" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <SkeletonLine key={i} h="h-20" />)}
        </div>
        <SkeletonLine h="h-16" />
        <SkeletonLine h="h-16" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
        <p className="text-lg">Trip not found.</p>
        <button onClick={() => navigate('/dashboard')} className="text-sm underline">Back to dashboard</button>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 md:p-8 max-w-[900px] mx-auto pb-24 md:pb-8 animate-fade-up">

        {/* Back + header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl font-bold text-foreground truncate">{trip.name}</h1>
            {trip.destinations?.length > 0 && (
              <p className="text-sm text-muted-foreground truncate">
                {trip.destinations.join(' · ')}
              </p>
            )}
          </div>
          {trip.status && (
            <span className={`px-3 py-1 rounded-md text-xs font-medium ring-1 flex-shrink-0 ${statusColors[trip.status] || statusColors.PLANNING}`}>
              {trip.status}
            </span>
          )}
        </div>

        {/* Date range */}
        {(trip.start_date || trip.end_date) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <CalendarDays className="w-4 h-4" />
            <span className="font-mono">
              {trip.start_date || '—'} → {trip.end_date || '—'}
            </span>
          </div>
        )}

        {/* Stats bento */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatBox
            label="Total Spent"
            value={`₹${totalSpent.toLocaleString('en-IN')}`}
            sub="approved"
          />
          <StatBox
            label="Members"
            value={members.length}
            sub={`${isKaptan ? 'You are Kaptan' : 'Member'}`}
          />
          <StatBox
            label="Pending"
            value={pendingCount}
            sub="need approval"
            color={pendingCount > 0 ? 'text-amber-400' : 'text-foreground'}
          />
          <StatBox
            label="Days Left"
            value={daysLeft !== null ? daysLeft : '—'}
            sub={daysLeft === 0 ? 'Today!' : 'remaining'}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <button
            onClick={() => setNumpadOpen(true)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all duration-150"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm font-medium">Add Expense</span>
          </button>
          <Link
            to={`/trips/${id}/expenses`}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.04] ring-1 ring-white/[0.08] text-muted-foreground hover:text-foreground hover:bg-white/[0.08] transition-all duration-150"
          >
            <Receipt className="w-5 h-5" />
            <span className="text-sm font-medium">All Expenses</span>
          </Link>
          {isKaptan && pendingCount > 0 && (
            <Link
              to={`/trips/${id}/expenses/pending`}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-amber-500/10 ring-1 ring-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all duration-150 relative"
            >
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium">Pending</span>
              <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 text-[10px] text-black font-bold flex items-center justify-center">
                {pendingCount}
              </span>
            </Link>
          )}
          <Link
            to={`/trips/${id}/balances`}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.04] ring-1 ring-white/[0.08] text-muted-foreground hover:text-foreground hover:bg-white/[0.08] transition-all duration-150"
          >
            <Wallet className="w-5 h-5" />
            <span className="text-sm font-medium">Balances</span>
          </Link>
        </div>

        {/* Recent Expenses */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-foreground">Recent Expenses</h2>
            {expenses.length > 5 && (
              <Link to={`/trips/${id}/expenses`} className="text-sm text-muted-foreground hover:text-foreground underline-offset-2 hover:underline">
                View all
              </Link>
            )}
          </div>

          {expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] text-center">
              <div className="w-12 h-12 rounded-full bg-white/[0.05] flex items-center justify-center mb-3">
                <Receipt className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">No expenses yet</p>
              <p className="text-xs text-muted-foreground/60">Tap "Add Expense" to log your first one</p>
            </div>
          ) : (
            <div className="space-y-2">
              {expenses.slice(0, 5).map((e) => (
                <ExpenseRow 
                  key={e.id} 
                  expense={e} 
                  showStatus={trip.mode !== 'SOLO'} 
                  currentUserId={user?.uid}
                  kaptanId={trip?.kaptan_id}
                  onEdit={handleEditExpense}
                  onDelete={handleDeleteExpense}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Add Expense button (mobile) */}
      <button
        onClick={() => setNumpadOpen(true)}
        className="fixed bottom-20 right-4 md:hidden w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-150 z-20"
      >
        <Plus className="w-6 h-6" />
      </button>

      <NumpadSheet
        open={numpadOpen}
        onClose={() => {
          setNumpadOpen(false);
          setExpenseToEdit(null);
        }}
        expenseToEdit={expenseToEdit}
        tripId={id}
        tripMode={trip?.mode}
        kaptanId={trip?.kaptan_id}
        onAdded={() => {}}
      />

      <ConfirmDialog
        open={!!expenseToDelete}
        onOpenChange={(open) => { if (!open) setExpenseToDelete(null); }}
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
