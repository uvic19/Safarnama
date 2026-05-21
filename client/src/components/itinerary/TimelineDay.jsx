import { Plus } from 'lucide-react';
import StopCard from './StopCard';

function formatDayLabel(date, fallbackIndex) {
  if (!date) return `Day ${fallbackIndex + 1}`;

  const parsed = date?.toDate ? date.toDate() : new Date(date);
  if (Number.isNaN(parsed.getTime())) return `Day ${fallbackIndex + 1}`;

  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function TimelineDay({ day, dayIndex, canAddStop = false, canEditStops = false, onAddStop, onEditStop, onDeleteStop }) {
  const city = day.stops.find((stop) => stop.place_name)?.place_name;

  return (
    <section className="relative pl-7">
      <div className="absolute bottom-0 left-2 top-11 w-px bg-border" />
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="relative">
          <div className="absolute -left-[1.7rem] top-1.5 h-4 w-4 rounded-full border-2 border-background bg-foreground" />
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Day {dayIndex + 1}</p>
          <h2 className="font-display text-xl font-semibold text-foreground">
            {formatDayLabel(day.date, dayIndex)}
          </h2>
          {city && <p className="text-sm text-muted-foreground">{city}</p>}
        </div>
        {canAddStop && (
          <button
            type="button"
            onClick={() => onAddStop?.(day.date)}
            className="hidden rounded-md border border-border bg-white/[0.04] px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground sm:inline-flex"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add stop
          </button>
        )}
      </div>

      <div className="space-y-3">
        {day.stops.map((stop, index) => (
          <StopCard
            key={stop.id}
            stop={stop}
            index={index}
            canEdit={canEditStops}
            onEdit={onEditStop}
            onDelete={onDeleteStop}
          />
        ))}
      </div>

      {canAddStop && (
        <button
          type="button"
          onClick={() => onAddStop?.(day.date)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-border bg-white/[0.02] px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-ring hover:text-foreground sm:hidden"
        >
          <Plus className="h-4 w-4" />
          Add stop
        </button>
      )}
    </section>
  );
}
