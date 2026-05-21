import { CATEGORIES } from '../expense/CategoryIcon';

// Match colors to CATEGORIES in CategoryIcon.jsx
const CATEGORY_COLORS = {
  'Food': '#F59E0B',
  'Stay': '#8B5CF6',
  'Transport': '#3B82F6',
  'Fuel': '#10B981',
  'Entry Fee': '#F43F5E',
  'Shopping': '#06B6D4',
  'Misc': '#A1A1AA'
};

export default function ExpenseDonutChart({ expenses = [] }) {
  if (!expenses || expenses.length === 0) return null;

  const categoryTotals = expenses.reduce((acc, curr) => {
    if (curr.status !== 'APPROVED') return acc;
    const cat = curr.category || 'Misc';
    acc[cat] = (acc[cat] || 0) + Number(curr.amount);
    return acc;
  }, {});

  const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  if (total === 0) return null;

  // Calculate SVG stroke dashes for the donut segments
  const size = 160;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Convert map to sorted array (largest segments first)
  const segments = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: amount / total,
      color: CATEGORY_COLORS[category] || '#A1A1AA'
    }));

  let currentOffset = 0;

  return (
    <div className="p-5 rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] mb-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">Expense Breakdown</h3>
      
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* SVG Donut */}
        <div className="relative w-[160px] h-[160px] flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
            {segments.map((seg, i) => {
              const dashLength = seg.percentage * circumference;
              const dashOffset = -currentOffset;
              currentOffset += dashLength;
              
              // Add a small gap between segments unless it's a single 100% segment
              const strokeDasharray = `${Math.max(dashLength - 2, 0)} ${circumference}`;

              return (
                <circle
                  key={seg.category}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out-expo hover:stroke-[20px] cursor-pointer"
                  style={{ transformOrigin: 'center' }}
                />
              );
            })}
          </svg>
          {/* Inner Total */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Total</span>
            <span className="font-mono text-sm font-bold text-foreground">
              ₹{total > 9999 ? (total / 1000).toFixed(1) + 'k' : total}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full grid grid-cols-2 gap-3">
          {segments.map((seg) => (
            <div key={seg.category} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: seg.color, boxShadow: `0 0 8px ${seg.color}40` }}
              />
              <div className="flex flex-col">
                <span className="text-xs text-foreground font-medium truncate">{seg.category}</span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  ₹{Math.round(seg.amount).toLocaleString('en-IN')} ({Math.round(seg.percentage * 100)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
