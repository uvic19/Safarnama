import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, ExternalLink, Plus, MapPin } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import LocationPicker from '../../components/itinerary/LocationPicker';

export default function SuggestionsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [trip, setTrip] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('map');
  const [newLocation, setNewLocation] = useState({ place_name: '', lat: '', lng: '' });
  const [manualText, setManualText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    // Fetch trip to check Kaptan status
    const unsubTrip = onSnapshot(doc(db, 'trips', id), (docSnap) => {
      if (docSnap.exists()) {
        setTrip({ id: docSnap.id, ...docSnap.data() });
      }
    });

    const q = query(collection(db, 'trips', id, 'suggestions'), orderBy('created_at', 'desc'));
    const unsubSugg = onSnapshot(q, (snap) => {
      setSuggestions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    
    return () => {
      unsubTrip();
      unsubSugg();
    };
  }, [id]);

  const isKaptan = trip?.kaptan_id === user?.uid;

  const handleAddSuggestion = async () => {
    const isManual = activeTab === 'manual';
    const finalPlaceName = isManual ? manualText : newLocation.place_name;

    if (!finalPlaceName?.trim()) {
      toast.error('Please enter or select a suggestion');
      return;
    }
    
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'trips', id, 'suggestions'), {
        place_name: finalPlaceName,
        lat: isManual ? null : (newLocation.lat || null),
        lng: isManual ? null : (newLocation.lng || null),
        created_by: user.uid,
        created_by_name: user.displayName || 'Traveler',
        created_at: serverTimestamp()
      });
      setNewLocation({ place_name: '', lat: '', lng: '' });
      setManualText('');
      setIsAddOpen(false);
      toast.success('Suggestion added!');
    } catch (err) {
      toast.error('Failed to add suggestion');
    } finally {
      setSubmitting(false);
    }
  };

  const isUrl = (text) => {
    if (!text) return false;
    try { return Boolean(new URL(text)); } catch(e) { return false; }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading suggestions...</div>;

  return (
    <div className="p-4 md:p-8 max-w-[800px] mx-auto flex flex-col h-[100dvh] pb-24 md:pb-8">
      <div className="flex items-center justify-between gap-3 mb-6 shrink-0 pt-4 md:pt-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white/[0.06] text-muted-foreground md:hidden">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Suggestions</h1>
            <p className="text-sm text-muted-foreground">Suggest places to add to the itinerary</p>
          </div>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="shrink-0 gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Suggestion</span>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {suggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground bg-white/[0.02] rounded-2xl ring-1 ring-white/[0.06] h-full">
            <MapPin className="w-8 h-8 mb-4 opacity-50" />
            <p>No locations suggested yet. Be the first to suggest a place!</p>
          </div>
        ) : (
          suggestions.map(s => {
            const placeText = s.place_name || s.text || 'Unknown Location';
            const hasCoords = s.lat && s.lng;
            return (
              <div key={s.id} className="bg-white/[0.03] p-4 rounded-xl ring-1 ring-white/[0.06]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground mb-1 font-medium">{s.created_by_name} suggested:</div>
                    {isUrl(placeText) ? (
                      <a href={placeText} target="_blank" rel="noreferrer" className="text-primary flex items-center gap-2 hover:underline break-all">
                        <ExternalLink className="w-4 h-4 shrink-0" />
                        {placeText}
                      </a>
                    ) : (
                      <div className="flex items-start gap-2">
                        {hasCoords && <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />}
                        <p className="text-sm text-foreground whitespace-pre-wrap font-medium">{placeText}</p>
                      </div>
                    )}
                  </div>
                  {isKaptan && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs shrink-0 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary" 
                      onClick={() => navigate(`/trips/${id}/itinerary`, { state: { prefillSuggestion: { place_name: placeText, lat: s.lat || '', lng: s.lng || '' } } })}
                    >
                      <Plus className="w-3 h-3 mr-1" /> Add to Itinerary
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Suggest a Location</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex bg-white/[0.05] p-1 rounded-lg mb-4">
              <button 
                onClick={() => setActiveTab('map')} 
                className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${activeTab === 'map' ? 'bg-white/10 text-white shadow-sm' : 'text-muted-foreground hover:text-white'}`}
              >
                Search on Map
              </button>
              <button 
                onClick={() => setActiveTab('manual')} 
                className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${activeTab === 'manual' ? 'bg-white/10 text-white shadow-sm' : 'text-muted-foreground hover:text-white'}`}
              >
                Enter Link/Text
              </button>
            </div>
            
            {activeTab === 'map' ? (
              <LocationPicker
                value={newLocation}
                onChange={setNewLocation}
              />
            ) : (
              <div className="space-y-2 pt-2">
                <label className="text-sm font-medium text-foreground">Suggestion details</label>
                <Input 
                  value={manualText} 
                  onChange={e => setManualText(e.target.value)} 
                  placeholder="Paste a link or type a place name..." 
                  className="w-full"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSuggestion} disabled={submitting || (activeTab === 'map' ? !newLocation.place_name?.trim() : !manualText.trim())}>
              {submitting ? 'Adding...' : 'Add Suggestion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
