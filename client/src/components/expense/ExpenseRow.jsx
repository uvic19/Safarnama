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
export default function ExpenseRow({ expense, showStatus = false, currentUserId, kaptanId, baseCurrency = 'INR', onEdit, onDelete }) {
  const {
    amount,
    currency,
    amount_in_base,
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
  
  const displayAmount = amount_in_base || amount;
  const isDifferentCurrency = currency && currency !== baseCurrency;

  return (
    <div className="rounded-xl bg-white/[0.03] p-3 sm:p-4 ring-1 ring-white/[0.06] transition-colors duration-200 hover:bg-white/[0.05]">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Left — Category icon */}
        <div className="shrink-0">
          <CategoryIcon category={category} size={40} />
        </div>

        {/* Middle — description + meta + badge */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium leading-tight text-foreground">
              {description || category}
            </p>
            {showStatus && <ApprovalBadge status={status} className="shrink-0" />}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
            {metaItems.map((item, index) => (
              <span key={`${item}-${index}`} className="inline-flex min-w-0 items-center gap-1.5">
                {index > 0 && <span className="text-white/20">·</span>}
                <span className={index === 1 ? 'capitalize' : ''}>{item}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Right — amount + actions */}
        <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-4">
          <div className="text-right">
            <span className="font-mono text-sm font-semibold tracking-tight text-foreground sm:text-base">
                {baseCurrency} {Number(displayAmount).toLocaleString('en-IN')}
            </span>
            {isDifferentCurrency && (
               <p className="text-[10px] text-muted-foreground">{currency} {Number(amount).toLocaleString('en-IN')}</p>
            )}
          </div>

          {canEdit && (
            <div className="flex items-center -mr-1.5">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(expense);
                  }}
                  className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground"
                  aria-label="Edit expense"
                  title="Edit Expense"
                >
                  <Edit3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(expense);
                  }}
                  className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                  aria-label="Delete expense"
                  title="Delete Expense"
                >
                  <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
