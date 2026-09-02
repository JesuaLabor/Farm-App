import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { ProduceMarketplacePage } from './pages/ProduceMarketplacePage';
import { ManageProduceListingsPage } from './pages/ManageProduceListingsPage';
import { ProduceTransactionsPage } from './pages/ProduceTransactionsPage';
import { SupplyStorePage } from './pages/SupplyStorePage';
import { SupplyCartPage } from './pages/SupplyCartPage';
import { ManageSupplyProductsPage } from './pages/ManageSupplyProductsPage';
import { SupplyOrdersPage } from './pages/SupplyOrdersPage';
import { MarketPriceMonitoringPage } from './pages/MarketPriceMonitoringPage';
import { ManageMarketPricesPage } from './pages/ManageMarketPricesPage';
import { FarmFinancialTrackerPage } from './pages/FarmFinancialTrackerPage';
import { GovernmentProgramsPage } from './pages/GovernmentProgramsPage';
import { ManageGovernmentProgramsPage } from './pages/ManageGovernmentProgramsPage';
import { CommunityHubPage } from './pages/CommunityHubPage';
import { CommunityPostDetailPage } from './pages/CommunityPostDetailPage';
import { LGUDashboardPage } from './pages/LGUDashboardPage';
import { SuperAdminApprovalsPage } from './pages/SuperAdminApprovalsPage';
import { LGUAccountApprovalsPage } from './pages/LGUAccountApprovalsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Produce Marketplace */}
          <Route
            path="/produce"
            element={
              <ProtectedRoute>
                <ProduceMarketplacePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/produce/manage"
            element={
              <ProtectedRoute>
                <ManageProduceListingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/produce/orders"
            element={
              <ProtectedRoute>
                <ProduceTransactionsPage />
              </ProtectedRoute>
            }
          />

          {/* Agri-Supply Store */}
          <Route
            path="/supply"
            element={
              <ProtectedRoute>
                <SupplyStorePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supply/cart"
            element={
              <ProtectedRoute>
                <SupplyCartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supply/manage"
            element={
              <ProtectedRoute>
                <ManageSupplyProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supply/orders"
            element={
              <ProtectedRoute>
                <SupplyOrdersPage />
              </ProtectedRoute>
            }
          />

          {/* Market Price Monitoring */}
          <Route
            path="/market-prices"
            element={
              <ProtectedRoute>
                <MarketPriceMonitoringPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/market-prices/manage"
            element={
              <ProtectedRoute>
                <ManageMarketPricesPage />
              </ProtectedRoute>
            }
          />

          {/* Farm Financial Tracker */}
          <Route
            path="/finances"
            element={
              <ProtectedRoute>
                <FarmFinancialTrackerPage />
              </ProtectedRoute>
            }
          />

          {/* Government Programs */}
          <Route
            path="/programs"
            element={
              <ProtectedRoute>
                <GovernmentProgramsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/programs/manage"
            element={
              <ProtectedRoute>
                <ManageGovernmentProgramsPage />
              </ProtectedRoute>
            }
          />

          {/* Community Hub */}
          <Route
            path="/community"
            element={
              <ProtectedRoute>
                <CommunityHubPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/community/posts/:id"
            element={
              <ProtectedRoute>
                <CommunityPostDetailPage />
              </ProtectedRoute>
            }
          />

          {/* LGU Regional Monitoring Dashboard */}
          <Route
            path="/lgu/dashboard"
            element={
              <ProtectedRoute>
                <LGUDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Super Admin & LGU Account Approvals */}
          <Route
            path="/admin/approvals"
            element={
              <ProtectedRoute>
                <SuperAdminApprovalsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lgu/approvals"
            element={
              <ProtectedRoute>
                <LGUAccountApprovalsPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
