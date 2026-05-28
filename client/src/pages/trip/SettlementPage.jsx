import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, Send, CheckCircle2, ShieldAlert } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { expenseService } from '../../services/expenseService';
import { settlementService } from '../../services/settlementService';
import { computeBalances, simplifyDebts } from '../../lib/calculations';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import UPIButton from '../../components/balance/UPIButton';
import SettlementRow from '../../components/balance/SettlementRow';

export default function SettlementPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trip, setTrip] = useState(null);
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  // UPI Form state
  const [editingUpi, setEditingUpi] = useState(false);
  const [myUpiId, setMyUpiId] = useState('');
  const [savingUpi, setSavingUpi] = useState(false);

  // Load Data
  useEffect(() => {
    if (!id) return;

    let unsubExpenses = () => {};
    let unsubSettlements = () => {};

    const loadCore = async () => {
      try {
        const tripDoc = await getDoc(doc(db, 'trips', id));
        if (tripDoc.exists()) setTrip({ id: tripDoc.id, ...tripDoc.data() });

        const m = await expenseService.getMembers(id);
        setMembers(m);

        // Pre-fill current user's UPI ID if it exists
        const currentUserMember = m.find(mem => mem.id === user?.uid);
        if (currentUserMember?.upi_id) setMyUpiId(currentUserMember.upi_id);

        unsubExpenses = expenseService.subscribeToExpenses(id, (exp) => setExpenses(exp));
        unsubSettlements = settlementService.subscribeToSettlements(id, (setl) => setSettlements(setl));
      } catch (e) {
        console.error('Failed to load settlement page data', e);
      } finally {
        setLoading(false);
      }
    };

    loadCore();
    return () => {
      unsubExpenses();
      unsubSettlements();
    };
  }, [id, user]);

  const handleSaveUpi = async () => {
    setSavingUpi(true);
    try {
      await settlementService.updateMemberUPI(id, user.uid, myUpiId);
      // Update local members array so UI reflects immediately without reloading
      setMembers(prev => prev.map(m => m.id === user.uid ? { ...m, upi_id: myUpiId } : m));
      setEditingUpi(false);
      toast.success('UPI ID saved');
    } catch (error) {
      toast.error('Failed to save UPI ID');
    } finally {
      setSavingUpi(false);
    }
  };

  const handleRecordPayment = async (txn) => {
    const isAutoConfirmed = trip?.mode === 'GROUP_KAPTAN_ONLY';
    try {
      await settlementService.recordSettlement(id, {
        from_id: txn.fromId,
        from_name: txn.fromName,
        to_id: txn.toId,
        to_name: txn.toName,
        amount: txn.amount,
        method: isAutoConfirmed ? 'Cash' : 'UPI'
      }, isAutoConfirmed);
      toast.success(isAutoConfirmed ? 'Settlement confirmed!' : 'Payment recorded. Waiting for confirmation.');
    } catch (error) {
      toast.error('Failed to record payment');
    }
  };

  const handleConfirmSettlement = async (settlementId) => {
    try {
      await settlementService.confirmSettlement(id, settlementId);
      toast.success('Payment confirmed');
    } catch (error) {
      toast.error('Failed to confirm payment');
    }
  };

  const handleDeleteSettlement = async (settlementId) => {
    try {
      await settlementService.deleteSettlement(id, settlementId);
      toast.success('Settlement record deleted');
    } catch (error) {
      toast.error('Failed to delete record');
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-[900px] mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-white/[0.06] rounded-md" />
        <div className="h-32 w-full bg-white/[0.06] rounded-2xl" />
        <div className="h-48 w-full bg-white/[0.06] rounded-2xl" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p>Trip not found.</p>
        <button onClick={() => navigate('/dashboard')} className="text-sm underline mt-2">Back to dashboard</button>
      </div>
    );
  }

  const isKaptan = trip.kaptan_id === user?.uid;
  const { balances } = computeBalances(members, expenses, settlements);
  const transactions = simplifyDebts(balances);

  return (
    <div className="p-4 md:p-8 max-w-[900px] mx-auto pb-24 md:pb-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate(`/trips/${id}/balances`)}
          className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Settle Up</h1>
          <p className="text-sm text-muted-foreground">Optimized debt repayment</p>
        </div>
      </div>

      {trip.mode === 'SOLO' && (
        <div className="mb-6 p-4 rounded-xl bg-blue-500/10 ring-1 ring-blue-500/20 text-blue-400 text-sm flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>Solo trip. No settlement required.</p>
        </div>
      )}

      {trip.mode !== 'SOLO' && (
        <>
          {/* UPI Setup Card - Only show in GROUP_FULL mode */}
          {trip.mode === 'GROUP_FULL' && (
            <div className="mb-8 p-5 rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06]">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-1">Your UPI ID</h3>
                  <p className="text-xs text-muted-foreground">Add your UPI ID so others can pay you easily.</p>
                </div>
                {!editingUpi && (
                  <Button variant="ghost" size="sm" onClick={() => setEditingUpi(true)} className="h-8 text-muted-foreground hover:text-foreground">
                    <Edit3 className="w-4 h-4 mr-1.5" /> Edit
                  </Button>
                )}
              </div>

              {editingUpi ? (
                <div className="flex gap-2 mt-4">
                  <Input 
                    value={myUpiId}
                    onChange={(e) => setMyUpiId(e.target.value)}
                    placeholder="e.g., name@okbank"
                    className="bg-white/[0.04]"
                  />
                  <Button onClick={handleSaveUpi} disabled={savingUpi} className="bg-primary text-primary-foreground font-medium w-20">
                    {savingUpi ? '...' : 'Save'}
                  </Button>
                </div>
              ) : (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/[0.05] ring-1 ring-white/[0.1]">
                  <span className="font-mono text-sm text-primary">{myUpiId || 'Not set'}</span>
                </div>
              )}
            </div>
          )}

          {/* Optimized Transactions Checklist */}
          <div className="mb-10">
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">Suggested Settlements</h2>
            
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-sm font-medium text-foreground">All debts are settled!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((txn, idx) => {
                  const isSender = txn.fromId === user?.uid;
                  return (
                    <div key={idx} className="p-4 rounded-xl bg-white/[0.03] ring-1 ring-white/[0.06]">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div className="flex flex-col">
                          <p className="text-sm text-foreground">
                            <span className="font-medium text-foreground">{isSender ? 'You' : txn.fromName}</span>
                            <span className="text-muted-foreground mx-1.5">should pay</span>
                            <span className="font-medium text-foreground">{txn.toName}</span>
                          </p>
                        </div>
                        <span className="font-mono text-xl font-bold text-foreground">
                          {trip.base_currency || 'INR'} {txn.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      
                      {/* Interaction Actions */}
                      <div className="flex items-center gap-3 pt-3 border-t border-white/[0.06] w-full">
                        {trip.mode === 'GROUP_KAPTAN_ONLY' ? (
                          /* Kaptan mode: Kaptan can mark any transaction as paid, no UPI needed */
                          <Button
                            size="sm"
                            className="w-full h-10 bg-white text-zinc-950 hover:bg-zinc-200 rounded-lg font-medium px-4"
                            onClick={() => handleRecordPayment(txn)}
                          >
                            <Send className="w-3.5 h-3.5 mr-1.5" /> Mark as Settled
                          </Button>
                        ) : isSender ? (
                          /* Group Full mode - Logged-in user is the sender */
                          <>
                            <UPIButton upiId={txn.toUpiId} amount={txn.amount} payeeName={txn.toName} />
                            <Button
                              size="sm"
                              className="ml-auto h-8 bg-white text-black hover:bg-zinc-200 rounded-md font-medium px-3"
                              onClick={() => handleRecordPayment(txn)}
                            >
                              <Send className="w-3.5 h-3.5 mr-1.5" /> Mark Paid
                            </Button>
                          </>
                        ) : (
                          /* Group Full mode - Logged-in user is not the sender */
                          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                            {txn.toUpiId ? (
                              <>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                UPI ID available
                              </>
                            ) : (
                              <>
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                Waiting for {txn.toName} to add UPI ID
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Settlement History */}
          {settlements.length > 0 && (
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">Settlement History</h2>
              <div className="space-y-3">
                {settlements.map((s) => (
                  <SettlementRow 
                    key={s.id} 
                    settlement={s} 
                    currentUserId={user?.uid} 
                    isKaptan={isKaptan}
                    onConfirm={handleConfirmSettlement}
                    onDelete={handleDeleteSettlement}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
