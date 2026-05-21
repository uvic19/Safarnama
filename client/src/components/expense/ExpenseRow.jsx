import CategoryIcon from './CategoryIcon';
import ApprovalBadge from './ApprovalBadge';
import { Edit3, Trash2 } from 'lucide-react';

/**
 * Format a Firestore Timestamp or ISO string to a relative "time ago" string.
 */
function timeAgo(ts) {
  if (!ts) return '';
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/**
 * Single expense row for lists.
 * @param {object} expense - Firestore expense document
 * @param {boolean} showStatus - Show approval badge (default false)
 * @param {string} currentUserId - UID of the current user
 * @param {string} kaptanId - UID of the trip kaptan
 * @param {Function} onEdit - Callback to edit this expense
 */
export default function ExpenseRow({ expense, showStatus = false, currentUserId, kaptanId, onEdit, onDelete }) {
  const {
    amount,
    category = 'Misc',
    description,
    paid_by_name,
    payment_mode,
    status,
    created_at,
  } = expense;

  const isCreator = expense.created_by === currentUserId || (!expense.created_by && expense.paid_by_id === currentUserId);
  const isKaptan = currentUserId === kaptanId;
  const canEdit = isKaptan || (isCreator && expense.status !== 'APPROVED');

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] ring-1 ring-white/[0.06] hover:bg-white/[0.05] transition-colors duration-200">
      {/* Category icon */}
      <CategoryIcon category={category} size={40} />

      {/* Middle — description + meta */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {description || category}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">
            {paid_by_name}
          </span>
          <span className="text-white/20 text-xs">·</span>
          <span className="text-xs text-muted-foreground capitalize">
            {payment_mode}
          </span>
          <span className="text-white/20 text-xs">·</span>
          <span className="text-xs text-muted-foreground">
            {timeAgo(created_at)}
          </span>
        </div>
      </div>

      {/* Right — amount + badge + edit button */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex flex-col items-end gap-1">
          <span className="font-mono text-sm font-semibold text-foreground tracking-tight">
            ₹{Number(amount).toLocaleString('en-IN')}
          </span>
          {showStatus && <ApprovalBadge status={status} />}
        </div>

        {canEdit && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(expense);
                }}
                className="p-1.5 rounded-lg hover:bg-white/[0.08] text-muted-foreground hover:text-foreground transition-colors"
                title="Edit Expense"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(expense);
                }}
                className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 transition-colors"
                title="Delete Expense"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
