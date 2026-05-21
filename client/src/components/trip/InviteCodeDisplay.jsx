import { Check, Copy, Users } from 'lucide-react';
import { useState } from 'react';

export default function InviteCodeDisplay({ inviteCode }) {
  const [copied, setCopied] = useState(false);

  if (!inviteCode) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="mb-6 rounded-2xl border border-border bg-white/[0.03] p-4 ring-1 ring-white/[0.04]">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Users className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">Invite friends</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Friends can join from Join Trip using this code.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <code className="rounded-md border border-border bg-background px-3 py-2 font-mono text-lg font-semibold tracking-[0.18em] text-foreground">
              {inviteCode}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-white/[0.04] px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
