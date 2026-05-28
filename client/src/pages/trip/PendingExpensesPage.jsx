import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, AlertCircle } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { expenseService } from '../../services/expenseService';
import CategoryIcon from '../../components/expense/CategoryIcon';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';

function timeAgo(ts) {
  if (!ts) return '';
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function PendingCard({ expense, tripId }) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await expenseService.approveExpense(tripId, expense.id);
      toast.success('Expense approved');
    } catch {
      toast.error('Failed to approve');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await expenseService.rejectExpense(tripId, expense.id, reason);
      toast.success('Expense rejected');
      setRejecting(false);
    } catch {
      toast.error('Failed to reject');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-[1.5px] rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06]">
      <div className="rounded-[calc(1rem-1.5px)] bg-[#18181B] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] space-y-4">
        {/* Expense details */}
        <div className="flex items-start gap-3">
          <CategoryIcon category={expense.category} size={44} />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground text-sm truncate">
              {expense.description || expense.category}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Submitted by <span className="text-foreground">{expense.paid_by_name}</span>
              {' · '}{timeAgo(expense.created_at)}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-muted-foreground">{expense.payment_mode}</span>
              <span className="text-white/20">·</span>
              <span className="text-xs text-muted-foreground capitalize">{expense.category}</span>
            </div>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="font-mono font-semibold text-lg text-foreground">
              ₹{Number(expense.amount).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Rejection reason input */}
        {rejecting && (
          <div className="space-y-2">
            <Input
              placeholder="Reason for rejection (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-white/[0.04] text-sm"
              autoFocus
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          {rejecting ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setRejecting(false); setReason(''); }}
                disabled={loading}
                className="flex-1 rounded-md"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleReject}
                disabled={loading}
                className="flex-1 rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30 border-0"
              >
                {loading ? 'Rejecting...' : 'Confirm Reject'}
              </Button>
            </>
          ) : (
            <>
              <button
                onClick={() => setRejecting(true)}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md bg-red-500/10 text-red-400 ring-1 ring-red-500/20 hover:bg-red-500/20 text-sm font-medium transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Reject
              </button>
              <button
                onClick={handleApprove}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20 hover:bg-emerald-500/20 text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                {loading ? 'Approving...' : 'Approve'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PendingExpensesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trip, setTrip] = useState(null);
  const [allExpenses, setAllExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, 'trips', id)).then((d) => {
      if (d.exists()) setTrip({ id: d.id, ...d.data() });
    });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const unsub = expenseService.subscribeToExpenses(id, (data) => {
      setAllExpenses(data);
      setLoading(false);
    });
    return unsub;
  }, [id]);

  const pending = allExpenses.filter((e) => e.status === 'PENDING');
  const isKaptan = trip?.kaptan_id === user?.uid;

  return (
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
          <h1 className="font-display text-2xl font-bold text-foreground">Pending Approval</h1>
          {trip?.name && <p className="text-sm text-muted-foreground">{trip.name}</p>}
        </div>
        {pending.length > 0 && (
          <span className="ml-auto px-3 py-1 rounded-md bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20 text-sm font-medium">
            {pending.length} pending
          </span>
        )}
      </div>

      {/* Kaptan guard */}
      {!loading && !isKaptan && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 ring-1 ring-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          Only the Kaptan can approve or reject expenses.
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-white/[0.04] animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && pending.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
            <Check className="w-7 h-7 text-emerald-400" />
          </div>
          <p className="font-display text-lg font-semibold text-foreground mb-1">All caught up!</p>
          <p className="text-sm text-muted-foreground">No pending expenses to review.</p>
        </div>
      )}

      {/* Pending cards */}
      {!loading && isKaptan && pending.length > 0 && (
        <div className="space-y-4">
          {pending.map((expense) => (
          <PendingCard
              key={expense.id}
              expense={expense}
              tripId={id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
