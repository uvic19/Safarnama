import { useState } from 'react';
import { QrCode, ExternalLink, Copy, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';

export default function UPIButton({ upiId, amount, payeeName }) {
  const [copied, setCopied] = useState(false);

  if (!upiId) {
    return (
      <span className="text-xs text-muted-foreground px-2 py-1 rounded bg-white/[0.05]">No UPI ID</span>
    );
  }

  // Construct UPI Deep Link URL
  // upi://pay?pa=UPIID&pn=NAME&am=AMOUNT&cu=INR&tn=SafarnamaSettlement
  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName || 'Safarnama User')}&am=${amount}&cu=INR&tn=SafarnamaSettlement`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    toast.success('UPI ID copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 px-3 rounded-md bg-white/[0.04] border-white/[0.08] text-foreground hover:bg-white/[0.08] hover:text-white"
        onClick={() => {
          // Attempt to open UPI app deep link
          window.location.href = upiUrl;
        }}
      >
        <ExternalLink className="w-3.5 h-3.5 text-primary" />
        Pay via UPI
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/[0.08]"
        onClick={copyToClipboard}
        title="Copy UPI ID"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
      </Button>
    </div>
  );
}
