import { Bell, AlertCircle, UserPlus, Receipt, CheckCircle2 } from 'lucide-react';

const ICON_MAP = {
  INVITE: { icon: UserPlus, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  EXPENSE_ADDED: { icon: Receipt, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  EXPENSE_APPROVED: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  SYSTEM: { icon: AlertCircle, color: 'text-zinc-400', bg: 'bg-zinc-500/10' },
};

function timeAgo(date) {
  if (!date) return '';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
}

export default function NotificationItem({ notification, onRead }) {
  const { title, body, created_at, type = 'SYSTEM', is_read } = notification;
  const config = ICON_MAP[type] || ICON_MAP.SYSTEM;
  const Icon = config.icon;

  return (
    <div 
      className={`relative flex items-start gap-4 p-4 rounded-xl transition-colors hover:bg-white/[0.04] cursor-pointer ${
        !is_read ? 'bg-white/[0.02]' : ''
      }`}
      onClick={() => {
        if (!is_read && onRead) onRead(notification.id);
      }}
    >
      {/* Unread indicator */}
      {!is_read && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
      )}
      
      <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${config.bg}`}>
        <Icon className={`w-5 h-5 ${config.color}`} />
      </div>

      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex justify-between gap-2 items-start mb-1">
          <h4 className={`text-sm font-medium leading-tight ${is_read ? 'text-foreground/80' : 'text-foreground'}`}>
            {title}
          </h4>
          <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
            {timeAgo(created_at)}
          </span>
        </div>
        <p className={`text-sm leading-snug ${is_read ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
          {body}
        </p>
      </div>
    </div>
  );
}
