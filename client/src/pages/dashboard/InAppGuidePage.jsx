import { 
  Zap, 
  ArrowLeftRight, 
  Smartphone, 
  WifiOff, 
  Map as MapIcon, 
  Plus, 
  Users, 
  Wallet, 
  CheckCircle2,
  BookOpen,
  Settings,
  Download,
  Share2
} from 'lucide-react';

export default function InAppGuidePage() {
  return (
    <div className="min-h-full bg-[#09090B] text-[#FAFAFA] font-body selection:bg-white/10 p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center justify-center p-2 bg-white/5 rounded-full mb-4 ring-1 ring-white/10">
          <BookOpen className="w-4 h-4 text-blue-400 mx-2" />
          <span className="font-mono text-xs text-zinc-300 pr-4 uppercase tracking-wider">App Manual</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-white mb-3 tracking-tight">
          Master Safarnama
        </h1>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Your complete guide to managing group trips, expenses, and settlements like a pro.
        </p>
      </div>

      {/* Deep Dive Features */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-white flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-yellow-500" /> Advanced Expense Logging
        </h2>
        <div className="p-4 rounded-2xl bg-white/[0.03] ring-1 ring-white/5 space-y-3">
          <p className="text-sm text-zinc-300 leading-relaxed">
            When you tap the <strong>+</strong> button in a trip, you unlock our smart expense engine:
          </p>
          <ul className="space-y-2 text-sm text-zinc-400 list-disc list-inside ml-2">
            <li><strong>Exact Splits:</strong> Tap "Exact" to enter specific unequal amounts for each person.</li>
            <li><strong>Equal Splits:</strong> Tap "Equal" to split equally, and simply uncheck members who weren't part of the expense.</li>
            <li><strong>Multi-Currency:</strong> Select a different currency and we automatically fetch the live exchange rate to convert it.</li>
            <li><strong>Kaptan Approvals:</strong> If you aren't the Kaptan, your logged expenses automatically go to "Pending" until approved.</li>
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-white flex items-center gap-2 mb-4">
          <ArrowLeftRight className="w-5 h-5 text-blue-400" /> Smart Settlements Explained
        </h2>
        <div className="p-4 rounded-2xl bg-white/[0.03] ring-1 ring-white/5 space-y-3">
          <p className="text-sm text-zinc-300 leading-relaxed">
            Safarnama uses a debt-simplification algorithm. Instead of John paying Jane $10, and Jane paying Bob $10, the app simply tells John to pay Bob $10.
          </p>
          <div className="bg-black/30 p-3 rounded-xl border border-white/5">
            <span className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">How to settle:</span>
            <ol className="space-y-2 text-sm text-zinc-400 list-decimal list-inside ml-1">
              <li>Go to the <strong>Balances</strong> tab.</li>
              <li>Tap on any person you owe money to.</li>
              <li>Tap <strong>Settle Up</strong>. If you are in India, you can use the 1-Tap UPI feature to automatically open GPay/PhonePe with the exact amount.</li>
              <li>Confirm the settlement, and the balance drops to zero!</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-white flex items-center gap-2 mb-4">
          <MapIcon className="w-5 h-5 text-emerald-400" /> Map & Itineraries
        </h2>
        <div className="p-4 rounded-2xl bg-white/[0.03] ring-1 ring-white/5 space-y-3">
          <p className="text-sm text-zinc-300 leading-relaxed">
            Stop switching between Notes and Google Maps. Use the <strong>Itinerary</strong> tab to:
          </p>
          <ul className="space-y-2 text-sm text-zinc-400 list-disc list-inside ml-2">
            <li>Add places you want to visit for specific days.</li>
            <li>Reorder them by dragging to optimize your route.</li>
            <li>Tap on any place to instantly open it in your maps app for directions.</li>
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-white flex items-center gap-2 mb-4">
          <WifiOff className="w-5 h-5 text-zinc-400" /> Using Safarnama Offline
        </h2>
        <div className="p-4 rounded-2xl bg-white/[0.03] ring-1 ring-white/5 space-y-3">
          <p className="text-sm text-zinc-300 leading-relaxed">
            Since you have the App installed, it acts as an offline-first database.
          </p>
          <p className="text-sm text-zinc-400 leading-relaxed">
            If you lose internet connection on a trek, you can still add expenses. A small red <WifiOff className="w-3 h-3 inline text-red-400" /> icon will appear in the top bar. The moment you reconnect to Wi-Fi or cellular data, all your pending logs will sync to the cloud and notify your friends!
          </p>
        </div>
      </section>

      {/* Quick Actions Guide */}
      <section className="pt-4 border-t border-white/10">
        <h2 className="font-display text-lg font-semibold text-white mb-4">Hidden Tricks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex gap-3 items-start p-3 rounded-xl bg-white/5">
            <Share2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-medium text-white mb-1">Share Invite Code</div>
              <div className="text-xs text-zinc-400">Simply tap the 'Copy' button next to the 6-digit invite code in the trip overview to copy it to your clipboard.</div>
            </div>
          </div>
          <div className="flex gap-3 items-start p-3 rounded-xl bg-white/5">
            <Download className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-medium text-white mb-1">Export to PDF</div>
              <div className="text-xs text-zinc-400">At the end of the trip, go to the Export tab to generate a beautifully formatted PDF report of all your expenses.</div>
            </div>
          </div>
        </div>
      </section>
      
      <div className="pb-8"></div>
    </div>
  );
}
