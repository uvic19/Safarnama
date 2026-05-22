import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { User, Users, ShieldCheck } from 'lucide-react';
import { tripService } from '../../services/tripService';
import { toast } from 'sonner';

export default function EditTripSheet({ open, onClose, trip }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    destinations: '',
    start_date: '',
    end_date: '',
    total_budget: '',
    mode: 'SOLO'
  });

  useEffect(() => {
    if (trip && open) {
      setFormData({
        name: trip.name || '',
        destinations: Array.isArray(trip.destinations) ? trip.destinations.join(', ') : '',
        start_date: trip.start_date || '',
        end_date: trip.end_date || '',
        total_budget: trip.total_budget || '',
        mode: trip.mode || 'SOLO'
      });
    }
  }, [trip, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!trip?.id) return;
    
    if (!formData.name.trim()) {
      toast.error('Trip name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await tripService.updateTrip(trip.id, formData, trip);
      toast.success('Trip updated successfully');
      onClose(true); // pass true to indicate it was updated
    } catch (error) {
      toast.error('Failed to update trip');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
      <SheetContent side="bottom" className="h-[85vh] sm:h-auto sm:max-w-md sm:right-0 sm:bottom-auto sm:top-0 sm:border-l sm:rounded-l-2xl sm:border-t-0 rounded-t-2xl bg-background px-6 pt-6 pb-8 overflow-y-auto">
        <SheetHeader className="mb-6 text-left">
          <SheetTitle>Edit Trip</SheetTitle>
          <SheetDescription>
            Update the basic details of your trip.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Trip Name</Label>
            <Input 
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Goa Getaway" 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destinations">Destination(s)</Label>
            <Input 
              id="destinations"
              name="destinations"
              value={formData.destinations}
              onChange={handleChange}
              placeholder="e.g., Goa, Gokarna" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input 
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input 
                type="date"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="total_budget">Total Budget (Optional)</Label>
            <Input 
              type="number"
              id="total_budget"
              name="total_budget"
              value={formData.total_budget}
              onChange={handleChange}
              placeholder="e.g., 50000"
              className="font-mono"
            />
          </div>

          <div className="space-y-4 pt-2">
            <Label>Trip Mode</Label>
            <RadioGroup 
              value={formData.mode} 
              onValueChange={(val) => setFormData(prev => ({ ...prev, mode: val }))}
              className="grid grid-cols-1 md:grid-cols-3 gap-3"
            >
              <div>
                <RadioGroupItem value="SOLO" id="mode-solo" className="peer sr-only" />
                <Label
                  htmlFor="mode-solo"
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-transparent p-3 hover:bg-muted/50 peer-data-checked:border-primary peer-data-checked:bg-muted/50 cursor-pointer transition-all"
                >
                  <User className="mb-2 h-5 w-5" />
                  <span className="font-semibold text-center text-sm mb-1">Solo</span>
                </Label>
              </div>
              
              <div>
                <RadioGroupItem value="GROUP_FULL" id="mode-group" className="peer sr-only" />
                <Label
                  htmlFor="mode-group"
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-transparent p-3 hover:bg-muted/50 peer-data-checked:border-primary peer-data-checked:bg-muted/50 cursor-pointer transition-all"
                >
                  <Users className="mb-2 h-5 w-5" />
                  <span className="font-semibold text-center text-sm mb-1">Group</span>
                </Label>
              </div>

              <div>
                <RadioGroupItem value="GROUP_KAPTAN_ONLY" id="mode-kaptan" className="peer sr-only" />
                <Label
                  htmlFor="mode-kaptan"
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-transparent p-3 hover:bg-muted/50 peer-data-checked:border-primary peer-data-checked:bg-muted/50 cursor-pointer transition-all"
                >
                  <ShieldCheck className="mb-2 h-5 w-5" />
                  <span className="font-semibold text-center text-sm mb-1">Kaptan Only</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="pt-6 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => onClose()} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
