import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity } from 'lucide-react';
import { collection, query, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function ActivityPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tripName, setTripName] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchLogs = async () => {
      try {
        const tripSnap = await getDoc(doc(db, 'trips', id));
        if (tripSnap.exists()) {
          setTripName(tripSnap.data().name || 'Trip');
        }

        const q = query(
          collection(db, 'trips', id, 'activity_log'),
          orderBy('created_at', 'desc')
        );
        const snap = await getDocs(q);
        setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Failed to fetch activity log', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading activity...</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-[800px] mx-auto animate-fade-up pb-24 md:pb-8">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white/[0.06] text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Activity Log</h1>
          <p className="text-sm text-muted-foreground">{tripName}</p>
        </div>
      </div>

      <div className="space-y-4">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground bg-white/[0.02] rounded-2xl ring-1 ring-white/[0.06]">
            <Activity className="w-8 h-8 mb-4 opacity-50" />
            <p>No activity recorded yet.</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="p-4 rounded-xl bg-white/[0.02] ring-1 ring-white/[0.06] flex items-start gap-3">
              <div className="p-2 rounded-full bg-white/[0.05]">
                <Activity className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-foreground">{log.message}</p>
                {log.created_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {log.created_at.toDate ? log.created_at.toDate().toLocaleString('en-IN') : new Date(log.created_at).toLocaleString('en-IN')}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
