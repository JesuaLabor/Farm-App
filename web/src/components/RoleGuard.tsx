import React from 'react';
import type { Role } from '../types/auth';
import { useAuth } from '../contexts/AuthContext';

interface RoleGuardProps {
  allowedRoles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children, fallback = null }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return fallback ? <>{fallback}</> : (
      <div style={{ padding: '24px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#991b1b' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Access Restricted</h4>
        <p style={{ margin: 0, fontSize: '14px' }}>
          Your account role (<strong>{user?.role || 'Guest'}</strong>) does not have permission to view this content.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
