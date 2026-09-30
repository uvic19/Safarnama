import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Button } from '../../components/ui/button';
import { Copy, MapPin, Calendar, Compass } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function PublicTripPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [trip, setTrip] = useState(null);
  const [itinerary, setItinerary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublicTrip = async () => {
      try {
        const tripSnap = await getDoc(doc(db, 'trips', id));
        if (!tripSnap.exists()) {
          setError('Trip not found.');
          return;
        }
        
        const data = tripSnap.data();
        if (!data.isPublic) {
          setError('This trip is private.');
          return;
        }

        setTrip({ id: tripSnap.id, ...data });

        // Fetch itinerary
        const itq = query(collection(db, 'trips', id, 'itinerary'), orderBy('order_index', 'asc'));
        const itSnap = await getDocs(itq);
        setItinerary(itSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        
      } catch (err) {
        console.error(err);
        setError('Failed to load trip.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPublicTrip();
  }, [id]);

  const handleClone = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: `/t/${id}` } });
      return;
    }
    
    // Construct template object
    const templateData = {
      id: trip.id,
      name: trip.name,
      duration: trip.end_date ? Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / 86400000) : 1,
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800',
      destinations: trip.destinations || [],
      itinerary: itinerary.map(item => ({
        place_name: item.place_name,
        notes: item.notes,
        day: item.day_index || 1,
        lat: item.lat,
        lng: item.lng
      }))
    };

    navigate('/trips/new', { state: { template: templateData } });
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex flex-col items-center justify-center text-muted-foreground animate-pulse">Loading trip details...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <Compass className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
        <h1 className="text-xl font-bold mb-2">{error}</h1>
        <Link to="/" className="text-primary hover:underline">Go to Safarnama Home</Link>
      </div>
    );
  }

  const daysCount = trip.end_date ? Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / 86400000) || 1 : 1;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero */}
      <div className="relative h-[40vh] min-h-[300px] w-full bg-zinc-900">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10" />
        <div className="absolute bottom-0 left-0 w-full p-6 z-20">
          <div className="max-w-[800px] mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-medium backdrop-blur-md border border-white/20 mb-4">
              <Compass className="w-3.5 h-3.5" /> Public Template
            </span>
            <h1 className="font-display text-4xl font-bold text-foreground mb-2">{trip.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {trip.destinations?.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> {trip.destinations.join(' · ')}
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> {daysCount} Days
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto p-6 space-y-8">
        <div className="bg-white/[0.02] p-6 rounded-2xl ring-1 ring-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg">Like this itinerary?</h3>
            <p className="text-sm text-muted-foreground">Clone it to your account and customize it with your friends.</p>
          </div>
          <Button onClick={handleClone} className="w-full sm:w-auto h-12 font-semibold">
            <Copy className="w-4 h-4 mr-2" /> Clone this Template
          </Button>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Itinerary Preview</h2>
          {itinerary.length === 0 ? (
            <p className="text-muted-foreground">No stops added to this itinerary yet.</p>
          ) : (
            <div className="space-y-4">
              {itinerary.map((stop, i) => (
                <div key={stop.id} className="p-4 rounded-xl bg-white/[0.03] ring-1 ring-white/[0.06]">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs font-medium">{i + 1}</span>
                    <h4 className="font-semibold text-foreground">{stop.place_name || 'Untitled stop'}</h4>
                  </div>
                  {stop.notes && <p className="text-sm text-muted-foreground ml-9">{stop.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
