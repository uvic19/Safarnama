import { Check } from 'lucide-react';

/**
 * Member checkbox grid for expense split selection.
 * @param {Array} members  - Array of member objects {id, user_id, offline_name, role}
 * @param {Array} selected - Array of selected member IDs
 * @param {Function} onChange - (newSelected: string[]) => void
 */
export default function SplitSelector({ members = [], selected = [], onChange, currentUser }) {
  const toggle = (memberId) => {
    const next = selected.includes(memberId)
      ? selected.filter((id) => id !== memberId)
      : [...selected, memberId];
    onChange(next);
  };

  const selectAll = () => onChange(members.map((m) => m.id));
  const clearAll = () => onChange([]);

  if (members.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No members found.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {/* Quick actions */}
      <div className="flex gap-2">
        <button
          onClick={selectAll}
          className="text-xs text-primary underline-offset-2 hover:underline"
        >
          Select all
        </button>
        <span className="text-white/20">·</span>
        <button
          onClick={clearAll}
          className="text-xs text-muted-foreground underline-offset-2 hover:underline"
        >
          Clear
        </button>
        <span className="ml-auto text-xs text-muted-foreground">
          {selected.length} selected
        </span>
      </div>

      {/* Member grid */}
      <div className="grid grid-cols-2 gap-2">
        {members.map((member) => {
          // If a currentUserId was passed in, we could use it here. But since we don't have it directly in SplitSelector without changing props, let's just make it robust.
          let label = member.offline_name || member.display_name || member.name || member.user_id?.slice(0, 8) || 'Unknown';
          if (currentUser && member.id === currentUser.uid) {
            label = currentUser.displayName || 'You';
          }
          const isSelected = selected.includes(member.id);
          return (
            <button
              key={member.id}
              onClick={() => toggle(member.id)}
              className={`flex items-center gap-2 p-3 rounded-lg ring-1 transition-all duration-150 text-left
                ${isSelected
                  ? 'bg-primary/10 ring-primary/40 text-foreground'
                  : 'bg-white/[0.03] ring-white/[0.08] text-muted-foreground hover:bg-white/[0.06]'
                }`}
            >
              {/* Checkbox indicator */}
              <div
                className={`w-4 h-4 rounded-sm flex-shrink-0 flex items-center justify-center ring-1 transition-colors
                  ${isSelected ? 'bg-primary ring-primary' : 'bg-transparent ring-white/20'}`}
              >
                {isSelected && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
              </div>
              <span className="text-sm font-medium truncate">{label}</span>
              {member.role === 'KAPTAN' && (
                <span className="ml-auto text-xs text-amber-400 flex-shrink-0">K</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
