import { Bell, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';

export default function TopBar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="w-8 h-8 border border-white/10 shadow-sm cursor-pointer hover:ring-2 hover:ring-white/20 transition-all outline-none">
              <AvatarImage src={user?.photoURL} />
              <AvatarFallback className="bg-zinc-800 text-zinc-300 text-xs">{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2 bg-[#121214] border border-white/10 text-white rounded-xl p-1.5 shadow-2xl z-50">
            <DropdownMenuLabel className="px-2.5 py-2 text-xs font-normal text-zinc-400">
              <div className="font-medium text-white text-sm mb-0.5 truncate">{user?.displayName || 'Traveler'}</div>
              <div className="truncate text-[11px] text-zinc-500">{user?.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/5 my-1" />
            <DropdownMenuItem 
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/5 cursor-pointer outline-none transition-colors"
            >
              <UserIcon className="w-4 h-4 text-zinc-500" />
              <span>My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/5 my-1" />
            <DropdownMenuItem 
              onClick={() => logout()}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer outline-none transition-colors"
            >
              <LogOut className="w-4 h-4 text-red-400/70" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
