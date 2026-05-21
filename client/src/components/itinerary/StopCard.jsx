import { CalendarClock, Camera, Compass, Dumbbell, ExternalLink, Hotel, IndianRupee, MapPin, Pencil, StickyNote, TrainFront, Trash2, UtensilsCrossed } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

const STOP_TYPE_META = {
  TOURIST: { label: 'Tourist place', icon: Camera, className: 'bg-blue-500/10 text-blue-300 border-blue-500/20' },
  STAY: { label: 'Stay', icon: Hotel, className: 'bg-violet-500/10 text-violet-300 border-violet-500/20' },
  FOOD: { label: 'Food', icon: UtensilsCrossed, className: 'bg-amber-500/10 text-amber-300 border-amber-500/20' },
  ACTIVITY: { label: 'Activity', icon: Dumbbell, className: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' },
  TRANSIT: { label: 'Transit', icon: Compass, className: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20' },
};

function Detail({ icon: Icon, label, children }) {
  if (!children) return null;

  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="break-words text-foreground">{children}</div>
      </div>
    </div>
  );
}

function formatCost(value) {
  const amount = Number(value || 0);
  if (!amount) return null;
  return `₹${amount.toLocaleString('en-IN')}`;
}

export default function StopCard({ stop, index, canEdit = false, onEdit, onDelete, className }) {
  const typeMeta = STOP_TYPE_META[stop.stop_type || 'TOURIST'] || STOP_TYPE_META.TOURIST;
  const TypeIcon = typeMeta.icon;

  const stayDetails = [
    stop.stay_name,
    stop.stay_checkin && `Check-in ${stop.stay_checkin}`,
    stop.stay_booking_ref && `Ref ${stop.stay_booking_ref}`,
  ].filter(Boolean).join(' · ');

  const lat = Number(stop.lat ?? stop.latitude);
  const lng = Number(stop.lng ?? stop.longitude);
  const coordinates = Number.isFinite(lat) && Number.isFinite(lng)
    ? `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    : null;

  return (
    <article className={cn('p-[1.5px] rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06]', className)}>
      <div className="rounded-[calc(1rem-1.5px)] bg-card p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
            {index + 1}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <span className={cn('mb-2 inline-flex w-fit items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium', typeMeta.className)}>
                  <TypeIcon className="h-3.5 w-3.5" />
                  {typeMeta.label}
                </span>
                <h3 className="truncate font-display text-lg font-semibold text-foreground">{stop.place_name || 'Untitled stop'}</h3>
                {stop.arrival_time && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <CalendarClock className="h-4 w-4" />
                    <span className="font-mono">{stop.arrival_time}</span>
                  </p>
                )}
              </div>
              {formatCost(stop.estimated_cost) && (
                <span className="inline-flex w-fit items-center gap-1 rounded-md border border-border bg-white/[0.04] px-2.5 py-1 font-mono text-sm text-foreground">
                  <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
                  {formatCost(stop.estimated_cost).replace('₹', '')}
                </span>
              )}
              {canEdit && (
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => onEdit?.(stop)} className="h-8 px-2.5">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button type="button" variant="destructive" size="sm" onClick={() => onDelete?.(stop)} className="h-8 px-2.5">
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Detail icon={MapPin} label="Coordinates">{coordinates}</Detail>
              <Detail icon={TrainFront} label="Transport">{stop.transport_details}</Detail>
              <Detail icon={Hotel} label="Stay">{stayDetails}</Detail>
              <Detail icon={StickyNote} label="Notes">{stop.notes}</Detail>
            </div>

            {stop.drive_link && (
              <a
                href={stop.drive_link}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline"
              >
                Open booking attachment
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
