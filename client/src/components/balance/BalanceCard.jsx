import { cn } from '../../lib/utils';

export default function BalanceCard({ balanceObj, isCurrentUser }) {
  const { name, total_paid, total_owed, current_balance } = balanceObj;
  
  const isCreditor = current_balance > 0.01;
  const isDebtor = current_balance < -0.01;
  const isSettled = !isCreditor && !isDebtor;

  return (
    <div className={cn(
      "p-4 rounded-xl ring-1 transition-all duration-300",
      isCurrentUser ? "bg-white/[0.05] ring-white/[0.12] shadow-sm shadow-white/[0.02]" : "bg-white/[0.02] ring-white/[0.06]"
    )}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#18181B] ring-1 ring-white/[0.08] flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium text-foreground">{name[0].toUpperCase()}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground flex items-center gap-2">
              {name}
              {isCurrentUser && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary/20 text-primary uppercase tracking-wider">You</span>
              )}
            </p>
            {isSettled ? (
              <p className="text-xs font-medium text-zinc-500">Settled</p>
            ) : (
              <p className={cn(
                "text-xs font-medium",
                isCreditor ? "text-emerald-400" : "text-rose-400"
              )}>
                {isCreditor ? "Gets back" : "Owes"}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className={cn(
            "font-mono text-lg font-bold leading-none mb-1",
            isCreditor ? "text-emerald-400" : isDebtor ? "text-rose-400" : "text-zinc-500"
          )}>
            ₹{Math.abs(Math.round(current_balance)).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs">
        <div className="flex flex-col">
          <span className="text-muted-foreground mb-0.5">Paid Total</span>
          <span className="font-mono text-foreground font-medium">₹{Math.round(total_paid).toLocaleString('en-IN')}</span>
        </div>
        <div className="h-6 w-px bg-white/[0.06]"></div>
        <div className="flex flex-col text-right">
          <span className="text-muted-foreground mb-0.5">Used Total</span>
          <span className="font-mono text-foreground font-medium">₹{Math.round(total_owed).toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
}
