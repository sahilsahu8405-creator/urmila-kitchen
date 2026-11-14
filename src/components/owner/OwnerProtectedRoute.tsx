import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useOwnerAuth } from '../../context/OwnerAuthContext';
import { BrandLogo } from '../common/BrandLogo';

export const OwnerProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOwner, isLoading } = useOwnerAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
        <BrandLogo size="lg" />
        <div className="w-8 h-8 border-3 border-forest border-t-transparent rounded-full animate-spin mt-6 mb-3" />
        <p className="text-xs uppercase tracking-widest font-semibold text-olive">
          Verifying Owner Authorization
        </p>
        <p className="text-xs text-charcoal/60 mt-1">
          Securing kitchen management portal...
        </p>
      </div>
    );
  }

  if (!isOwner) {
    // Strictly redirect unauthenticated users to the login screen
    return <Navigate to="/owner/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

