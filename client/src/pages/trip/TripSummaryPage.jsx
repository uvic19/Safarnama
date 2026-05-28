import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, MapPin, CalendarDays, Wallet, Download } from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Button } from '../../components/ui/button';
import { generateExpensePDF } from '../../lib/pdfExport';
import { toast } from 'sonner';

export default function TripSummaryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [trip, setTrip] = useState(null);
  const [stats, setStats] = useState({ totalExpense: 0, topCategory: '-', expenseCount: 0 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const exportPDF = async () => {
    if (!trip) return;
    setExporting(true);
    try {
      const expQ = query(collection(db, 'trips', id, 'expenses'), where('status', '==', 'APPROVED'));
      const expSnap = await getDocs(expQ);

      const expensesList = expSnap.docs
        .map((expDoc) => expDoc.data())
        .sort((a, b) => {
          const da = a.created_at?.toDate ? a.created_at.toDate().getTime() : 0;
          const db2 = b.created_at?.toDate ? b.created_at.toDate().getTime() : 0;
          return da - db2;
        });

      generateExpensePDF(trip, expensesList, {
        title: trip.name,
        subtitle: `${trip.start_date || '?'} to ${trip.end_date || '?'} · Destinations: ${Array.isArray(trip.destinations) ? trip.destinations.join(', ') : (trip.destinations || 'N/A')}`,
        filename: `safarnama_${trip.name.replace(/\s+/g, '_').toLowerCase()}_summary`,
      });
    } catch (err) {
      console.error('[TripSummaryPage] PDF generation failed:', err);
      toast.error('Failed to generate PDF');
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const tripSnap = await getDoc(doc(db, 'trips', id));
        if (tripSnap.exists()) {
          setTrip({ id: tripSnap.id, ...tripSnap.data() });
        }

        const expQ = query(collection(db, 'trips', id, 'expenses'), where('status', '==', 'APPROVED'));
        const expSnap = await getDocs(expQ);
        
        let total = 0;
        const categoryTotals = {};
        expSnap.docs.forEach(doc => {
          const data = doc.data();
          const amount = Number(data.amount_in_base || data.amount) || 0;
          total += amount;
          categoryTotals[data.category] = (categoryTotals[data.category] || 0) + amount;
        });

        let topCat = '-';
        let maxCatAmount = 0;
        for (const [cat, amt] of Object.entries(categoryTotals)) {
          if (amt > maxCatAmount) { maxCatAmount = amt; topCat = cat; }
        }

        setStats({ totalExpense: total, topCategory: topCat, expenseCount: expSnap.docs.length });
      } catch (err) {
        console.error('Error fetching summary data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Generating summary...</div>;
  if (!trip) return <div className="p-8 text-center text-red-400">Trip not found</div>;

  return (
    <div className="p-4 md:p-8 max-w-[800px] mx-auto animate-fade-up pb-24 md:pb-8">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white/[0.06] text-muted-foreground md:hidden">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold text-foreground">Trip Summary</h1>
        </div>
        <Button variant="outline" size="sm" onClick={exportPDF} disabled={exporting} className="hidden sm:flex">
          <Download className="w-4 h-4 mr-2" />
          {exporting ? 'Generating...' : 'Download PDF'}
        </Button>
      </div>

      <Button variant="outline" className="w-full mb-6 sm:hidden" onClick={exportPDF} disabled={exporting}>
        <Download className="w-4 h-4 mr-2" />
        {exporting ? 'Generating...' : 'Download PDF'}
      </Button>

      <div className="p-[2px] rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] mb-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50" />
        <div className="rounded-[calc(1.5rem-2px)] bg-card p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] relative z-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">{trip.name}</h2>
          <p className="text-muted-foreground mb-6">You've reached the end of this journey!</p>
          
          <div className="grid grid-cols-2 gap-4 w-full text-left bg-white/[0.02] p-4 rounded-xl ring-1 ring-white/[0.06]">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <div className="text-sm">
                <div className="text-muted-foreground text-xs uppercase">Destinations</div>
                <div className="font-medium text-foreground">{Array.isArray(trip.destinations) ? trip.destinations.join(', ') : (trip.destinations || 'N/A')}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-amber-400" />
              <div className="text-sm">
                <div className="text-muted-foreground text-xs uppercase">Dates</div>
                <div className="font-medium text-foreground">{trip.start_date || '?'} to {trip.end_date || '?'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-bold text-foreground mb-4">Expense Snapshot</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white/[0.03] p-4 rounded-xl ring-1 ring-white/[0.06] flex flex-col items-center justify-center text-center">
          <Wallet className="w-6 h-6 text-emerald-400 mb-2" />
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Spent</div>
          <div className="text-xl font-mono text-foreground font-bold">{trip.base_currency || 'INR'} {stats.totalExpense.toLocaleString()}</div>
        </div>
        <div className="bg-white/[0.03] p-4 rounded-xl ring-1 ring-white/[0.06] flex flex-col items-center justify-center text-center">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Expenses</div>
          <div className="text-xl font-bold text-foreground">{stats.expenseCount} logs</div>
        </div>
        <div className="bg-white/[0.03] p-4 rounded-xl ring-1 ring-white/[0.06] flex flex-col items-center justify-center text-center">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Top Category</div>
          <div className="text-xl font-bold text-foreground capitalize">{stats.topCategory}</div>
        </div>
      </div>
      
      <div className="flex justify-center mt-12">
        <Button onClick={() => navigate(`/trips/${id}`)} variant="outline">
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
