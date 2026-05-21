import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import { Separator } from '../../ui/separator';

export default function Step2Budget({ data, updateData }) {
  const isINR = data.base_currency === 'INR';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-heading-lg mb-1">Budget (Optional)</h2>
        <p className="text-body-md text-muted-foreground">Set spending limits for your trip.</p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/20">
          <div className="space-y-0.5">
            <Label>Domestic Trip (INR)</Label>
            <p className="text-xs text-muted-foreground">Toggle off for international trips.</p>
          </div>
          <Switch 
            checked={isINR}
            onCheckedChange={(checked) => updateData({ base_currency: checked ? 'INR' : 'USD' })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="total_budget">Total Trip Budget</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">
              {isINR ? '₹' : '$'}
            </span>
            <Input 
              id="total_budget" 
              type="number"
              placeholder="e.g. 50000" 
              value={data.total_budget}
              onChange={(e) => updateData({ total_budget: e.target.value })}
              className="pl-8 text-mono-lg h-12"
            />
          </div>
        </div>

        <Separator />
        
        <div className="space-y-3">
          <Label>Category Limits (Coming soon)</Label>
          <p className="text-xs text-muted-foreground">You can configure specific category limits in the trip settings later.</p>
        </div>
      </div>
    </div>
  );
}
