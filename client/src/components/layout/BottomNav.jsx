import { LayoutDashboard, Compass, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

export default function BottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  const tabs = [
    { name: 'Trips', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Explore', path: '/templates', icon: Compass },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0C0C0E]/90 backdrop-blur-2xl border-t border-white/5 z-40 flex items-center justify-around px-2 pb-safe">
      {tabs.map((tab) => {
        const isActive = currentPath === tab.path || (tab.path !== '/dashboard' && currentPath.startsWith(tab.path));
        const Icon = tab.icon;
        
        return (
          <Link
            key={tab.name}
            to={tab.path}
            className={cn(
              "flex flex-col items-center justify-center w-16 h-12 gap-1 transition-all duration-300",
              isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Icon className={cn("w-5 h-5 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{tab.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
