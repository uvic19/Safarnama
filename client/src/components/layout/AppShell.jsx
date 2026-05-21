import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

export default function AppShell() {
  return (
    <div className="flex h-[100dvh] w-full bg-[#09090B] text-foreground overflow-hidden font-body selection:bg-white/10">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r border-border bg-[#0C0C0E]">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0 scroll-smooth">
          <Outlet />
        </main>
        
        {/* Mobile Bottom Nav */}
        <BottomNav />
      </div>
    </div>
  );
}
