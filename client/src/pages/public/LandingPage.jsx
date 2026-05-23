import FloatingNav from '../../components/layout/FloatingNav';
import Footer from '../../components/layout/Footer';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Crown, ArrowLeftRight, WifiOff, Map as MapIcon, Smartphone, Star, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-[100dvh] bg-[#09090B] text-[#FAFAFA] overflow-x-hidden font-body selection:bg-white/10">
      <FloatingNav />

      <main>
        {/* Section 1 - Hero */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-24 px-6 flex flex-col items-center text-center overflow-hidden">
          <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[60vw] h-[60vh] bg-emerald-900/20 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
          
          <div className="mb-6 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-300 backdrop-blur-md">
            Safarnama v1.0 is Live
          </div>

          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-6 leading-[1.05] max-w-5xl mx-auto">
            Group trips,<br/>
            <span className="text-zinc-500">without the chaos.</span>
          </h1>

          <p className="font-body text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Plan itineraries, track expenses instantly, and settle up with one-tap UPI. The utility-first toolkit for the power traveler.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 z-10 flex-wrap">
            <Link to="/login" className="group flex items-center bg-white text-black rounded-full pl-6 pr-2 py-2 hover:bg-zinc-200 transition-all duration-300">
              <span className="font-body font-semibold text-base mr-4">Start Planning</span>
              <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center transition-transform group-hover:translate-x-1">
                <ArrowRight className="w-4 h-4 text-black" strokeWidth={2.5} />
              </div>
            </Link>
            <Link to="/download" className="group flex items-center rounded-full px-6 py-3 border border-white/10 bg-white/5 hover:bg-white/10 transition-all">
              <span className="font-body font-medium text-base text-white">Download APK</span>
            </Link>
            <Link to="/guide" className="group flex items-center rounded-full px-6 py-3 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all">
              <span className="font-body font-medium text-base text-emerald-400">App Guide</span>
            </Link>
          </div>

          {/* Hero Abstract UI Representation */}
          <div className="relative w-full max-w-4xl mx-auto z-10 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-up px-4">
            <div className="absolute inset-0 bg-white/5 rounded-3xl blur-3xl -z-10"></div>
            
            {/* UI Card 1: Balance */}
            <div className="p-1 rounded-3xl bg-white/[0.03] ring-1 ring-white/10 shadow-2xl backdrop-blur-xl transform md:translate-y-8 md:rotate-[-2deg] transition-transform hover:rotate-0 hover:-translate-y-2">
              <div className="rounded-[calc(1.5rem-4px)] bg-[#121214] p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] text-left">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <ArrowLeftRight className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm text-zinc-400">You are owed</div>
                    <div className="font-mono text-xl font-medium text-emerald-400">₹4,250</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-300">Krish</span>
                    <span className="text-zinc-500 font-mono">₹2,000</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-300">Ved</span>
                    <span className="text-zinc-500 font-mono">₹2,250</span>
                  </div>
                </div>
              </div>
            </div>

            {/* UI Card 2: Expense Numpad Focus */}
            <div className="p-1 rounded-3xl bg-white/[0.03] ring-1 ring-white/10 shadow-2xl backdrop-blur-xl z-10 transition-transform hover:-translate-y-2">
              <div className="h-full rounded-[calc(1.5rem-4px)] bg-[#121214] p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] flex flex-col items-center justify-center text-center">
                <div className="text-zinc-400 mb-2">Dinner at Thalassa</div>
                <div className="font-mono text-4xl text-white mb-6 tracking-tight">₹3,400</div>
                <div className="grid grid-cols-3 gap-2 w-full">
                  {[1,2,3,4,5,6,7,8,9,'.',0,'⌫'].map(k => (
                    <div key={k} className="h-10 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400 font-mono text-sm">{k}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* UI Card 3: Itinerary */}
            <div className="hidden md:block p-1 rounded-3xl bg-white/[0.03] ring-1 ring-white/10 shadow-2xl backdrop-blur-xl transform translate-y-8 rotate-[2deg] transition-transform hover:rotate-0 hover:-translate-y-2">
              <div className="h-full rounded-[calc(1.5rem-4px)] bg-[#121214] p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] text-left">
                <div className="text-xs uppercase tracking-wider text-zinc-500 mb-4">Day 2 • Goa</div>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <div className="w-px h-8 bg-white/10 my-1"></div>
                    </div>
                    <div className="flex-1 -mt-1">
                      <div className="text-sm font-medium text-white">Baga Beach</div>
                      <div className="text-xs text-zinc-500">10:00 AM</div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-white/20"></div>
                    </div>
                    <div className="flex-1 -mt-1">
                      <div className="text-sm font-medium text-white">Chapora Fort</div>
                      <div className="text-xs text-zinc-500">4:30 PM</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2 - Features (Dense Bento) */}
        <section id="features" className="py-24 px-6 max-w-[1200px] mx-auto border-t border-white/5">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">Everything you need, nothing you don't.</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Feature 1 - Fast Logging */}
            <div className="p-[1px] rounded-3xl bg-white/[0.03] ring-1 ring-white/5 hover:ring-white/10 transition-all">
              <div className="h-full rounded-[calc(1.5rem-1px)] bg-[#0C0C0E] p-8 flex flex-col">
                <Zap className="w-6 h-6 text-yellow-500 mb-4" />
                <h3 className="font-display text-xl font-semibold text-white mb-2">10-Second Logs</h3>
                <p className="font-body text-zinc-400 text-sm leading-relaxed mb-6">
                  Skip the math. Enter the bill, tap who paid, and select who shares it. Safarnama handles the complex splits instantly.
                </p>
                <div className="mt-auto flex gap-2">
                  <div className="px-3 py-1.5 rounded-md bg-yellow-500/10 text-yellow-500 text-xs font-medium">Food</div>
                  <div className="px-3 py-1.5 rounded-md bg-blue-500/10 text-blue-500 text-xs font-medium">Travel</div>
                  <div className="px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-500 text-xs font-medium">Fuel</div>
                </div>
              </div>
            </div>

            {/* Feature 2 - Smart Settlement */}
            <div className="p-[1px] rounded-3xl bg-white/[0.03] ring-1 ring-white/5 hover:ring-white/10 transition-all">
              <div className="h-full rounded-[calc(1.5rem-1px)] bg-[#0C0C0E] p-8 flex flex-col">
                <ArrowLeftRight className="w-6 h-6 text-blue-400 mb-4" />
                <h3 className="font-display text-xl font-semibold text-white mb-2">Smart Settlement</h3>
                <p className="font-body text-zinc-400 text-sm leading-relaxed mb-6">
                  Our algorithm calculates the absolute minimum number of transactions needed for everyone to get paid back.
                </p>
                <div className="mt-auto bg-white/5 rounded-lg p-3 flex justify-between items-center">
                  <span className="text-xs text-white">Rahul → Krish</span>
                  <span className="text-xs font-mono text-emerald-400">₹1,200</span>
                </div>
              </div>
            </div>

            {/* Feature 3 - UPI */}
            <div className="p-[1px] rounded-3xl bg-white/[0.03] ring-1 ring-white/5 hover:ring-white/10 transition-all">
              <div className="h-full rounded-[calc(1.5rem-1px)] bg-[#0C0C0E] p-8 flex flex-col">
                <Smartphone className="w-6 h-6 text-violet-400 mb-4" />
                <h3 className="font-display text-xl font-semibold text-white mb-2">1-Tap UPI</h3>
                <p className="font-body text-zinc-400 text-sm leading-relaxed mb-6">
                  India-first feature. Settle balances directly through GPay, PhonePe, or Paytm with auto-generated deep links.
                </p>
                <button className="mt-auto w-full py-2.5 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/15 transition-colors">
                  Pay via UPI
                </button>
              </div>
            </div>

            {/* Feature 4 - Offline */}
            <div className="lg:col-span-2 p-[1px] rounded-3xl bg-white/[0.03] ring-1 ring-white/5 hover:ring-white/10 transition-all">
              <div className="h-full rounded-[calc(1.5rem-1px)] bg-[#0C0C0E] p-8 flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1">
                  <WifiOff className="w-6 h-6 text-zinc-400 mb-4" />
                  <h3 className="font-display text-xl font-semibold text-white mb-2">Works Offline</h3>
                  <p className="font-body text-zinc-400 text-sm leading-relaxed">
                    No signal in the mountains? No problem. Safarnama is a Progressive Web App that works completely offline. Log expenses locally and they'll sync securely the moment you reconnect.
                  </p>
                </div>
                <div className="w-full md:w-48 h-24 bg-zinc-900 rounded-xl border border-white/5 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-zinc-500 text-sm">
                    <CheckCircle2 className="w-4 h-4" /> Sync pending (3)
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 5 - Map */}
            <div className="p-[1px] rounded-3xl bg-white/[0.03] ring-1 ring-white/5 hover:ring-white/10 transition-all">
              <div className="h-full rounded-[calc(1.5rem-1px)] bg-[#0C0C0E] p-8 flex flex-col">
                <MapIcon className="w-6 h-6 text-emerald-400 mb-4" />
                <h3 className="font-display text-xl font-semibold text-white mb-2">Map & Itinerary</h3>
                <p className="font-body text-zinc-400 text-sm leading-relaxed">
                  Plan stops, calculate distances, and build a day-by-day visual timeline of your adventure.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Section 3 - How It Works (Dense) */}
        <section id="how-it-works" className="py-24 px-6 border-t border-white/5 bg-[#050505]">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-white mb-12 text-center">Three simple steps</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-[#0A0A0C] border border-white/5">
                <div className="text-4xl font-display font-bold text-white/10 mb-4">01</div>
                <h3 className="font-display text-lg font-semibold text-white mb-2">Create & Invite</h3>
                <p className="font-body text-zinc-400 text-sm">Set up your trip and share the 6-digit invite code. Everyone joins instantly.</p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0A0A0C] border border-white/5">
                <div className="text-4xl font-display font-bold text-white/10 mb-4">02</div>
                <h3 className="font-display text-lg font-semibold text-white mb-2">Log on the go</h3>
                <p className="font-body text-zinc-400 text-sm">Add expenses, lock plans, and track your group budget in real-time.</p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0A0A0C] border border-white/5">
                <div className="text-4xl font-display font-bold text-white/10 mb-4">03</div>
                <h3 className="font-display text-lg font-semibold text-white mb-2">Settle in 1-tap</h3>
                <p className="font-body text-zinc-400 text-sm">Trip ends. Safarnama calculates the balances. Settle instantly via UPI.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 - CTA */}
        <section className="py-24 px-6 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center p-2 bg-white/5 rounded-full mb-6">
            <Star className="w-4 h-4 text-yellow-500 mx-2" />
            <span className="font-mono text-xs text-zinc-400 pr-4">Open Source Software</span>
          </div>
          
          <h2 className="font-display text-4xl font-bold text-white mb-8">Ready for your next trip?</h2>
          
          <div className="flex justify-center gap-4">
            <Link to="/login" className="px-8 py-3 rounded-full bg-white text-black font-semibold hover:bg-zinc-200 transition-colors">
              Open Web App
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
