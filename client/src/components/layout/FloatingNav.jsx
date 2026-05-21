import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FloatingNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-300 ease-out-expo ${
        isScrolled ? 'mt-4 opacity-90' : 'mt-6 opacity-100'
      }`}
    >
      <div className="mx-4 flex w-full max-w-4xl items-center justify-between rounded-full border border-white/10 bg-black/40 px-6 py-3 backdrop-blur-xl shadow-lg ring-1 ring-white/5">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-xl font-bold tracking-tight text-white">
            Safarnama
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="font-body text-sm text-zinc-400 transition-colors hover:text-white">
            Features
          </a>
          <a href="#how-it-works" className="font-body text-sm text-zinc-400 transition-colors hover:text-white">
            How it Works
          </a>
          <Link to="/download" className="font-body text-sm text-zinc-400 transition-colors hover:text-white">
            Download APK
          </Link>
          <div className="h-4 w-px bg-white/10"></div>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 font-body text-sm text-white transition-opacity hover:opacity-80">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
            <span>GitHub</span>
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="p-1 text-zinc-400 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="absolute left-4 right-4 top-20 flex flex-col gap-4 rounded-2xl border border-white/10 bg-zinc-950/95 p-6 backdrop-blur-xl shadow-2xl md:hidden">
          <a href="#features" className="font-body text-lg text-white" onClick={() => setMobileMenuOpen(false)}>Features</a>
          <a href="#how-it-works" className="font-body text-lg text-white" onClick={() => setMobileMenuOpen(false)}>How it Works</a>
          <Link to="/download" className="font-body text-lg text-white" onClick={() => setMobileMenuOpen(false)}>Download APK</Link>
          <hr className="border-white/10" />
          <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 font-body text-lg text-white">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
            GitHub
          </a>
        </div>
      )}
    </nav>
  );
}
