import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { UserMinus, Edit3, Check, Plus, LogOut } from 'lucide-react';
import { tripService } from '../../services/tripService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../ui/ConfirmDialog';

export default function MembersSheet({ open, onClose, trip, members, currentUser, onMembersUpdated }) {
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  
  const [addingNew, setAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isKaptan = trip?.kaptan_id === currentUser?.uid;

  const handleEditClick = (member) => {
    setEditingId(member.id);
    setEditName(member.display_name || member.offline_name || '');
  };

  const handleSaveEdit = async (memberId) => {
    if (!editName.trim()) return;
    setIsSubmitting(true);
    try {
      await tripService.updateOfflineMemberName(trip.id, memberId, editName);
      toast.success('Member updated');
      setEditingId(null);
      onMembersUpdated();
    } catch (e) {
      toast.error('Failed to update member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMember = async () => {
    if (!newName.trim()) return;
    setIsSubmitting(true);
    try {
      await tripService.addOfflineMember(trip.id, newName);
      toast.success('Member added');
      setAddingNew(false);
      setNewName('');
      onMembersUpdated();
    } catch (e) {
      toast.error('Failed to add member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    setIsSubmitting(true);
    try {
      await tripService.removeMember(trip.id, memberToRemove.id, memberToRemove.user_id);
      toast.success('Member removed');
      setMemberToRemove(null);
      onMembersUpdated();
    } catch (e) {
      toast.error('Failed to remove member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeaveTrip = async () => {
    setIsSubmitting(true);
    try {
      await tripService.leaveTrip(trip.id, currentUser.uid);
      toast.success('You left the trip');
      onClose();
      navigate('/dashboard', { replace: true });
    } catch (e) {
      toast.error('Failed to leave trip');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
        <SheetContent side="bottom" className="max-h-[90vh] sm:h-auto sm:max-w-md sm:right-0 sm:bottom-auto sm:top-0 sm:border-l sm:rounded-l-2xl sm:border-t-0 rounded-t-2xl bg-background px-6 pt-6 pb-8 overflow-y-auto">
          <SheetHeader className="mb-6 text-left">
            <SheetTitle>Trip Members</SheetTitle>
            <SheetDescription>
              Manage people in this trip.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4">
            {members.map(member => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] ring-1 ring-white/[0.08]">
                {editingId === member.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8 text-sm"
                      autoFocus
                      disabled={isSubmitting}
                    />
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10" onClick={() => handleSaveEdit(member.id)} disabled={isSubmitting}>
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-medium text-foreground truncate">
                        {member.display_name || member.offline_name}
                        {member.user_id === currentUser?.uid && ' (You)'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {member.role === 'KAPTAN' ? 'Kaptan' : member.user_id ? 'Online' : 'Offline'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                      {isKaptan && !member.user_id && (
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleEditClick(member)} disabled={isSubmitting}>
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {isKaptan && member.role !== 'KAPTAN' && (
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10" onClick={() => setMemberToRemove(member)} disabled={isSubmitting}>
                          <UserMinus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}

            {addingNew ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.04] ring-1 ring-white/[0.08]">
                <Input 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Offline member name..."
                  className="h-8 text-sm"
                  autoFocus
                  disabled={isSubmitting}
                />
                <Button size="sm" onClick={handleAddMember} disabled={isSubmitting}>Add</Button>
                <Button size="sm" variant="ghost" onClick={() => { setAddingNew(false); setNewName(''); }} disabled={isSubmitting}>Cancel</Button>
              </div>
            ) : (
              isKaptan && trip?.mode !== 'SOLO' && (
                <Button 
                  variant="outline" 
                  className="w-full border-dashed" 
                  onClick={() => setAddingNew(true)}
                  disabled={isSubmitting}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Offline Member
                </Button>
              )
            )}

            {!isKaptan && (
              <div className="pt-4 mt-2 border-t border-white/[0.06]">
                <Button 
                  variant="ghost" 
                  className="w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10" 
                  onClick={() => setShowLeaveConfirm(true)}
                  disabled={isSubmitting}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Leave Trip
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!memberToRemove}
        onOpenChange={(val) => { if (!val) setMemberToRemove(null); }}
        title="Remove Member"
        description={`Are you sure you want to remove ${memberToRemove?.display_name || memberToRemove?.offline_name}? Their past expenses will remain but they won't be able to access the trip anymore.`}
        confirmText="Remove"
        onConfirm={handleRemoveMember}
      />

      <ConfirmDialog
        open={showLeaveConfirm}
        onOpenChange={setShowLeaveConfirm}
        title="Leave Trip"
        description="Are you sure you want to leave this trip? You will lose access to it immediately."
        confirmText="Leave Trip"
        onConfirm={handleLeaveTrip}
      />
    </>
  );
}
