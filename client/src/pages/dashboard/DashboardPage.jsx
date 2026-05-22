import TripCard from '../../components/trip/TripCard';
import { useEffect, useState } from 'react';
import { TEMPLATES } from '../../lib/templates';
import { tripService } from '../../services/tripService';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { KeyRound, Plus, Wallet } from 'lucide-react';
import { userService } from '../../services/userService';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export default function DashboardPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // UPI Prompt State
  const [showUpiPrompt, setShowUpiPrompt] = useState(false);
  const [upiIdInput, setUpiIdInput] = useState('');
  const [savingUpi, setSavingUpi] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchTrips = async () => {
      try {
        const q = query(
          collection(db, 'trips'),
          where('member_ids', 'array-contains', user.uid)
        );
        const snap = await getDocs(q);
        const loadedTrips = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        
        // Auto-seed default trip if they have no trips and haven't been seeded yet
        const profile = await userService.getUserProfile(user.uid);
        if (loadedTrips.length === 0 && !profile?.has_seeded_default_trip) {
          try {
            const goaTemplate = TEMPLATES[0]; // Goa Weekend Getaway
            const today = new Date();
            const endDate = new Date(today);
            endDate.setDate(endDate.getDate() + (goaTemplate.duration_days - 1));

            const tripId = await tripService.createTrip({
              name: goaTemplate.name,
              destinations: goaTemplate.destinations,
              start_date: today.toISOString().split('T')[0],
              end_date: endDate.toISOString().split('T')[0],
              mode: 'SOLO',
              base_currency: 'INR',
              total_budget: goaTemplate.estimated_budget,
              template_itinerary: goaTemplate.itinerary
            }, user.uid);
            
            await userService.updateUserProfile(user.uid, { has_seeded_default_trip: true });
            
            // Refetch after seeding
            const newSnap = await getDocs(q);
            setTrips(newSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
          } catch (seedErr) {
            console.error('Failed to auto-seed default trip', seedErr);
            setTrips(loadedTrips);
          }
        } else {
          setTrips(loadedTrips);
        }
      } catch (e) {
        console.error('Failed to load trips', e);
      } finally {
        setLoading(false);
      }

      // Check UPI setup globally
      try {
        const profile = await userService.getUserProfile(user.uid);
        if (!profile?.upi_id && !profile?.upi_prompt_dismissed) {
          setShowUpiPrompt(true);
        }
      } catch (e) {
        console.error('Failed to load user profile for UPI check', e);
      }
    };
    fetchTrips();
  }, [user]);

  const handleSaveUpi = async () => {
    setSavingUpi(true);
    try {
      await userService.updateUserProfile(user.uid, { upi_id: upiIdInput, upi_prompt_dismissed: true });
      setShowUpiPrompt(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingUpi(false);
    }
  };

  const handleDismissUpi = async () => {
    try {
      await userService.updateUserProfile(user.uid, { upi_prompt_dismissed: true });
      setShowUpiPrompt(false);
    } catch (err) {
      console.error(err);
      setShowUpiPrompt(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto animate-fade-up">
      <div className="mb-10">
        <h2 className="font-display text-3xl font-bold text-white mb-2 tracking-tight">Welcome back</h2>
        <p className="text-zinc-500 font-body font-light">Here are your recent trips.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-[180px] rounded-3xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {trips.map((trip) => (
            <TripCard key={trip.id} {...trip} />
          ))}

          {/* Create New Trip Card */}
          <Link
            to="/trips/new"
            className="h-full min-h-[180px] rounded-3xl bg-white/[0.02] border border-dashed border-white/10 hover:border-white/30 transition-all duration-300 group flex flex-col items-center justify-center text-zinc-500 hover:text-white"
          >
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-white/10 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]">
              <Plus className="w-5 h-5" />
            </div>
            <span className="font-medium text-sm">Create New Trip</span>
          </Link>
          <Link
            to="/trips/join"
            className="h-full min-h-[180px] rounded-3xl bg-white/[0.02] border border-dashed border-white/10 hover:border-white/30 transition-all duration-300 group flex flex-col items-center justify-center text-zinc-500 hover:text-white"
          >
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-white/10 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]">
              <KeyRound className="w-5 h-5" />
            </div>
            <span className="font-medium text-sm">Join With Code</span>
          </Link>
        </div>
      )}

      {/* UPI Setup Prompt */}
      <Dialog open={showUpiPrompt} onOpenChange={(open) => {
        if (!open) handleDismissUpi();
      }}>
        <DialogContent className="sm:max-w-md bg-zinc-950 border-white/[0.06]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-500" />
              Set up faster payments
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Add your UPI ID to make settling up across all your trips instant and seamless.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={upiIdInput}
              onChange={(e) => setUpiIdInput(e.target.value)}
              placeholder="e.g., name@okbank"
              className="bg-white/[0.04] border-white/[0.06] focus-visible:ring-emerald-500/50"
            />
          </div>
          <DialogFooter className="flex gap-2 sm:justify-between flex-row">
            <Button variant="ghost" onClick={handleDismissUpi} className="text-zinc-400 hover:text-white">
              Not Now
            </Button>
            <Button onClick={handleSaveUpi} disabled={savingUpi} className="bg-emerald-500 text-black hover:bg-emerald-600">
              {savingUpi ? 'Saving...' : 'Save UPI ID'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
