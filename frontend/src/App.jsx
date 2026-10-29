import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AICategorizationPage } from './pages/AICategorizationPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { ForecastPage } from './pages/ForecastPage';
import { RiskCenterPage } from './pages/RiskCenterPage';
import { GoalsPage } from './pages/GoalsPage';
import { ReceiptScannerPage } from './pages/ReceiptScannerPage';
import { InvestmentsPage } from './pages/InvestmentsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AIArchitecturePage } from './pages/AIArchitecturePage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Application Routes */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/assistant" element={<AIAssistantPage />} />
            <Route path="/categorization" element={<AICategorizationPage />} />
            <Route path="/forecast" element={<ForecastPage />} />
            <Route path="/risk-center" element={<RiskCenterPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/receipts" element={<ReceiptScannerPage />} />
            <Route path="/investments" element={<InvestmentsPage />} />
            <Route path="/ai-models" element={<AIArchitecturePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
