import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, CheckSquare, Square, Filter, Globe, Copy, Check } from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Button } from '../../components/ui/button';

import { toast } from 'sonner';

export default function SharePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Filters state
  const [selectedDates, setSelectedDates] = useState(new Set());
  const [selectedCategories, setSelectedCategories] = useState(new Set());

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
        
        const expensesList = expSnap.docs.map(d => {
          const data = d.data();
          return {
            ...data,
            id: d.id,
            dateObj: data.created_at?.toDate ? data.created_at.toDate() : new Date(),
            dateStr: data.created_at?.toDate ? data.created_at.toDate().toLocaleDateString() : 'Unknown',
            amountVal: Number(data.amount_in_base || data.amount) || 0
          };
        }).sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

        setExpenses(expensesList);

        // Pre-select all
        const allDates = new Set(expensesList.map(e => e.dateStr));
        const allCats = new Set(expensesList.map(e => e.category || 'Other'));
        
        setSelectedDates(allDates);
        setSelectedCategories(allCats);
      } catch (err) {
        console.error('Error fetching data for export', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const uniqueDates = useMemo(() => Array.from(new Set(expenses.map(e => e.dateStr))), [expenses]);
  const uniqueCategories = useMemo(() => Array.from(new Set(expenses.map(e => e.category || 'Other'))), [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => 
      selectedDates.has(e.dateStr) && 
      selectedCategories.has(e.category || 'Other')
    );
  }, [expenses, selectedDates, selectedCategories]);

  const filteredTotal = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amountVal, 0);
  }, [filteredExpenses]);

  const toggleDate = (date) => {
    const newSet = new Set(selectedDates);
    if (newSet.has(date)) newSet.delete(date);
    else newSet.add(date);
    setSelectedDates(newSet);
  };

  const toggleCategory = (cat) => {
    const newSet = new Set(selectedCategories);
    if (newSet.has(cat)) newSet.delete(cat);
    else newSet.add(cat);
    setSelectedCategories(newSet);
  };

  const toggleAllDates = () => {
    if (selectedDates.size === uniqueDates.length) setSelectedDates(new Set());
    else setSelectedDates(new Set(uniqueDates));
  };

  const toggleAllCategories = () => {
    if (selectedCategories.size === uniqueCategories.length) setSelectedCategories(new Set());
    else setSelectedCategories(new Set(uniqueCategories));
  };

  const handlePrint = () => {
    window.print();
  };

  const togglePublic = async () => {
    const newValue = !trip.isPublic;
    try {
      const { updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'trips', id), { isPublic: newValue });
      setTrip(prev => ({ ...prev, isPublic: newValue }));
      toast.success(newValue ? 'Trip is now public' : 'Trip is now private');
    } catch {
      toast.error('Failed to update privacy');
    }
  };

  const copyLink = () => {
    const baseUrl = window.location.hostname === 'localhost' ? 'https://safarnama.kridleapps.dev' : window.location.origin;
    const link = `${baseUrl}/t/${trip.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied!');
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse no-print">Loading export data...</div>;
  if (!trip) return <div className="p-8 text-center text-red-400 no-print">Trip not found</div>;

  return (
    <>
      {/* UI for interacting and filtering (Hidden during print) */}
      <div className="p-4 md:p-8 max-w-[800px] mx-auto animate-fade-up pb-24 md:pb-8 flex flex-col h-[100dvh] no-print">
        <div className="flex items-center gap-3 mb-6 shrink-0 pt-4 md:pt-0">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white/[0.06] text-muted-foreground md:hidden">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Share & Export</h1>
            <p className="text-sm text-muted-foreground">Share a link or download PDF</p>
          </div>
        </div>

        {/* Share Link Section */}
        <div className="bg-white/[0.03] p-6 rounded-2xl ring-1 ring-white/[0.06] mb-6 shrink-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" /> Make Public
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Anyone with the link can view and clone this trip.</p>
            </div>
            <button 
              onClick={togglePublic}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${trip.isPublic ? 'bg-white' : 'bg-white/20'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full transition-transform ${trip.isPublic ? 'translate-x-6 bg-black' : 'translate-x-1 bg-white'}`} />
            </button>
          </div>

          {trip.isPublic && (
            <div className="flex items-center gap-2 mt-4">
              <div className="flex-1 bg-white/[0.02] border border-white/[0.1] rounded-lg px-3 py-2 text-sm font-mono text-muted-foreground truncate select-all">
                {window.location.hostname === 'localhost' ? 'https://safarnama.kridleapps.dev' : window.location.origin}/t/{trip.id}
              </div>
              <Button onClick={copyLink} size="sm" variant="outline" className="shrink-0 h-10 w-24">
                {copied ? <Check className="w-4 h-4 mr-2 text-emerald-500" /> : <Copy className="w-4 h-4 mr-2" />} 
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          )}
        </div>

        <h2 className="font-display text-lg font-semibold text-foreground mb-4 shrink-0">Export Expenses (PDF)</h2>

        {expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground bg-white/[0.02] rounded-2xl ring-1 ring-white/[0.06] mb-auto">
            <Filter className="w-8 h-8 mb-4 opacity-50" />
            <p>No approved expenses to export yet.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-6">
            <div className="bg-white/[0.03] p-6 rounded-2xl ring-1 ring-white/[0.06] flex flex-col items-center justify-center text-center">
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Export Total</p>
              <p className="text-4xl font-mono font-bold text-foreground mb-1">
                {trip.base_currency || 'INR'} {filteredTotal.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">{filteredExpenses.length} expenses selected</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Specific Days</h3>
                  <button onClick={toggleAllDates} className="text-xs text-primary hover:underline">
                    {selectedDates.size === uniqueDates.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="bg-white/[0.02] rounded-xl ring-1 ring-white/[0.06] p-2 max-h-[250px] overflow-y-auto">
                  {uniqueDates.map(date => (
                    <label key={date} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.04] cursor-pointer transition-colors">
                      <button 
                        type="button"
                        onClick={() => toggleDate(date)}
                        className="text-muted-foreground hover:text-white transition-colors"
                      >
                        {selectedDates.has(date) ? <CheckSquare className="w-5 h-5 text-primary" /> : <Square className="w-5 h-5" />}
                      </button>
                      <span className="text-sm text-foreground select-none">{date}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Categories</h3>
                  <button onClick={toggleAllCategories} className="text-xs text-primary hover:underline">
                    {selectedCategories.size === uniqueCategories.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="bg-white/[0.02] rounded-xl ring-1 ring-white/[0.06] p-2 max-h-[250px] overflow-y-auto">
                  {uniqueCategories.map(cat => (
                    <label key={cat} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.04] cursor-pointer transition-colors">
                      <button 
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className="text-muted-foreground hover:text-white transition-colors"
                      >
                        {selectedCategories.has(cat) ? <CheckSquare className="w-5 h-5 text-primary" /> : <Square className="w-5 h-5" />}
                      </button>
                      <span className="text-sm text-foreground capitalize select-none">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {expenses.length > 0 && (
          <div className="mt-6 pt-4 border-t border-white/10 shrink-0">
            <Button 
              className="w-full h-12 text-base font-semibold" 
              onClick={handlePrint} 
              disabled={filteredExpenses.length === 0}
            >
              <Download className="w-5 h-5 mr-2" />
              Print / Save PDF
            </Button>
          </div>
        )}
      </div>

      {/* Print-only layout */}
      <div className="hidden print-only p-8 text-black bg-white min-h-screen">
        <h1 className="text-3xl font-bold mb-2">{trip.name} — Expense Report</h1>
        <p className="text-gray-500 mb-8">Exported on: {new Date().toLocaleString()}</p>

        <div className="mb-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Total Included Expenses</p>
          <p className="text-3xl font-bold font-mono">
            {trip.base_currency || 'INR'} {filteredTotal.toLocaleString()}
          </p>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="py-3 px-2 font-bold">Date</th>
              <th className="py-3 px-2 font-bold">Description</th>
              <th className="py-3 px-2 font-bold">Category</th>
              <th className="py-3 px-2 font-bold">Paid By</th>
              <th className="py-3 px-2 font-bold text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map((expense, idx) => (
              <tr key={expense.id} className={idx !== filteredExpenses.length - 1 ? 'border-b border-gray-200' : ''}>
                <td className="py-3 px-2 text-sm whitespace-nowrap">{expense.dateStr}</td>
                <td className="py-3 px-2 text-sm">{expense.description}</td>
                <td className="py-3 px-2 text-sm capitalize">{expense.category || 'Other'}</td>
                <td className="py-3 px-2 text-sm">{expense.paid_by_name || 'Someone'}</td>
                <td className="py-3 px-2 text-sm text-right font-mono font-medium">
                  {Number(expense.amount).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
