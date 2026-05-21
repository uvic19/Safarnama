import TripCard from '../../components/trip/TripCard';
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchTrips = async () => {
      try {
        // member_ids is a flat array field on each trip doc containing all member uids.
        // This allows a single queryable field check without needing subcollection exists().
        const q = query(
          collection(db, 'trips'),
          where('member_ids', 'array-contains', user.uid)
        );
        const snap = await getDocs(q);
        setTrips(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error('Failed to load trips', e);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, [user]);

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
        </div>
      )}
    </div>
  );
}
