const STATUS_CONFIG = {
  PENDING:  { label: 'Pending',  classes: 'bg-amber-500/10 text-amber-400 ring-amber-500/20' },
  APPROVED: { label: 'Approved', classes: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' },
  REJECTED: { label: 'Rejected', classes: 'bg-red-500/10 text-red-400 ring-red-500/20' },
};

/**
 * Small status pill badge for expense approval state.
 * @param {'PENDING'|'APPROVED'|'REJECTED'} status
 */
export default function ApprovalBadge({ status = 'PENDING' }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ring-1 ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}
