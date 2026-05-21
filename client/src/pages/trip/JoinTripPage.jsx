import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, KeyRound, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';
import { tripService } from '../../services/tripService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

export default function JoinTripPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);

  const handleJoin = async (event) => {
    event.preventDefault();
    if (!user) return;

    setJoining(true);
    try {
      const tripId = await tripService.joinTripByInviteCode(code, user);
      toast.success('Joined trip');
      navigate(`/trips/${tripId}`);
    } catch (error) {
      console.error('Failed to join trip', error);
      toast.error(error.message || 'Could not join trip');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-full max-w-xl flex-col justify-center p-4 pb-24 md:p-8 md:pb-8">
      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        className="mb-6 inline-flex w-fit items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </button>

      <div className="rounded-2xl border border-border bg-white/[0.03] p-5 ring-1 ring-white/[0.04]">
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Join Trip</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter the invite code shared by your Kaptan.
            </p>
          </div>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-code">Invite code</Label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="invite-code"
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                className="h-12 pl-9 font-mono text-lg uppercase tracking-[0.2em]"
                placeholder="ABC123"
              />
            </div>
          </div>

          <Button type="submit" disabled={joining || code.length < 4} className="h-11 w-full">
            {joining ? 'Joining...' : 'Join trip'}
          </Button>
        </form>
      </div>
    </div>
  );
}
