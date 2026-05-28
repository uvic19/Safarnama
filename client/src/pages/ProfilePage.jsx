import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { LogOut, User, Moon } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import UpiEditor from '../components/ui/UpiEditor';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [globalUpiId, setGlobalUpiId] = useState('');

  useEffect(() => {
    if (user?.uid) {
      userService.getUserProfile(user.uid).then((profile) => {
        if (profile?.upi_id) setGlobalUpiId(profile.upi_id);
      }).catch((err) => console.error('[ProfilePage] Failed to load profile:', err));
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch {
      toast.error('Failed to log out');
    }
  };

  const handleSaveUpi = async (newUpiId) => {
    await userService.updateUserProfile(user.uid, { upi_id: newUpiId });
    setGlobalUpiId(newUpiId);
    toast.success('UPI ID saved successfully');
  };

  return (
    <div className="p-4 md:p-8 max-w-[600px] mx-auto animate-fade-up">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Profile</h1>
      </div>

      <div className="p-[2px] rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] mb-8">
        <div className="rounded-[calc(1.5rem-2px)] bg-card p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-muted-foreground" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{user?.displayName || 'Traveler'}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Settings</h3>
        
        {/* Global UPI ID — shared component to avoid duplication with SettlementPage */}
        <UpiEditor
          value={globalUpiId}
          onSave={handleSaveUpi}
          label="Global UPI ID"
          hint="Used for settlements across all your trips."
        />

        <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] ring-1 ring-white/[0.06]">
          <div className="flex items-center gap-3">
            <Moon className="w-5 h-5 text-muted-foreground" />
            <span>Dark Theme</span>
          </div>
          <span className="text-xs text-muted-foreground">Default</span>
        </div>
      </div>

      <div className="mt-12">
        <Button 
          variant="destructive" 
          className="w-full sm:w-auto flex items-center gap-2" 
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
