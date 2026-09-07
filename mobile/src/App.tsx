import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { OfflineBanner } from './components/OfflineBanner';
import { BottomTabBar } from './components/BottomTabBar';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { MarketplaceScreen } from './screens/MarketplaceScreen';
import { CommunityScreen } from './screens/CommunityScreen';
import { SupplyStoreScreen } from './screens/SupplyStoreScreen';
import { FinancialTrackerScreen } from './screens/FinancialTrackerScreen';
import { ProduceOrdersScreen } from './screens/ProduceOrdersScreen';

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">🌾</div>
        <div className="loading-title">AgriConnect</div>
        <div className="loading-sub">Loading your farm dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="app-shell">
      <OfflineBanner />
      <div className="screen-content">
        <Routes>
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/marketplace" element={<MarketplaceScreen />} />
          <Route path="/produce/orders" element={<ProduceOrdersScreen />} />
          <Route path="/produce/transactions" element={<ProduceOrdersScreen />} />
          <Route path="/community" element={<CommunityScreen />} />
          <Route path="/supply" element={<SupplyStoreScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/financial" element={<FinancialTrackerScreen />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
      <BottomTabBar />
    </div>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <OfflineProvider>
        <AppRoutes />
      </OfflineProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
