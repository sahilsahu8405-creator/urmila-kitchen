import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { CartProvider } from './context/CartContext';
import { OwnerAuthProvider } from './context/OwnerAuthContext';
import { HomePage } from './pages/HomePage';
import { OwnerDashboardPage } from './pages/OwnerDashboardPage';
import { OwnerLoginPage } from './pages/OwnerLoginPage';

export function App() {
  return (
    <Router>
      <SettingsProvider>
        <CartProvider>
          <OwnerAuthProvider>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/owner" element={<OwnerDashboardPage />} />
              <Route path="/owner/login" element={<OwnerLoginPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </OwnerAuthProvider>
        </CartProvider>
      </SettingsProvider>
    </Router>
  );
}

export default App;
