import { useState, useEffect } from 'react';
import { X, Delete, ChevronLeft, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import CategoryIcon, { CATEGORIES } from './CategoryIcon';
import SplitSelector from './SplitSelector';
import { expenseService } from '../../services/expenseService';
import { useAuth } from '../../hooks/useAuth';
import ConfirmDialog from '../ui/ConfirmDialog';

const PAYMENT_MODES = ['Cash', 'UPI', 'Card'];

function toDatetimeLocalString(date) {
  if (!date) return '';
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

const STEPS = [
  { id: 'amount',   label: 'Amount' },
  { id: 'category', label: 'Category' },
  { id: 'paid_by',  label: 'Paid By' },
  { id: 'split',    label: 'Split' },
  { id: 'details',  label: 'Details' },
];

const initialForm = {
  amount: '',
  category: 'Misc',
  paid_by_id: '',
  paid_by_name: '',
  split_among: [],
  payment_mode: 'Cash',
  description: '',
  created_at: null,
};

/**
 * Multi-step bottom sheet for adding/editing expenses.
 */
export default function NumpadSheet({ open, onClose, tripId, tripMode, kaptanId, onAdded, expenseToEdit }) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [members, setMembers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch members when sheet opens
  useEffect(() => {
    if (open && tripId) {
      expenseService.getMembers(tripId).then((m) => {
        setMembers(m);
        
        if (expenseToEdit) {
          setForm({
            amount: String(expenseToEdit.amount || ''),
            category: expenseToEdit.category || 'Misc',
            paid_by_id: expenseToEdit.paid_by_id || '',
            paid_by_name: expenseToEdit.paid_by_name || '',
            split_among: expenseToEdit.split_among || [],
            payment_mode: expenseToEdit.payment_mode || 'Cash',
            description: expenseToEdit.description || '',
            created_at: expenseToEdit.created_at ? (expenseToEdit.created_at.toDate ? expenseToEdit.created_at.toDate() : new Date(expenseToEdit.created_at)) : new Date(),
          });
        } else {
          // Pre-select all members for split
          setForm({
            amount: '',
            category: 'Misc',
            paid_by_id: user?.uid || '',
            paid_by_name: user?.displayName || user?.email || 'You',
            split_among: m.map((mem) => mem.id),
            payment_mode: 'Cash',
            description: '',
          });
        }
      });
    }
  }, [open, tripId, user, expenseToEdit]);

  // Reset on close
  const handleClose = () => {
    setStep(0);
    setForm(initialForm);
    onClose();
  };

  // Numpad press handler
  const handleNumpad = (val) => {
    setForm((prev) => {
      let curr = prev.amount;
      if (val === 'back') return { ...prev, amount: curr.slice(0, -1) };
      if (val === '.' && curr.includes('.')) return prev;
      if (curr === '0' && val !== '.') return { ...prev, amount: val };
      if (curr.length >= 10) return prev;
      return { ...prev, amount: curr + val };
    });
  };

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setSubmitting(true);
    try {
      if (expenseToEdit) {
        await expenseService.updateExpense(tripId, expenseToEdit.id, form);
        toast.success('Expense updated!');
      } else {
        await expenseService.addExpense(tripId, form, user.uid, tripMode, kaptanId);
        const isKaptan = user.uid === kaptanId;
        toast.success(
          tripMode === 'SOLO' || isKaptan ? 'Expense added!' : 'Expense submitted for approval'
        );
      }
      onAdded?.();
      handleClose();
    } catch (e) {
      toast.error(expenseToEdit ? 'Failed to update expense' : 'Failed to add expense');
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const triggerDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!expenseToEdit) return;
    setShowDeleteConfirm(false);
    setSubmitting(true);
    try {
      await expenseService.deleteExpense(tripId, expenseToEdit.id);
      toast.success('Expense deleted!');
      onAdded?.();
      handleClose();
    } catch (e) {
      toast.error('Failed to delete expense');
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const canAdvance = () => {
    if (step === 0) return form.amount && Number(form.amount) > 0;
    return true;
  };

  const currentStep = STEPS[step];

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="h-[90dvh] bg-[#0C0C0E] border-t border-white/[0.08] rounded-t-3xl p-0 flex flex-col"
      >
        {/* Header */}
        <SheetHeader className="px-5 pt-5 pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step > 0 && (
                <button onClick={goBack} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <SheetTitle className="font-display text-lg font-semibold text-foreground">
                {currentStep.label}
              </SheetTitle>
            </div>
            <button onClick={handleClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress dots */}
          <div className="flex gap-1.5 mt-3">
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                className={`h-1 rounded-full flex-1 transition-all duration-300 ${i <= step ? 'bg-primary' : 'bg-white/10'}`}
              />
            ))}
          </div>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">

          {/* ─── Step 0: Amount ─────────────────────────── */}
          {step === 0 && (
            <div className="flex flex-col items-center py-4">
              {/* Amount display */}
              <div className="mb-8 text-center">
                <p className="text-sm text-muted-foreground mb-2">Enter amount</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="font-mono text-2xl text-muted-foreground">₹</span>
                  <span className="font-mono text-6xl font-light text-foreground tracking-tighter min-w-[2ch]">
                    {form.amount || '0'}
                  </span>
                </div>
              </div>

              {/* Numpad */}
              <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
                {['1','2','3','4','5','6','7','8','9','.','0','back'].map((key) => (
                  <button
                    key={key}
                    onClick={() => handleNumpad(key)}
                    className="h-14 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] active:scale-95 transition-all duration-100 flex items-center justify-center text-foreground font-mono text-xl font-medium"
                  >
                    {key === 'back'
                      ? <Delete className="w-5 h-5 text-muted-foreground" />
                      : key
                    }
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ─── Step 1: Category ───────────────────────── */}
          {step === 1 && (
            <div className="py-2">
              <div className="grid grid-cols-4 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setForm((p) => ({ ...p, category: cat }))}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl ring-1 transition-all duration-150
                      ${form.category === cat
                        ? 'bg-white/10 ring-white/30 scale-105'
                        : 'bg-white/[0.03] ring-white/[0.06] hover:bg-white/[0.07]'
                      }`}
                  >
                    <CategoryIcon category={cat} size={36} />
                    <span className="text-xs text-muted-foreground">{cat}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ─── Step 2: Paid By ────────────────────────── */}
          {step === 2 && (
            <div className="py-2 space-y-2">
              {members.length === 0 ? (
                /* SOLO: just show current user */
                <div className="p-4 rounded-xl bg-white/[0.05] ring-1 ring-white/[0.10] text-sm text-foreground">
                  {user?.displayName || user?.email || 'You'} (you)
                </div>
              ) : (
                members.map((m) => {
                  let label = m.offline_name || m.display_name || m.name || m.user_id?.slice(0, 8) || 'Unknown';
                  if (user && m.id === user.uid) {
                    label = user.displayName || 'You';
                  }
                  const isSelected = form.paid_by_id === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setForm((p) => ({ ...p, paid_by_id: m.id, paid_by_name: label }))}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl ring-1 transition-all duration-150 text-left
                        ${isSelected
                          ? 'bg-primary/10 ring-primary/40'
                          : 'bg-white/[0.03] ring-white/[0.06] hover:bg-white/[0.07]'
                        }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-foreground">{label[0].toUpperCase()}</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">{label}</span>
                      {m.role === 'KAPTAN' && (
                        <span className="ml-auto text-xs text-amber-400">Kaptan</span>
                      )}
                      {isSelected && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* ─── Step 3: Split ──────────────────────────── */}
          {step === 3 && (
            <div className="py-2">
              {members.length <= 1 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Solo trip — no split needed.
                </p>
              ) : (
                <SplitSelector
                  members={members}
                  selected={form.split_among}
                  onChange={(sel) => setForm((p) => ({ ...p, split_among: sel }))}
                  currentUser={user}
                />
              )}
            </div>
          )}

          {/* ─── Step 4: Details ────────────────────────── */}
          {step === 4 && (
            <div className="py-2 space-y-5">
              {/* Payment mode */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Payment Mode</label>
                <div className="flex gap-2">
                  {PAYMENT_MODES.map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setForm((p) => ({ ...p, payment_mode: mode }))}
                      className={`flex-1 py-2.5 rounded-md text-sm font-medium ring-1 transition-all duration-150
                        ${form.payment_mode === mode
                          ? 'bg-primary text-primary-foreground ring-primary'
                          : 'bg-white/[0.03] text-muted-foreground ring-white/[0.08] hover:bg-white/[0.07]'
                        }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description (Optional)</label>
                <Input
                  placeholder="e.g., Lunch at dhaba"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="bg-white/[0.04]"
                />
              </div>

              {/* Date & Time (Only shown when editing) */}
              {expenseToEdit && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Date & Time</label>
                  <Input
                    type="datetime-local"
                    value={form.created_at ? toDatetimeLocalString(form.created_at) : ''}
                    onChange={(e) => {
                      const dateVal = e.target.value ? new Date(e.target.value) : new Date();
                      setForm((p) => ({ ...p, created_at: dateVal }));
                    }}
                    className="bg-white/[0.04] text-foreground font-mono"
                  />
                </div>
              )}

              {/* Summary */}
              <div className="p-4 rounded-xl bg-white/[0.03] ring-1 ring-white/[0.06] space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Summary</p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-mono font-semibold text-foreground">₹{Number(form.amount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Category</span>
                  <span className="text-foreground">{form.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Paid by</span>
                  <span className="text-foreground">{form.paid_by_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Split</span>
                  <span className="text-foreground">{form.split_among.length} members</span>
                </div>
                {expenseToEdit && form.created_at && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date & Time</span>
                    <span className="text-foreground font-mono text-xs">
                      {form.created_at.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                  </div>
                )}
                {tripMode !== 'SOLO' && user?.uid !== kaptanId && !expenseToEdit && (
                  <div className="pt-1 mt-1 border-t border-white/[0.06]">
                    <p className="text-xs text-amber-400">Requires Kaptan approval</p>
                  </div>
                )}
              </div>

              {expenseToEdit && (
                <Button
                  onClick={triggerDelete}
                  disabled={submitting}
                  variant="ghost"
                  className="w-full h-11 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl font-medium border border-rose-500/20 mt-4"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Expense
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="px-5 pb-6 pt-3 flex-shrink-0 border-t border-white/[0.06] flex gap-3">
          {step < STEPS.length - 1 ? (
            <>
              {expenseToEdit && (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !canAdvance()}
                  variant="outline"
                  className="flex-1 rounded-md font-medium border-white/10 hover:bg-white/5 text-foreground"
                >
                  {submitting ? 'Saving...' : 'Quick Save'}
                </Button>
              )}
              <Button
                onClick={goNext}
                disabled={!canAdvance()}
                className={expenseToEdit ? "flex-1 rounded-md font-medium" : "w-full rounded-md font-medium"}
              >
                Continue
              </Button>
            </>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting || !canAdvance()}
              className="w-full rounded-md font-medium bg-primary text-primary-foreground"
            >
              {submitting 
                ? (expenseToEdit ? 'Saving...' : 'Adding...') 
                : (expenseToEdit ? 'Save Changes' : 'Add Expense')
              }
            </Button>
          )}
        </div>
      </SheetContent>
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        submitting={submitting}
      />
    </Sheet>
  );
}
