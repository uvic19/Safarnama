import { Check, Clock, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { format } from 'date-fns';

export default function SettlementRow({ 
  settlement, 
  currentUserId, 
  isKaptan, 
  onConfirm, 
  onDelete 
}) {
  const { id, from_id, from_name, to_id, to_name, amount, status, created_at, confirmed_at } = settlement;
  
  const isSender = currentUserId === from_id;
  const isReceiver = currentUserId === to_id;
  const isPending = status === 'PENDING';

  // Format the date if available
  const dateStr = confirmed_at 
    ? format(confirmed_at.toDate(), 'MMM d, h:mm a')
    : created_at 
      ? format(created_at.toDate(), 'MMM d, h:mm a') 
      : 'Just now';

  return (
    <div className={cn(
      "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl ring-1 transition-all duration-200",
      isPending ? "bg-amber-500/5 ring-amber-500/20" : "bg-white/[0.02] ring-white/[0.06]"
    )}>
      {/* Information Section */}
      <div className="flex items-center gap-3">
        {/* Status Icon */}
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
          isPending ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
        )}>
          {isPending ? <Clock className="w-5 h-5" /> : <Check className="w-5 h-5" />}
        </div>
        
        <div>
          <p className="text-sm text-foreground">
            <span className="font-medium text-foreground">{isSender ? 'You' : from_name}</span>
            <span className="text-muted-foreground mx-1">paid</span>
            <span className="font-medium text-foreground">{isReceiver ? 'You' : to_name}</span>
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={cn(
              "text-[10px] uppercase tracking-wider font-bold",
              isPending ? "text-amber-500" : "text-emerald-500"
            )}>
              {status}
            </span>
            <span className="text-xs text-muted-foreground font-mono">{dateStr}</span>
          </div>
        </div>
      </div>

      {/* Amount and Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-4 ml-12 sm:ml-0">
        <span className="font-mono text-lg font-semibold text-foreground">
          ₹{Math.round(amount).toLocaleString('en-IN')}
        </span>
        
        {/* Actions */}
        <div className="flex gap-2">
          {isPending && (isReceiver || isKaptan) && (
            <Button
              size="sm"
              className="h-8 bg-emerald-500 text-black hover:bg-emerald-600 rounded-md font-medium px-3"
              onClick={() => onConfirm(id)}
            >
              Confirm
            </Button>
          )}
          {(isSender || isKaptan) && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-md"
              onClick={() => onDelete(id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
