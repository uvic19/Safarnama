export default function BudgetProgressBar({ totalSpent, totalBudget }) {
  if (!totalBudget || totalBudget <= 0) return null;

  const percentage = Math.min((totalSpent / totalBudget) * 100, 100);
  
  let colorClass = 'bg-primary';
  let ringClass = 'ring-primary/20';
  
  if (percentage >= 100) {
    colorClass = 'bg-destructive';
    ringClass = 'ring-destructive/20';
  } else if (percentage >= 80) {
    colorClass = 'bg-amber-500';
    ringClass = 'ring-amber-500/20';
  }

  return (
    <div className="p-4 rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] mb-6 animate-fade-up">
      <div className="flex justify-between items-end mb-3">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Budget</p>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-xl font-semibold text-foreground">
              ₹{Math.round(totalSpent).toLocaleString('en-IN')}
            </span>
            <span className="text-sm text-muted-foreground">
              / ₹{Math.round(totalBudget).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {Math.round(percentage)}%
        </span>
      </div>

      <div className="h-2.5 w-full bg-[#18181B] rounded-full overflow-hidden ring-1 ring-inset ring-white/[0.08]">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out-expo ${colorClass} shadow-[0_0_12px_rgba(255,255,255,0.1)]`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {percentage >= 100 && (
        <p className="text-xs text-destructive mt-3 font-medium">
          You have exceeded your trip budget.
        </p>
      )}
    </div>
  );
}
