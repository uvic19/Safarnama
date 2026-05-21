import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { User, Users, ShieldCheck } from 'lucide-react';

export default function Step1Basics({ data, updateData }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-heading-lg mb-1">The Basics</h2>
        <p className="text-body-md text-muted-foreground">Give your trip a name and destination.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Trip Name</Label>
          <Input 
            id="name" 
            placeholder="e.g., Matheran Trip" 
            value={data.name}
            onChange={(e) => updateData({ name: e.target.value })}
            className="text-body-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="destinations">Destination(s)</Label>
          <Input 
            id="destinations" 
            placeholder="e.g., Goa, Gokarna" 
            value={data.destinations}
            onChange={(e) => updateData({ destinations: e.target.value })}
            className="text-body-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            {/* Simple date inputs for now, can be upgraded to Calendar later */}
            <Label htmlFor="start_date">Start Date</Label>
            <Input 
              type="date"
              id="start_date" 
              value={data.start_date || ''}
              onChange={(e) => updateData({ start_date: e.target.value })}
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_date">End Date</Label>
            <Input 
              type="date"
              id="end_date" 
              value={data.end_date || ''}
              onChange={(e) => updateData({ end_date: e.target.value })}
              className="font-mono"
            />
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <Label>Trip Mode</Label>
          <RadioGroup 
            value={data.mode} 
            onValueChange={(val) => updateData({ mode: val })}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div>
              <RadioGroupItem value="SOLO" id="mode-solo" className="peer sr-only" />
              <Label
                htmlFor="mode-solo"
                className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-transparent p-4 hover:bg-muted/50 peer-data-checked:border-primary peer-data-checked:bg-muted/50 cursor-pointer transition-all"
              >
                <User className="mb-3 h-6 w-6" />
                <span className="font-semibold text-center mb-1">Solo Trip</span>
                <span className="text-xs text-center text-muted-foreground font-normal">Just you.</span>
              </Label>
            </div>
            
            <div>
              <RadioGroupItem value="GROUP_FULL" id="mode-group" className="peer sr-only" />
              <Label
                htmlFor="mode-group"
                className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-transparent p-4 hover:bg-muted/50 peer-data-checked:border-primary peer-data-checked:bg-muted/50 cursor-pointer transition-all"
              >
                <Users className="mb-3 h-6 w-6" />
                <span className="font-semibold text-center mb-1">Group (Full)</span>
                <span className="text-xs text-center text-muted-foreground font-normal">Everyone has the app.</span>
              </Label>
            </div>

            <div>
              <RadioGroupItem value="GROUP_KAPTAN_ONLY" id="mode-kaptan" className="peer sr-only" />
              <Label
                htmlFor="mode-kaptan"
                className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-transparent p-4 hover:bg-muted/50 peer-data-checked:border-primary peer-data-checked:bg-muted/50 cursor-pointer transition-all"
              >
                <ShieldCheck className="mb-3 h-6 w-6" />
                <span className="font-semibold text-center mb-1">Kaptan Only</span>
                <span className="text-xs text-center text-muted-foreground font-normal">Only you use the app.</span>
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}
