import { useState } from 'react';
import { Check } from 'lucide-react';

export default function AdvancedSplitSelector({ 
  members = [], 
  splitMode = 'EQUAL', 
  splitAmong = [], 
  splitDetails = {}, 
  totalAmount = 0,
  currency = 'INR',
  onChangeMode, 
  onChangeEqual, 
  onChangeExact,
  currentUser
}) {
  const numTotal = Number(totalAmount) || 0;

  const toggleEqual = (memberId) => {
    const next = splitAmong.includes(memberId)
      ? splitAmong.filter((id) => id !== memberId)
      : [...splitAmong, memberId];
    onChangeEqual(next);
  };

  const selectAllEqual = () => onChangeEqual(members.map((m) => m.id));
  const clearAllEqual = () => onChangeEqual([]);

  const handleExactChange = (memberId, value) => {
    // Only allow positive numbers
    const numValue = value === '' ? '' : Math.max(0, Number(value));
    onChangeExact({
      ...splitDetails,
      [memberId]: numValue
    });
  };

  if (members.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No members found.
      </p>
    );
  }

  // Calculate sum of exact splits
  const exactSum = Object.values(splitDetails).reduce((sum, val) => sum + (Number(val) || 0), 0);
  const exactRemaining = numTotal - exactSum;

  return (
    <div className="space-y-4">
      {/* Mode Tabs */}
      <div className="flex bg-white/[0.03] p-1 rounded-lg ring-1 ring-white/[0.06]">
        <button
          onClick={() => onChangeMode('EQUAL')}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
            splitMode === 'EQUAL' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Equal
        </button>
        <button
          onClick={() => onChangeMode('EXACT')}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
            splitMode === 'EXACT' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Exact
        </button>
      </div>

      {splitMode === 'EQUAL' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <button onClick={selectAllEqual} className="text-xs text-primary hover:underline">Select all</button>
            <span className="text-white/20">·</span>
            <button onClick={clearAllEqual} className="text-xs text-muted-foreground hover:underline">Clear</button>
            <span className="ml-auto text-xs text-muted-foreground">{splitAmong.length} selected</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {members.map((member) => {
              let label = member.offline_name || member.display_name || member.name || member.user_id?.slice(0, 8) || 'Unknown';
              if (currentUser && member.id === currentUser.uid) {
                label = currentUser.displayName || 'You';
              }
              const isSelected = splitAmong.includes(member.id);
              return (
                <button
                  key={member.id}
                  onClick={() => toggleEqual(member.id)}
                  className={`flex items-center gap-2 p-3 rounded-lg ring-1 transition-all duration-150 text-left
                    ${isSelected ? 'bg-primary/10 ring-primary/40 text-foreground' : 'bg-white/[0.03] ring-white/[0.08] text-muted-foreground hover:bg-white/[0.06]'}`}
                >
                  <div className={`w-4 h-4 rounded-sm flex-shrink-0 flex items-center justify-center ring-1 transition-colors
                    ${isSelected ? 'bg-primary ring-primary' : 'bg-transparent ring-white/20'}`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
                  </div>
                  <span className="text-sm font-medium truncate">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {splitMode === 'EXACT' && (
        <div className="space-y-3">
          <div className="flex justify-between items-end pb-2 border-b border-white/10">
            <span className="text-xs font-medium text-muted-foreground uppercase">Split exactly</span>
            <div className="text-right">
              <span className="text-xs text-muted-foreground block mb-0.5">Remaining</span>
              <span className={`font-mono font-medium ${exactRemaining === 0 ? 'text-emerald-400' : exactRemaining < 0 ? 'text-rose-400' : 'text-amber-400'}`}>
                {currency} {exactRemaining.toFixed(2)}
              </span>
            </div>
          </div>
          
          <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
            {members.map((member) => {
              let label = member.offline_name || member.display_name || member.name || member.user_id?.slice(0, 8) || 'Unknown';
              if (currentUser && member.id === currentUser.uid) {
                label = currentUser.displayName || 'You';
              }
              
              const val = splitDetails[member.id] !== undefined ? splitDetails[member.id] : '';
              
              return (
                <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] ring-1 ring-white/[0.06]">
                  <span className="text-sm font-medium text-foreground truncate flex-1">{label}</span>
                  <div className="flex items-center gap-2 flex-shrink-0 w-32 relative">
                    <span className="absolute left-3 text-xs text-muted-foreground">{currency}</span>
                    <input
                      type="number"
                      value={val}
                      onChange={(e) => handleExactChange(member.id, e.target.value)}
                      className="w-full bg-white/[0.05] border border-white/10 rounded-md py-1.5 pl-10 pr-3 text-right text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
