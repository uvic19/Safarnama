import { Link } from 'react-router-dom';
import FloatingNav from '../../components/layout/FloatingNav';
import Footer from '../../components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Smartphone, Info } from 'lucide-react';

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-white/10 selection:text-white">
      <FloatingNav />

      <main className="pt-32 pb-24 px-6 min-h-[calc(100vh-200px)]">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="inline-flex items-center text-sm font-body text-zinc-400 hover:text-white mb-12 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <div className="p-[1px] rounded-3xl bg-white/[0.05] ring-1 ring-white/[0.05]">
            <div className="rounded-[calc(1.5rem-1px)] bg-card p-8 md:p-12 shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6">
                    <Smartphone className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="font-display text-3xl font-bold text-white mb-4">
                    Get Safarnama for Android
                  </h1>
                  <p className="font-body text-zinc-400 mb-8 leading-relaxed">
                    Install the full experience on your phone. Works offline, loads instantly, and runs smoothly as a Progressive Web App via Trusted Web Activities.
                  </p>
                  
                  <a href="/downloads/safarnama.apk" download>
                    <Button size="lg" className="w-full md:w-auto h-14 px-8 rounded-full bg-white text-black hover:bg-zinc-200 font-body text-base font-semibold group flex items-center justify-center gap-2">
                      <Download className="w-5 h-5" />
                      Download APK — 1.36 MB
                    </Button>
                  </a>
                </div>

                <div className="w-full md:w-64">
                  <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6">
                    <h3 className="font-body font-semibold text-white mb-4 text-sm uppercase tracking-wider">How to Install</h3>
                    <ol className="font-body text-sm text-zinc-400 space-y-3 list-decimal list-inside">
                      <li>Download the APK file</li>
                      <li>Open the downloaded file</li>
                      <li>Allow "Install from unknown sources" if prompted</li>
                      <li>Tap Install</li>
                    </ol>

                    <hr className="border-white/10 my-6" />

                    <h3 className="font-body font-semibold text-white mb-4 text-sm uppercase tracking-wider">Requirements</h3>
                    <ul className="font-body text-sm text-zinc-400 space-y-2 list-disc list-inside">
                      <li>Android 7.0+ (Nougat)</li>
                      <li>~20 MB free storage</li>
                      <li>Chrome 72+ installed</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-zinc-400 font-body text-sm">
                  <Info className="w-4 h-4" />
                  <span>Prefer the web version?</span>
                </div>
                <Link to="/login">
                  <Button variant="outline" className="rounded-full border-white/10 bg-transparent text-white hover:bg-white/5 font-body text-sm">
                    Open Web App →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
