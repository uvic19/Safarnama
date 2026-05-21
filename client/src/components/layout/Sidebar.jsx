import { LayoutDashboard, Compass, User, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';

export default function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { logout } = useAuth();

  const tabs = [
    { name: 'My Trips', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Templates', path: '/templates', icon: Compass },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="h-full flex flex-col py-6 px-4">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-display font-bold text-black text-lg">
          S
        </div>
        <span className="font-display text-xl font-bold tracking-tight text-white">Safarnama</span>
      </div>

      <nav className="flex-1 space-y-1">
        {tabs.map((tab) => {
          const isActive = currentPath === tab.path || (tab.path !== '/dashboard' && currentPath.startsWith(tab.path));
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              to={tab.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group",
                isActive 
                  ? "bg-white/10 text-white" 
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className={cn("w-5 h-5 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110", isActive && "text-white")} strokeWidth={isActive ? 2.5 : 2} />
              <span className="font-medium text-sm">{tab.name}</span>
            </Link>
          );
        })}
      </nav>

      <button 
        onClick={() => logout()}
        className="flex items-center gap-3 px-3 py-2.5 mt-auto rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group"
      >
        <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
        <span className="font-medium text-sm">Sign Out</span>
      </button>
    </div>
  );
}
