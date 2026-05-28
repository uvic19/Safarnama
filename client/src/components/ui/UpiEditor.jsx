import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from './button';
import { Input } from './input';
import { Edit3 } from 'lucide-react';

/**
 * Reusable UPI ID editor card body.
 * Handles display, edit toggle, save, and cancel.
 *
 * @param {{ value: string, onSave: (newUpiId: string) => Promise<void>, label?: string, hint?: string }} props
 */
export default function UpiEditor({ value, onSave, label = 'UPI ID', hint = 'Add your UPI ID for easy payments.' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(draft);
      setEditing(false);
    } catch {
      toast.error('Failed to save UPI ID');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-white/[0.02] ring-1 ring-white/[0.06]">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-sm font-medium text-foreground mb-1">{label}</h3>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        {!editing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setDraft(value || ''); setEditing(true); }}
            className="h-8 text-muted-foreground hover:text-foreground"
          >
            <Edit3 className="w-4 h-4 mr-1.5" /> Edit
          </Button>
        )}
      </div>

      {editing ? (
        <div className="flex gap-2 mt-4">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g., name@okbank"
            className="bg-white/[0.04]"
          />
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-primary-foreground font-medium w-20"
          >
            {saving ? '...' : 'Save'}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setEditing(false)}
            disabled={saving}
            className="text-muted-foreground"
          >
            Cancel
          </Button>
        </div>
      ) : (
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/[0.05] ring-1 ring-white/[0.1]">
          <span className="font-mono text-sm text-primary">{value || 'Not set'}</span>
        </div>
      )}
    </div>
  );
}
