import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, ExternalLink, Plus } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';

export default function SuggestionsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSuggestion, setNewSuggestion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const q = query(collection(db, 'trips', id, 'suggestions'), orderBy('created_at', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setSuggestions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [id]);

  const handleAddSuggestion = async (e) => {
    e.preventDefault();
    if (!newSuggestion.trim()) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'trips', id, 'suggestions'), {
        text: newSuggestion,
        created_by: user.uid,
        created_by_name: user.displayName || 'Traveler',
        created_at: serverTimestamp()
      });
      setNewSuggestion('');
    } catch (err) {
      toast.error('Failed to add suggestion');
    } finally {
      setSubmitting(false);
    }
  };

  const isUrl = (text) => {
    try { return Boolean(new URL(text)); } catch(e) { return false; }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading suggestions...</div>;

  return (
    <div className="p-4 md:p-8 max-w-[800px] mx-auto flex flex-col h-[100dvh] pb-24 md:pb-8">
      <div className="flex items-center gap-3 mb-6 shrink-0 pt-4 md:pt-0">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white/[0.06] text-muted-foreground md:hidden">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Suggestions</h1>
          <p className="text-sm text-muted-foreground">Drop links, places, or ideas here</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 -mr-2 flex flex-col-reverse">
        {suggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground bg-white/[0.02] rounded-2xl ring-1 ring-white/[0.06] mb-auto">
            <MessageSquare className="w-8 h-8 mb-4 opacity-50" />
            <p>No suggestions yet. Drop a link or an idea to get started!</p>
          </div>
        ) : (
          suggestions.map(s => (
            <div key={s.id} className="bg-white/[0.03] p-4 rounded-xl ring-1 ring-white/[0.06]">
              <div className="text-xs text-muted-foreground mb-1 font-medium">{s.created_by_name}</div>
              {isUrl(s.text) ? (
                <a href={s.text} target="_blank" rel="noreferrer" className="text-primary flex items-center gap-2 hover:underline break-all">
                  <ExternalLink className="w-4 h-4 shrink-0" />
                  {s.text}
                </a>
              ) : (
                <p className="text-sm text-foreground whitespace-pre-wrap">{s.text}</p>
              )}
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleAddSuggestion} className="mt-4 pt-4 border-t border-border flex gap-2 shrink-0 relative bg-background">
        <Input 
          value={newSuggestion} 
          onChange={e => setNewSuggestion(e.target.value)} 
          placeholder="Type a suggestion or paste a link..." 
          className="flex-1"
        />
        <Button type="submit" disabled={submitting || !newSuggestion.trim()} className="shrink-0">
          <Plus className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline">Add</span>
        </Button>
      </form>
    </div>
  );
}
