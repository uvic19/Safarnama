import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, SlidersHorizontal } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { expenseService } from '../../services/expenseService';
import ExpenseRow from '../../components/expense/ExpenseRow';
import NumpadSheet from '../../components/expense/NumpadSheet';
import { CATEGORIES } from '../../components/expense/CategoryIcon';
import { toast } from 'sonner';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const FILTERS = ['All', ...CATEGORIES];
const SORTS = [
  { label: 'Newest', fn: (a, b) => (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0) },
  { label: 'Oldest', fn: (a, b) => (a.created_at?.seconds || 0) - (b.created_at?.seconds || 0) },
  { label: 'Highest', fn: (a, b) => Number(b.amount) - Number(a.amount) },
  { label: 'Lowest',  fn: (a, b) => Number(a.amount) - Number(b.amount) },
];

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] ring-1 ring-white/[0.06] animate-pulse">
      <div className="w-10 h-10 rounded-full bg-white/[0.08]" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 rounded bg-white/[0.08] w-32" />
        <div className="h-3 rounded bg-white/[0.05] w-20" />
      </div>
      <div className="h-4 w-16 rounded bg-white/[0.08]" />
    </div>
  );
}

export default function ExpenseListPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [sortIdx, setSortIdx] = useState(0);
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

  // Fetch trip meta
  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, 'trips', id)).then((d) => {
      if (d.exists()) setTrip({ id: d.id, ...d.data() });
    });
  }, [id]);

  // Real-time expenses
  useEffect(() => {
    if (!id) return;
    const unsub = expenseService.subscribeToExpenses(id, (data) => {
      setExpenses(data);
      setLoading(false);
    });
    return unsub;
  }, [id]);

  const filtered = expenses
    .filter((e) => filter === 'All' || e.category === filter)
    .sort(SORTS[sortIdx].fn);

  // Group by date
  const grouped = filtered.reduce((acc, expense) => {
    const date = expense.created_at?.toDate
      ? expense.created_at.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : expense.created_at
        ? new Date(expense.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'Unknown Date';
    if (!acc[date]) acc[date] = [];
    acc[date].push(expense);
    return acc;
  }, {});

  const totalFiltered = filtered.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return (
    <>
      <div className="p-4 md:p-8 max-w-[900px] mx-auto pb-24 md:pb-8 animate-fade-up">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(`/trips/${id}`)}
            className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Expenses</h1>
            {trip?.name && <p className="text-sm text-muted-foreground">{trip.name}</p>}
          </div>
        </div>

        {/* Summary strip */}
        <div className="flex items-center justify-between mb-5 p-4 rounded-xl bg-white/[0.03] ring-1 ring-white/[0.06]">
          <div>
            <p className="text-xs text-muted-foreground">Total ({filter})</p>
            <p className="font-mono text-xl font-semibold text-foreground">
              ₹{totalFiltered.toLocaleString('en-IN')}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">{filtered.length} expense{filtered.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-3 scrollbar-none">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-md text-sm font-medium ring-1 transition-all duration-150
                ${filter === f
                  ? 'bg-primary text-primary-foreground ring-primary'
                  : 'bg-white/[0.04] text-muted-foreground ring-white/[0.08] hover:bg-white/[0.08]'
                }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Sort row */}
        <div className="flex items-center gap-2 mb-5">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <div className="flex gap-1 overflow-x-auto scrollbar-none">
            {SORTS.map((s, i) => (
              <button
                key={s.label}
                onClick={() => setSortIdx(i)}
                className={`flex-shrink-0 px-2.5 py-1 rounded text-xs font-medium transition-all
                  ${sortIdx === i ? 'bg-white/10 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Expense list */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-white/[0.05] flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">No expenses found</p>
            <p className="text-xs text-muted-foreground/60">
              {filter !== 'All' ? `No ${filter} expenses yet` : 'Add your first expense below'}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(grouped).map(([date, dayExpenses]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-2">
                  <p className="text-xs font-medium text-muted-foreground">{date}</p>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                  <p className="text-xs font-mono text-muted-foreground">
                    ₹{dayExpenses.reduce((s, e) => s + Number(e.amount || 0), 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="space-y-2">
                  {dayExpenses.map((e) => (
                    <ExpenseRow 
                      key={e.id} 
                      expense={e} 
                      showStatus={trip?.mode !== 'SOLO'} 
                      currentUserId={user?.uid}
                      kaptanId={trip?.kaptan_id}
                      onEdit={handleEditExpense}
                      onDelete={handleDeleteExpense}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setNumpadOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-8 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-150 z-20"
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
