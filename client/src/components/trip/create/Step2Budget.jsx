import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Separator } from '../../ui/separator';

const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'د.إ',
  SGD: 'S$',
  AUD: 'A$',
  CAD: 'C$'
};

export default function Step2Budget({ data, updateData }) {
  const symbol = CURRENCY_SYMBOLS[data.base_currency || 'INR'] || '$';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-heading-lg mb-1">Budget & Currency (Optional)</h2>
        <p className="text-body-md text-muted-foreground">Set spending limits and base currency for your trip.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Base Currency</Label>
          <Select 
            value={data.base_currency || 'INR'} 
            onValueChange={(val) => updateData({ base_currency: val })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INR">INR (₹) - Indian Rupee</SelectItem>
              <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
              <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
              <SelectItem value="GBP">GBP (£) - British Pound</SelectItem>
              <SelectItem value="AED">AED (د.إ) - UAE Dirham</SelectItem>
              <SelectItem value="SGD">SGD (S$) - Singapore Dollar</SelectItem>
              <SelectItem value="AUD">AUD (A$) - Australian Dollar</SelectItem>
              <SelectItem value="CAD">CAD (C$) - Canadian Dollar</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">All expenses and balances will be converted and shown in this currency.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="total_budget">Total Trip Budget</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">
              {symbol}
            </span>
            <Input 
              id="total_budget" 
              type="number"
              placeholder="e.g. 50000" 
              value={data.total_budget}
              onChange={(e) => updateData({ total_budget: e.target.value })}
              className="pl-10 text-mono-lg h-12"
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
