import { Bell } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { useLocation } from 'react-router-dom';

export default function TopBar() {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname === '/dashboard') return 'My Trips';
    if (location.pathname === '/profile') return 'Profile';
    if (location.pathname === '/templates') return 'Templates';
    if (location.pathname.startsWith('/trips/')) return 'Trip Details';
    return 'Safarnama';
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-white/5 bg-[#09090B]/80 backdrop-blur-xl sticky top-0 z-30">
      <h1 className="font-display text-xl font-semibold text-white tracking-tight">{getPageTitle()}</h1>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full relative text-zinc-400 hover:text-white hover:bg-white/5">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-[#09090B]"></span>
        </Button>
        <Avatar className="w-8 h-8 border border-white/10 shadow-sm cursor-pointer hover:ring-2 hover:ring-white/20 transition-all">
          <AvatarImage src={user?.photoURL} />
          <AvatarFallback className="bg-zinc-800 text-zinc-300 text-xs">{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
