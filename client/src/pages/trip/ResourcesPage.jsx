import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Link as LinkIcon, Plus, Trash2 } from 'lucide-react';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';

export default function ResourcesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchTrip = async () => {
      try {
        const tripSnap = await getDoc(doc(db, 'trips', id));
        if (tripSnap.exists()) {
          setTrip({ id: tripSnap.id, ...tripSnap.data() });
        }
      } catch (err) {
        console.error('Failed to load trip', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

  const handleAddResource = async () => {
    if (!newTitle.trim() || !newUrl.trim()) {
      toast.error('Title and URL are required');
      return;
    }
    
    // Auto-fix URL scheme
    let urlToSave = newUrl.trim();
    if (!/^https?:\/\//i.test(urlToSave)) {
      urlToSave = 'https://' + urlToSave;
    }

    setSubmitting(true);
    try {
      const resource = {
        id: Date.now().toString(),
        title: newTitle.trim(),
        url: urlToSave,
        added_by_name: user?.displayName || 'A member',
        added_at: new Date().toISOString()
      };
      
      await updateDoc(doc(db, 'trips', id), {
        resources: arrayUnion(resource)
      });
      
      setTrip(prev => ({ ...prev, resources: [...(prev.resources || []), resource] }));
      setNewTitle('');
      setNewUrl('');
      setShowAdd(false);
      toast.success('Resource added');
    } catch {
      toast.error('Failed to add resource');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (resource) => {
    try {
      await updateDoc(doc(db, 'trips', id), {
        resources: arrayRemove(resource)
      });
      setTrip(prev => ({
        ...prev,
        resources: prev.resources.filter(r => r.id !== resource.id)
      }));
      toast.success('Resource removed');
    } catch {
      toast.error('Failed to remove resource');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading resources...</div>;
  }

  const resources = trip?.resources || [];

  return (
    <div className="p-4 md:p-8 max-w-[800px] mx-auto animate-fade-up pb-24 md:pb-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white/[0.06] text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Trip Resources</h1>
            <p className="text-sm text-muted-foreground">Shared links, documents, and bookings</p>
          </div>
        </div>
        {!showAdd && (
          <Button onClick={() => setShowAdd(true)} size="sm">
            <Plus className="w-4 h-4 mr-1" /> Add Link
          </Button>
        )}
      </div>

      {showAdd && (
        <div className="mb-6 p-4 rounded-xl bg-white/[0.02] ring-1 ring-white/[0.06] space-y-3">
          <Input 
            placeholder="Title (e.g. Flight Tickets)" 
            value={newTitle} 
            onChange={(e) => setNewTitle(e.target.value)} 
            className="bg-background"
          />
          <Input 
            placeholder="URL (e.g. drive.google.com/...)" 
            value={newUrl} 
            onChange={(e) => setNewUrl(e.target.value)} 
            className="bg-background"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAddResource} disabled={submitting}>
              {submitting ? 'Adding...' : 'Save Link'}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground bg-white/[0.02] rounded-2xl ring-1 ring-white/[0.06]">
            <LinkIcon className="w-8 h-8 mb-4 opacity-50" />
            <p>No resources added yet.</p>
            <p className="text-sm mt-1">Paste a Google Drive or Dropbox link to share with the group.</p>
          </div>
        ) : (
          resources.map((res) => (
            <div key={res.id} className="p-4 rounded-xl bg-white/[0.03] ring-1 ring-white/[0.06] flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <a href={res.url} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline flex items-center gap-1.5 truncate">
                  {res.title}
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  Added by {res.added_by_name} • {new Date(res.added_at).toLocaleDateString()}
                </p>
              </div>
              <button 
                onClick={() => handleDelete(res)}
                className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
