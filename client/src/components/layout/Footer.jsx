import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <span className="font-display text-xl font-bold text-white">Safarnama</span>
            <span className="font-body text-sm text-zinc-500">Plan. Track. Settle. One Trip at a Time.</span>
          </div>
          
          <div className="flex items-center gap-6">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="font-body text-sm text-zinc-400 hover:text-white transition-colors">GitHub</a>
            <Link to="/privacy" className="font-body text-sm text-zinc-400 hover:text-white transition-colors">Privacy</Link>
            <a href="mailto:hello@kridleapps.tech" className="font-body text-sm text-zinc-400 hover:text-white transition-colors">Contact</a>
          </div>
        </div>
        
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 md:flex-row">
          <p className="font-body text-xs text-zinc-600">
            &copy; 2026 Safarnama. Open Source Travel OS.
          </p>
          <p className="font-body text-xs text-zinc-600">
            Made with ☕ by KridleApps
          </p>
        </div>
      </div>
    </footer>
  );
}
