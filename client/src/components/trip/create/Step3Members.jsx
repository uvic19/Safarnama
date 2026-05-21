import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Plus, X, Rocket, Sparkles } from 'lucide-react';

export default function Step3Members({ data, updateData }) {
  if (data.mode === 'SOLO') {
    return (
      <div className="space-y-6 text-center py-10">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Rocket className="w-8 h-8 text-foreground/80" />
        </div>
        <h3 className="text-xl font-medium">Solo Trip Ready</h3>
        <p className="text-body-md text-muted-foreground max-w-[250px] mx-auto">
          No members to add. You're all set to review and create your trip.
        </p>
      </div>
    );
  }

  if (data.mode === 'GROUP_FULL') {
    return (
      <div className="space-y-6 text-center py-8">
        <div className="mx-auto w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-medium">Group Trip Ready</h3>
        <p className="text-body-md text-muted-foreground max-w-[280px] mx-auto">
          An invite code will be generated once the trip is created. You can share it with your friends so they can join via the app.
        </p>
      </div>
    );
  }

  // GROUP_KAPTAN_ONLY
  const handleAddMember = () => {
    updateData({ offline_members: [...data.offline_members, ''] });
  };

  const handleUpdateMember = (index, value) => {
    const newMembers = [...data.offline_members];
    newMembers[index] = value;
    updateData({ offline_members: newMembers });
  };

  const handleRemoveMember = (index) => {
    const newMembers = data.offline_members.filter((_, i) => i !== index);
    updateData({ offline_members: newMembers });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-heading-lg mb-1">Add Members</h2>
        <p className="text-body-md text-muted-foreground">Add their names so you can split expenses with them.</p>
      </div>

      <div className="space-y-3">
        {data.offline_members.map((name, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              placeholder="Friend's Name"
              value={name}
              onChange={(e) => handleUpdateMember(index, e.target.value)}
              className=""
            />
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => handleRemoveMember(index)}
              disabled={data.offline_members.length === 1}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={handleAddMember} className="w-full border-dashed">
        <Plus className="mr-2 h-4 w-4" /> Add Another Member
      </Button>
    </div>
  );
}
