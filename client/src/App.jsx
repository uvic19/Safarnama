import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LandingPage from './pages/public/LandingPage';
import DownloadPage from './pages/public/DownloadPage';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import CreateTripPage from './pages/trip/CreateTripPage';
import TripOverviewPage from './pages/trip/TripOverviewPage';
import JoinTripPage from './pages/trip/JoinTripPage';
import ExpenseListPage from './pages/trip/ExpenseListPage';
import PendingExpensesPage from './pages/trip/PendingExpensesPage';
import BalancePage from './pages/trip/BalancePage';
import SettlementPage from './pages/trip/SettlementPage';
import ItineraryPage from './pages/trip/ItineraryPage';
import AppShell from './components/layout/AppShell';

// A simple AuthGuard wrapper
function AuthGuard({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-[100dvh] w-full bg-[#09090B] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/download" element={<DownloadPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Authenticated Routes wrapped in AppShell */}
        <Route 
          element={
            <AuthGuard>
              <AppShell />
            </AuthGuard>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/trips/new" element={<CreateTripPage />} />
          <Route path="/trips/join" element={<JoinTripPage />} />
          <Route path="/trips/:id" element={<TripOverviewPage />} />
          <Route path="/trips/:id/expenses" element={<ExpenseListPage />} />
          <Route path="/trips/:id/expenses/pending" element={<PendingExpensesPage />} />
          <Route path="/trips/:id/balances" element={<BalancePage />} />
          <Route path="/trips/:id/settlement" element={<SettlementPage />} />
          <Route path="/trips/:id/itinerary" element={<ItineraryPage />} />
          <Route path="/templates" element={<div className="p-8 text-white animate-fade-up">Explore Templates (Phase 7)</div>} />
          <Route path="/profile" element={<div className="p-8 text-white animate-fade-up">Profile (Phase 7)</div>} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
