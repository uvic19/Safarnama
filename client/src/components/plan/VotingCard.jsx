import { Button } from '../ui/button';
import { ThumbsUp } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function VotingCard({ plan, trip, onVote, onSelectWinner }) {
  const { user } = useAuth();
  
  if (!plan || !trip) return null;

  const totalMembers = trip.member_ids?.length || 1;
  const voteCount = plan.voter_ids?.length || 0;
  const votePercentage = Math.round((voteCount / totalMembers) * 100) || 0;
  
  const hasVoted = plan.voter_ids?.includes(user?.uid);
  const isKaptan = trip.kaptan_id === user?.uid;
  const isWinner = plan.is_winner;

  return (
    <div className={`p-[2px] rounded-2xl bg-white/[0.03] ring-1 transition-all ${isWinner ? 'ring-primary shadow-glow' : 'ring-white/[0.06]'}`}>
      <div className="rounded-[calc(1.5rem-2px)] bg-card p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] flex flex-col h-full relative overflow-hidden">
        
        {isWinner && (
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] uppercase font-bold px-3 py-1 rounded-bl-xl">
            Selected Winner
          </div>
        )}

        <h3 className="font-display text-xl font-bold text-foreground mb-2 mt-2">{plan.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
        
        {plan.estimated_cost && (
          <div className="text-sm font-mono text-foreground mb-6">
            Est. Cost: ₹{Number(plan.estimated_cost).toLocaleString()}
          </div>
        )}

        <div className="mt-auto space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{voteCount} vote{voteCount !== 1 && 's'}</span>
              <span>{votePercentage}%</span>
            </div>
            <div className="h-2 w-full bg-white/[0.05] rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-out-expo" 
                style={{ width: `${votePercentage}%` }} 
              />
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <Button 
              variant={hasVoted ? 'default' : 'outline'} 
              className={`flex-1 ${hasVoted ? '' : 'text-muted-foreground border-white/[0.1]'}`}
              onClick={() => onVote(plan.id, !hasVoted)}
              disabled={isWinner}
            >
              <ThumbsUp className={`w-4 h-4 mr-2 ${hasVoted ? 'fill-current' : ''}`} />
              {hasVoted ? 'Voted' : 'Vote'}
            </Button>
            
            {isKaptan && !isWinner && (
              <Button variant="secondary" onClick={() => onSelectWinner(plan.id)}>
                Select
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
