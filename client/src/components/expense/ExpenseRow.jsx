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
  const metaItems = [paid_by_name, payment_mode, timeAgo(created_at)].filter(Boolean);

  return (
    <div className="rounded-xl bg-white/[0.03] p-4 ring-1 ring-white/[0.06] transition-colors duration-200 hover:bg-white/[0.05]">
      <div className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-start gap-3">
      {/* Category icon */}
      <CategoryIcon category={category} size={40} />

      {/* Middle — description + meta */}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium leading-5 text-foreground">
          {description || category}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
          {metaItems.map((item, index) => (
            <span key={`${item}-${index}`} className="inline-flex min-w-0 items-center gap-1.5">
              {index > 0 && <span className="text-white/20">·</span>}
              <span className={index === 1 ? 'capitalize' : ''}>{item}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Right — amount + badge + edit button */}
      <div className="flex flex-col items-end gap-2">
        <span className="font-mono text-sm font-semibold tracking-tight text-foreground sm:text-base">
            ₹{Number(amount).toLocaleString('en-IN')}
        </span>

        {canEdit && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(expense);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground"
                aria-label="Edit expense"
                title="Edit Expense"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(expense);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                aria-label="Delete expense"
                title="Delete Expense"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
      </div>

      {showStatus && (
        <div className="mt-3 pl-[52px] sm:mt-0 sm:flex sm:justify-end sm:pl-0">
          <ApprovalBadge status={status} />
        </div>
      )}
    </div>
  );
}
