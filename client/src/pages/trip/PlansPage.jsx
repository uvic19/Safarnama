import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import VotingCard from '../../components/plan/VotingCard';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../components/ui/sheet';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { planService } from '../../services/planService';

export default function PlansPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [trip, setTrip] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({ title: '', description: '', estimated_cost: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchTrip = async () => {
      const docSnap = await getDoc(doc(db, 'trips', id));
      if (docSnap.exists()) setTrip({ id: docSnap.id, ...docSnap.data() });
    };
    fetchTrip();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const unsub = planService.subscribeToPlans(id, (data) => {
      setPlans(data);
      setLoading(false);
    });
    return unsub;
  }, [id]);

  const handleVote = async (planId, isVoting) => {
    if (!user) return;
    try {
      await planService.toggleVote(id, planId, user.uid, isVoting);
    } catch {
      toast.error('Failed to register vote');
    }
  };

  const handleSelectWinner = async (planId) => {
    if (!trip || trip.kaptan_id !== user?.uid) return;
    try {
      await planService.selectWinner(id, planId, plans.map((p) => p.id));
      toast.success('Winner selected!');
    } catch {
      toast.error('Failed to select winner');
    }
  };

  const handleAddPlan = async () => {
    if (!newPlan.title.trim()) {
      toast.error('Title is required');
      return;
    }
    setSubmitting(true);
    try {
      await planService.addPlan(id, {
        title: newPlan.title,
        description: newPlan.description,
        estimatedCost: newPlan.estimated_cost,
        userId: user.uid,
      });
      setNewPlan({ title: '', description: '', estimated_cost: '' });
      setSheetOpen(false);
      toast.success('Plan added!');
    } catch {
      toast.error('Failed to add plan');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading plans...</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-[1000px] mx-auto animate-fade-up pb-24 md:pb-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white/[0.06] text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-2xl font-bold text-foreground">Voting &amp; Plans</h1>
        </div>
        <Button onClick={() => setSheetOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Suggest Plan</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-white/[0.02] rounded-2xl ring-1 ring-white/[0.06]">
            No plans suggested yet. Be the first to suggest one!
          </div>
        ) : (
          plans.map((plan) => (
            <VotingCard 
              key={plan.id} 
              plan={plan} 
              trip={trip} 
              onVote={handleVote} 
              onSelectWinner={handleSelectWinner} 
            />
          ))
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="sm:max-w-md sm:right-0 sm:bottom-auto sm:top-0 sm:h-full bg-background border-border sm:border-l sm:rounded-l-2xl rounded-t-2xl px-6 pt-6 pb-8">
          <SheetHeader className="mb-6 text-left">
            <SheetTitle>Suggest a Plan</SheetTitle>
          </SheetHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={newPlan.title} onChange={(e) => setNewPlan({...newPlan, title: e.target.value})} placeholder="e.g. Stay at Taj" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={newPlan.description} onChange={(e) => setNewPlan({...newPlan, description: e.target.value})} placeholder="Details..." />
            </div>
            <div className="space-y-2">
              <Label>Estimated Cost</Label>
              <Input type="number" value={newPlan.estimated_cost} onChange={(e) => setNewPlan({...newPlan, estimated_cost: e.target.value})} placeholder="0" className="font-mono" />
            </div>
            <Button className="w-full mt-4" onClick={handleAddPlan} disabled={submitting}>
              {submitting ? 'Adding...' : 'Submit Suggestion'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
