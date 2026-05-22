import { useState, useEffect } from 'react';
import { Bell, LogOut, User as UserIcon, WifiOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';

export default function TopBar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'users', user.uid, 'notifications'),
      where('is_read', '==', false)
    );
    const unsub = onSnapshot(q, (snap) => {
      setUnreadCount(snap.docs.length);
    });
    return unsub;
  }, [user]);

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
        {!isOnline && (
          <div className="flex items-center justify-center p-1.5 rounded-full bg-rose-500/10" title="You are offline. Changes will sync later.">
            <WifiOff className="w-4 h-4 text-rose-500" />
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full relative text-zinc-400 hover:text-white hover:bg-white/5"
          onClick={() => navigate('/notifications')}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-[#09090B]"></span>
          )}
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none hover:ring-2 hover:ring-white/20 rounded-full transition-all">
            <Avatar className="w-8 h-8 border border-white/10 shadow-sm cursor-pointer">
              <AvatarImage src={user?.photoURL} />
              <AvatarFallback className="bg-zinc-800 text-zinc-300 text-xs">{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2 bg-[#121214] border border-white/10 text-white rounded-xl p-1.5 shadow-2xl z-50">
            <div className="px-2.5 py-2 text-xs font-normal text-zinc-400">
              <div className="font-medium text-white text-sm mb-0.5 truncate">{user?.displayName || 'Traveler'}</div>
              <div className="truncate text-[11px] text-zinc-500">{user?.email}</div>
            </div>
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
            
            {('Notification' in window) && Notification.permission !== 'granted' && (
              <>
                <DropdownMenuSeparator className="bg-white/5 my-1" />
                <DropdownMenuItem 
                  onClick={async () => {
                    try {
                      const permission = await Notification.requestPermission();
                      if (permission === 'granted') {
                        alert("Notifications enabled! Please refresh the app to register your device.");
                      } else {
                        alert("Permission denied. You may need to enable it in your browser settings.");
                      }
                    } catch(e) {
                      console.error(e);
                    }
                  }}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 cursor-pointer outline-none transition-colors"
                >
                  <Bell className="w-4 h-4 text-emerald-400/70" />
                  <span>Enable Push Notifications</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
