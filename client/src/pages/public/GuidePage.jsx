import FloatingNav from '../../components/layout/FloatingNav';
import Footer from '../../components/layout/Footer';
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
  Info
} from 'lucide-react';

export default function GuidePage() {
  return (
    <div className="min-h-[100dvh] bg-[#09090B] text-[#FAFAFA] font-body selection:bg-white/10">
      <FloatingNav />

      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center p-2 bg-white/5 rounded-full mb-6 ring-1 ring-white/10">
            <Info className="w-4 h-4 text-emerald-400 mx-2" />
            <span className="font-mono text-xs text-zinc-300 pr-4 uppercase tracking-wider">User Guide</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            How to use Safarnama
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed font-light">
            Everything you need to know to master group trips. From creating itineraries to settling up with zero math.
          </p>
        </div>

        {/* Section: Core Features */}
        <div className="mb-16">
          <h2 className="font-display text-2xl font-semibold text-white mb-8 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-sm">1</span>
            </div>
            Core Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureCard 
              icon={<Zap className="w-5 h-5 text-yellow-500" />}
              title="Lightning Fast Logs"
              description="Enter the amount, select who paid, and who shares it. We handle all the complex splits instantly behind the scenes."
            />
            <FeatureCard 
              icon={<ArrowLeftRight className="w-5 h-5 text-blue-400" />}
              title="Smart Settlement"
              description="Our algorithm calculates the absolute minimum number of transactions needed for everyone to get paid back correctly."
            />
            <FeatureCard 
              icon={<Smartphone className="w-5 h-5 text-violet-400" />}
              title="1-Tap UPI Integration"
              description="Settle balances directly through Google Pay, PhonePe, or Paytm with auto-generated deep links. No scanning QR codes manually."
            />
            <FeatureCard 
              icon={<WifiOff className="w-5 h-5 text-zinc-400" />}
              title="Fully Offline Capable"
              description="No signal? You can still log expenses and view itineraries. Safarnama syncs perfectly the moment you reconnect."
            />
            <FeatureCard 
              icon={<MapIcon className="w-5 h-5 text-emerald-400" />}
              title="Map & Itinerary"
              description="Plan your daily stops and visualize your entire adventure on a map, day by day."
            />
          </div>
        </div>

        {/* Section: Step by step Guide */}
        <div className="mb-16">
          <h2 className="font-display text-2xl font-semibold text-white mb-8 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-sm">2</span>
            </div>
            Step-by-Step Actions
          </h2>
          <div className="space-y-6">
            <ActionRow 
              icon={<Plus className="w-5 h-5 text-emerald-400" />}
              title="Creating a Trip & Inviting Friends"
              steps={[
                "Click 'Create Trip' on your dashboard.",
                "Give your trip a destination, dates, and cover image.",
                "Share the 6-digit invite code or direct link with your group.",
                "They click 'Join Trip', enter the code, and are instantly added."
              ]}
            />
            <ActionRow 
              icon={<Wallet className="w-5 h-5 text-blue-400" />}
              title="Logging an Expense"
              steps={[
                "Navigate to your trip and click the 'Add Expense' button (+).",
                "Enter the amount and a short description (e.g., 'Dinner at Thalassa').",
                "Select 'Who Paid' (default is you).",
                "Select 'Who Shares It'. You can split equally, by exact amounts, or by percentages.",
                "Save! Balances update instantly for everyone."
              ]}
            />
            <ActionRow 
              icon={<Users className="w-5 h-5 text-yellow-500" />}
              title="Viewing Balances & Settling Up"
              steps={[
                "Go to the 'Balances' tab in your trip view.",
                "You will see exactly who owes whom, simplified to minimize total transactions.",
                "To pay someone, click on their name. Tap 'Pay via UPI' to open your phone's UPI app with the exact amount pre-filled.",
                "Once paid, mark it as 'Settled' to clear the debt from the system."
              ]}
            />
          </div>
        </div>

        {/* Section: Pro Tips */}
        <div>
          <h2 className="font-display text-2xl font-semibold text-white mb-8 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-sm">3</span>
            </div>
            Pro Tips
          </h2>
          <div className="p-1 rounded-2xl bg-white/[0.03] ring-1 ring-white/5">
            <div className="rounded-[calc(1rem-1px)] bg-[#0C0C0E] p-6 space-y-4">
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-medium mb-1">Add as an App</h4>
                  <p className="text-sm text-zinc-400">On iOS (Safari) or Android (Chrome), tap "Share" and select "Add to Home Screen" to install Safarnama as an app on your phone.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-medium mb-1">Use Templates</h4>
                  <p className="text-sm text-zinc-400">Save your packing lists and common itineraries as templates from the Templates tab to reuse them for future trips.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-medium mb-1">Export Data</h4>
                  <p className="text-sm text-zinc-400">Need a spreadsheet? Go to the Export tab in your trip to download all expenses as a CSV file or share a beautiful PDF summary.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-1 rounded-2xl bg-white/[0.03] ring-1 ring-white/5 hover:ring-white/10 transition-all">
      <div className="h-full rounded-[calc(1rem-1px)] bg-[#0C0C0E] p-6">
        <div className="mb-4">{icon}</div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function ActionRow({ icon, title, steps }) {
  return (
    <div className="p-1 rounded-2xl bg-white/[0.03] ring-1 ring-white/5">
      <div className="rounded-[calc(1rem-1px)] bg-[#0C0C0E] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/5 rounded-xl">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <ul className="space-y-3 mt-2">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="text-zinc-600 font-mono mt-0.5">{i + 1}.</span>
              <span className="text-zinc-300 leading-relaxed">{step}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
