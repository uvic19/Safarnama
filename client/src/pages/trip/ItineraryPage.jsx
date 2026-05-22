import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ArrowLeft, Camera, Compass, Dumbbell, Lock, MapPinned, Plus, UtensilsCrossed, Unlock, Hotel } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import LocationPicker from '../../components/itinerary/LocationPicker';
import MapView from '../../components/itinerary/MapView';
import TimelineDay from '../../components/itinerary/TimelineDay';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const EMPTY_FORM = {
  stop_type: 'TOURIST',
  place_name: '',
  date: '',
  arrival_time: '',
  stay_name: '',
  stay_checkin: '',
  stay_booking_ref: '',
  transport_details: '',
  drive_link: '',
  notes: '',
  estimated_cost: '',
  lat: '',
  lng: '',
};

const STOP_TYPES = [
  { value: 'TOURIST', label: 'Tourist place', icon: Camera },
  { value: 'STAY', label: 'Stay', icon: Hotel },
  { value: 'FOOD', label: 'Food', icon: UtensilsCrossed },
  { value: 'ACTIVITY', label: 'Activity', icon: Dumbbell },
  { value: 'TRANSIT', label: 'Transit', icon: Compass },
];

function SkeletonBlock({ className = '' }) {
  return <div className={`animate-pulse rounded-2xl bg-white/[0.06] ${className}`} />;
}

function toDateKey(value) {
  if (!value) return 'unscheduled';
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return 'unscheduled';
  return date.toISOString().slice(0, 10);
}

function toInputDate(value) {
  const date = value?.toDate ? value.toDate() : value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function normalizeStops(stops) {
  return [...stops].sort((a, b) => {
    const dateA = toDateKey(a.date);
    const dateB = toDateKey(b.date);
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    return Number(a.order_index || 0) - Number(b.order_index || 0);
  });
}

function groupStops(stops) {
  const grouped = normalizeStops(stops).reduce((acc, stop) => {
    const key = toDateKey(stop.date);
    if (!acc[key]) acc[key] = { date: stop.date, stops: [] };
    acc[key].stops.push(stop);
    return acc;
  }, {});

  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value);
}

export default function ItineraryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [trip, setTrip] = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingStopId, setEditingStopId] = useState(null);
  const [stopToDelete, setStopToDelete] = useState(null);

  useEffect(() => {
    if (!id) return undefined;

    let unsubStops = () => {};

    const loadTrip = async () => {
      try {
        const tripDoc = await getDoc(doc(db, 'trips', id));
        if (tripDoc.exists()) setTrip({ id: tripDoc.id, ...tripDoc.data() });

        const itineraryQuery = query(collection(db, 'trips', id, 'itinerary'), orderBy('order_index', 'asc'));
        unsubStops = onSnapshot(
          itineraryQuery,
          (snapshot) => {
            setStops(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
            setLoading(false);
          },
          (error) => {
            console.error('Failed to listen to itinerary stops', error);
            toast.error('No permission to load itinerary stops');
            setLoading(false);
          },
        );
      } catch (error) {
        console.error('Failed to load itinerary', error);
        toast.error('Could not load itinerary');
        setLoading(false);
      }
    };

    loadTrip();
    return () => unsubStops();
  }, [id]);

  const isKaptan = trip?.kaptan_id === user?.uid;
  const timelineDays = useMemo(() => groupStops(stops), [stops]);
  const mappedStops = useMemo(
    () =>
      normalizeStops(stops).map((stop) => ({
        ...stop,
        latitude: stop.lat,
        longitude: stop.lng,
        dateLabel: toInputDate(stop.date),
      })),
    [stops],
  );

  const openAddStop = (date, overrideForm = {}) => {
    setEditingStopId(null);
    setForm({
      ...EMPTY_FORM,
      date: date ? toInputDate(date) : toInputDate(trip?.start_date),
      order_index: stops.length,
      ...overrideForm
    });
    setDialogOpen(true);
  };

  useEffect(() => {
    if (location.state?.prefillSuggestion && trip && !dialogOpen && !loading) {
      // Small timeout to allow render to settle
      setTimeout(() => {
        const sugg = location.state.prefillSuggestion;
        const placeName = typeof sugg === 'string' ? sugg : sugg.place_name;
        const lat = typeof sugg === 'string' ? '' : (sugg.lat || '');
        const lng = typeof sugg === 'string' ? '' : (sugg.lng || '');
        
        openAddStop(null, { 
          place_name: placeName, 
          lat, 
          lng, 
          notes: 'From suggestion' 
        });
        // Clear the state so it doesn't reopen if they close it
        navigate(location.pathname, { replace: true, state: {} });
      }, 100);
    }
  }, [location.state?.prefillSuggestion, trip, dialogOpen, loading, navigate, location.pathname]);

  const openEditStop = (stop) => {
    setEditingStopId(stop.id);
    setForm({
      ...EMPTY_FORM,
      stop_type: stop.stop_type || 'TOURIST',
      place_name: stop.place_name || '',
      date: toInputDate(stop.date),
      arrival_time: stop.arrival_time || '',
      stay_name: stop.stay_name || '',
      stay_checkin: stop.stay_checkin || '',
      stay_booking_ref: stop.stay_booking_ref || '',
      transport_details: stop.transport_details || '',
      drive_link: stop.drive_link || '',
      notes: stop.notes || '',
      estimated_cost: stop.estimated_cost ? String(stop.estimated_cost) : '',
      lat: stop.lat ?? '',
      lng: stop.lng ?? '',
      order_index: stop.order_index ?? 0,
    });
    setDialogOpen(true);
  };

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSaveStop = async (event) => {
    event.preventDefault();
    if (!isKaptan) return;

    if (!form.place_name.trim()) {
      toast.error('Add a place name');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        place_name: form.place_name.trim(),
        stop_type: form.stop_type || 'TOURIST',
        date: form.date ? new Date(`${form.date}T00:00:00`) : null,
        arrival_time: form.arrival_time || null,
        stay_name: form.stop_type === 'STAY' ? form.stay_name.trim() || null : null,
        stay_checkin: form.stop_type === 'STAY' ? form.stay_checkin || null : null,
        stay_booking_ref: form.stop_type === 'STAY' ? form.stay_booking_ref.trim() || null : null,
        transport_details: form.stop_type === 'TRANSIT' ? form.transport_details.trim() || null : null,
        drive_link: form.drive_link.trim() || null,
        notes: form.notes.trim() || null,
        estimated_cost: form.estimated_cost ? Number(form.estimated_cost) : null,
        lat: form.lat ? Number(form.lat) : null,
        lng: form.lng ? Number(form.lng) : null,
        order_index: Number(form.order_index ?? stops.length),
        updated_at: serverTimestamp(),
      };

      if (editingStopId) {
        await updateDoc(doc(db, 'trips', id, 'itinerary', editingStopId), payload);
      } else {
        await addDoc(collection(db, 'trips', id, 'itinerary'), {
          ...payload,
          created_at: serverTimestamp(),
        });
      }

      setDialogOpen(false);
      setForm(EMPTY_FORM);
      setEditingStopId(null);
      toast.success(editingStopId ? 'Stop updated' : 'Stop added to itinerary');
    } catch (error) {
      console.error('Failed to save itinerary stop', error);
      toast.error('Could not save stop');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStop = async () => {
    if (!isKaptan || !stopToDelete) return;

    try {
      await deleteDoc(doc(db, 'trips', id, 'itinerary', stopToDelete.id));
      setStopToDelete(null);
      toast.success('Stop deleted');
    } catch (error) {
      console.error('Failed to delete itinerary stop', error);
      toast.error('Could not delete stop');
    }
  };

  const toggleLock = async () => {
    if (!isKaptan || !trip) return;

    try {
      const nextValue = !trip.itinerary_locked;
      await updateDoc(doc(db, 'trips', id), { itinerary_locked: nextValue });
      setTrip((current) => ({ ...current, itinerary_locked: nextValue }));
      toast.success(nextValue ? 'Itinerary locked' : 'Itinerary unlocked');
    } catch (error) {
      console.error('Failed to update itinerary lock', error);
      toast.error('Could not update lock state');
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[980px] space-y-6 p-4 pb-24 md:p-8">
        <SkeletonBlock className="h-10 w-60" />
        <SkeletonBlock className="h-[35vh] min-h-[300px]" />
        <SkeletonBlock className="h-32" />
        <SkeletonBlock className="h-32" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
        <p>Trip not found.</p>
        <button onClick={() => navigate('/dashboard')} className="text-sm underline">Back to dashboard</button>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-[980px] p-4 pb-24 md:p-8 md:pb-8 animate-fade-up">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <button
              type="button"
              onClick={() => navigate(`/trips/${id}`)}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
              aria-label="Back to trip"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-bold text-foreground">Itinerary</h1>
              <p className="truncate text-sm text-muted-foreground">{trip.name}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isKaptan && (
              <button
                type="button"
                onClick={toggleLock}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-white/[0.04] px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground"
                aria-pressed={!!trip.itinerary_locked}
              >
                {trip.itinerary_locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                {trip.itinerary_locked ? 'Locked' : 'Unlocked'}
              </button>
            )}
            {isKaptan && (
              <Button type="button" onClick={() => openAddStop()} className="h-10 px-4">
                <Plus className="h-4 w-4" />
                Add Stop
              </Button>
            )}
          </div>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.06]">
            <p className="text-xs text-muted-foreground">Stops</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-foreground">{stops.length}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.06]">
            <p className="text-xs text-muted-foreground">Mapped</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-foreground">
              {mappedStops.filter((stop) => Number.isFinite(Number(stop.lat)) && Number.isFinite(Number(stop.lng))).length}
            </p>
          </div>
          <div className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.06]">
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="mt-1 inline-flex items-center gap-2 font-medium text-foreground">
              {trip.itinerary_locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              {trip.itinerary_locked ? 'Locked' : 'Open'}
            </p>
          </div>
        </div>

        <MapView stops={mappedStops} className="mb-8" />

        {stops.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-white/[0.02] px-6 py-16 text-center">
            <MapPinned className="mb-4 h-10 w-10 text-muted-foreground" />
            <h2 className="font-display text-xl font-semibold text-foreground">No itinerary yet</h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Add the first stop to build a day-by-day route for this trip.
            </p>
            {isKaptan && (
              <Button type="button" onClick={() => openAddStop()} className="mt-5">
                <Plus className="h-4 w-4" />
                Add first stop
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {timelineDays.map((day, index) => (
              <TimelineDay
                key={toDateKey(day.date)}
                day={day}
                dayIndex={index}
                canAddStop={isKaptan}
                canEditStops={isKaptan}
                onAddStop={openAddStop}
                onEditStop={openEditStop}
                onDeleteStop={setStopToDelete}
              />
            ))}
          </div>
        )}
      </div>

      {isKaptan && (
        <button
          type="button"
          onClick={() => openAddStop()}
          className="fixed bottom-20 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-150 hover:scale-105 active:scale-95 md:hidden"
          aria-label="Add itinerary stop"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) setEditingStopId(null);
      }}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <form onSubmit={handleSaveStop}>
            <DialogHeader>
              <DialogTitle>{editingStopId ? 'Edit itinerary stop' : 'Add itinerary stop'}</DialogTitle>
              <DialogDescription>
                Choose what kind of stop this is, then search or pin the location on the map.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Stop type</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {STOP_TYPES.map((type) => {
                    const Icon = type.icon;
                    const active = form.stop_type === type.value;

                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => updateForm('stop_type', type.value)}
                        className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-md border px-3 py-3 text-center text-sm font-medium transition-colors ${
                          active
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-white/[0.03] text-muted-foreground hover:bg-white/[0.07] hover:text-foreground'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Location</Label>
                <LocationPicker
                  value={form}
                  onChange={(location) => {
                    setForm((current) => ({
                      ...current,
                      place_name: location.place_name || current.place_name,
                      lat: location.lat ?? current.lat,
                      lng: location.lng ?? current.lng,
                    }));
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={form.date} onChange={(event) => updateForm('date', event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="arrival_time">Arrival time</Label>
                <Input id="arrival_time" type="time" value={form.arrival_time} onChange={(event) => updateForm('arrival_time', event.target.value)} />
              </div>

              {form.stop_type === 'STAY' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="stay_name">Stay name</Label>
                    <Input id="stay_name" value={form.stay_name} onChange={(event) => updateForm('stay_name', event.target.value)} placeholder="Hotel / homestay" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stay_checkin">Check-in</Label>
                    <Input id="stay_checkin" type="time" value={form.stay_checkin} onChange={(event) => updateForm('stay_checkin', event.target.value)} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="stay_booking_ref">Booking reference</Label>
                    <Input id="stay_booking_ref" value={form.stay_booking_ref} onChange={(event) => updateForm('stay_booking_ref', event.target.value)} placeholder="MMT / Airbnb ref" />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="estimated_cost">Estimated cost</Label>
                <Input id="estimated_cost" inputMode="numeric" value={form.estimated_cost} onChange={(event) => updateForm('estimated_cost', event.target.value)} placeholder="2500" />
              </div>

              {form.stop_type === 'TRANSIT' && (
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="transport_details">Transport details</Label>
                  <Input id="transport_details" value={form.transport_details} onChange={(event) => updateForm('transport_details', event.target.value)} placeholder="Volvo bus, train PNR, flight number" />
                </div>
              )}

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="drive_link">
                  {form.stop_type === 'STAY' || form.stop_type === 'TRANSIT' ? 'Booking / ticket link' : 'Reference link'}
                </Label>
                <Input id="drive_link" value={form.drive_link} onChange={(event) => updateForm('drive_link', event.target.value)} placeholder="Google Drive, Maps, booking, or ticket URL" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  value={form.notes}
                  onChange={(event) => updateForm('notes', event.target.value)}
                  className="min-h-24 w-full rounded-md border border-input bg-transparent px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  placeholder={
                    form.stop_type === 'FOOD'
                      ? 'What to try, booking note, best time...'
                      : form.stop_type === 'ACTIVITY'
                        ? 'Duration, gear, booking note, entry rule...'
                        : form.stop_type === 'STAY'
                          ? 'Landmark, local contact, room note...'
                          : 'Landmark, timing, local contact...'
                  }
                />
              </div>
            </div>

            <DialogFooter className="mt-5">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingStopId ? 'Save changes' : 'Add stop'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!stopToDelete}
        onOpenChange={(open) => { if (!open) setStopToDelete(null); }}
        title="Delete Stop"
        description={`Delete ${stopToDelete?.place_name || 'this stop'} from the itinerary?`}
        confirmText="Delete"
        onConfirm={handleDeleteStop}
      />
    </>
  );
}
