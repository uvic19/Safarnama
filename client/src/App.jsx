import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LandingPage from './pages/public/LandingPage';
import GuidePage from './pages/public/GuidePage';
import DownloadPage from './pages/public/DownloadPage';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import InAppGuidePage from './pages/dashboard/InAppGuidePage';
import CreateTripPage from './pages/trip/CreateTripPage';
import TripOverviewPage from './pages/trip/TripOverviewPage';
import JoinTripPage from './pages/trip/JoinTripPage';
import ExpenseListPage from './pages/trip/ExpenseListPage';
import PendingExpensesPage from './pages/trip/PendingExpensesPage';
import BalancePage from './pages/trip/BalancePage';
import SettlementPage from './pages/trip/SettlementPage';
import ItineraryPage from './pages/trip/ItineraryPage';
import AppShell from './components/layout/AppShell';
import PlansPage from './pages/trip/PlansPage';
import SuggestionsPage from './pages/trip/SuggestionsPage';
import ExportPage from './pages/trip/ExportPage';
import TripSummaryPage from './pages/trip/TripSummaryPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import TemplatesPage from './pages/TemplatesPage';

import { useFCM } from './hooks/useFCM';
import ReloadPrompt from './components/ui/ReloadPrompt';

// A simple AuthGuard wrapper
function AuthGuard({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  
  // Setup FCM notifications for authenticated users
  useFCM(user);
  
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
        <Route path="/guide" element={<GuidePage />} />
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
          <Route path="/app-guide" element={<InAppGuidePage />} />
          <Route path="/trips/new" element={<CreateTripPage />} />
          <Route path="/trips/join" element={<JoinTripPage />} />
          <Route path="/trips/:id" element={<TripOverviewPage />} />
          <Route path="/trips/:id/expenses" element={<ExpenseListPage />} />
          <Route path="/trips/:id/expenses/pending" element={<PendingExpensesPage />} />
          <Route path="/trips/:id/balances" element={<BalancePage />} />
          <Route path="/trips/:id/settlement" element={<SettlementPage />} />
          <Route path="/trips/:id/itinerary" element={<ItineraryPage />} />
          <Route path="/trips/:id/plans" element={<PlansPage />} />
          <Route path="/trips/:id/suggestions" element={<SuggestionsPage />} />
          <Route path="/trips/:id/export" element={<ExportPage />} />
          <Route path="/trips/:id/summary" element={<TripSummaryPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ReloadPrompt />
    </BrowserRouter>
  );
}

export default App;
