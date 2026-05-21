import { Calendar, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TripCard({
  id,
  name,
  destinations = [],
  start_date,
  end_date,
  member_ids = [],
  mode,
  status = ''
}) {
  // Status colors logic
  const getStatusColor = (status = '') => {
    switch(status.toLowerCase()) {
      case 'planning': return 'bg-blue-500/10 text-blue-400 ring-blue-500/20';
      case 'confirmed': return 'bg-violet-500/10 text-violet-400 ring-violet-500/20';
      case 'ongoing': return 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20';
      case 'completed': return 'bg-zinc-500/10 text-zinc-400 ring-zinc-500/20';
      case 'archived': return 'bg-zinc-700/10 text-zinc-500 ring-zinc-700/20';
      default: return 'bg-white/5 text-white ring-white/10';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch (e) {
      return dateStr;
    }
  };

  const destinationText = destinations.length > 0 ? destinations.join(' · ') : 'No destination';
  const dateText = start_date || end_date 
    ? `${formatDate(start_date)} - ${formatDate(end_date)}`
    : 'Dates not set';

  return (
    <Link to={`/trips/${id}`} className="block group">
      <div className="p-[2px] rounded-3xl bg-white/[0.02] ring-1 ring-white/[0.06] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-1 group-hover:ring-white/[0.12]">
        <div className="rounded-[calc(1.5rem-2px)] bg-[#121214] p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -z-10 group-hover:bg-white/10 transition-colors duration-700"></div>

          <div className="flex justify-between items-start mb-8">
            <div className="min-w-0 pr-2 flex-1">
              <h3 className="font-display text-xl font-semibold text-white mb-1 group-hover:text-zinc-200 transition-colors truncate">{name}</h3>
              <p className="font-body text-sm text-zinc-500 truncate">{destinationText}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ring-1 flex-shrink-0 ${getStatusColor(status)}`}>
              {status}
            </span>
          </div>

          <div className="flex items-center justify-between text-zinc-400">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-zinc-500" />
              <span className="font-mono text-xs">{dateText}</span>
            </div>
            
            <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg">
              <Users className="w-3.5 h-3.5 text-zinc-500" />
              <span className="font-mono text-xs font-medium text-zinc-300">
                {mode === 'SOLO' ? 'Solo' : `${member_ids?.length || 1}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
