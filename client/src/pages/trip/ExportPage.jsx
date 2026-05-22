import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, CheckSquare, Square, Filter } from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Button } from '../../components/ui/button';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function ExportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

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

  const exportPDF = async () => {
    if (!trip || filteredExpenses.length === 0) return;
    setExporting(true);
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      const baseCurr = trip.base_currency || 'INR';
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(22);
      pdf.text(`${trip.name} - Expense Report`, pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(`Exported on: ${new Date().toLocaleString()}`, pageWidth / 2, 28, { align: 'center' });

      pdf.setFontSize(12);
      pdf.text(`Filtered Total: ${baseCurr} ${filteredTotal.toLocaleString()}`, 14, 40);
      pdf.text(`Number of Expenses: ${filteredExpenses.length}`, 14, 48);
      
      const filterSummary = `Filters: ${selectedCategories.size === uniqueCategories.length ? 'All Categories' : 'Custom Categories'}, ${selectedDates.size === uniqueDates.length ? 'All Days' : 'Custom Days'}`;
      pdf.text(filterSummary, 14, 56);

      const tableData = filteredExpenses.map(exp => {
        const amtStr = exp.currency && exp.currency !== baseCurr
          ? `${exp.currency} ${exp.amount} (${baseCurr} ${exp.amountVal})` 
          : `${baseCurr} ${exp.amountVal}`;
        return [exp.dateStr, exp.category || 'Other', exp.description || '-', exp.paid_by_name || 'Someone', amtStr];
      });

      pdf.autoTable({
        startY: 65,
        head: [['Date', 'Category', 'Description', 'Paid By', 'Amount']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [24, 24, 27] }, // zinc-900
      });

      pdf.save(`safarnama_export_${trip.name.replace(/\s+/g, '_').toLowerCase()}.pdf`);
    } catch (err) {
      console.error('PDF generation failed', err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading export data...</div>;
  if (!trip) return <div className="p-8 text-center text-red-400">Trip not found</div>;

  return (
    <div className="p-4 md:p-8 max-w-[800px] mx-auto animate-fade-up pb-24 md:pb-8 flex flex-col h-[100dvh]">
      <div className="flex items-center gap-3 mb-6 shrink-0 pt-4 md:pt-0">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white/[0.06] text-muted-foreground md:hidden">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Export Expenses</h1>
          <p className="text-sm text-muted-foreground">Select what to include in your PDF report</p>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground bg-white/[0.02] rounded-2xl ring-1 ring-white/[0.06] mb-auto">
          <Filter className="w-8 h-8 mb-4 opacity-50" />
          <p>No approved expenses to export yet.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-6">
          
          {/* Summary Box */}
          <div className="bg-white/[0.03] p-6 rounded-2xl ring-1 ring-white/[0.06] flex flex-col items-center justify-center text-center">
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Export Total</p>
            <p className="text-4xl font-mono font-bold text-foreground mb-1">
              {trip.base_currency || 'INR'} {filteredTotal.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">{filteredExpenses.length} expenses selected</p>
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Days Filter */}
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

            {/* Categories Filter */}
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
            onClick={exportPDF} 
            disabled={exporting || filteredExpenses.length === 0}
          >
            <Download className="w-5 h-5 mr-2" />
            {exporting ? 'Generating PDF...' : 'Download PDF Report'}
          </Button>
        </div>
      )}
    </div>
  );
}
