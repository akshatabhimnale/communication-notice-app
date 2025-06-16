'use client';

import { useRole } from '@/hooks/useRole';

interface ClientRoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showLoader?: boolean;
}

export default function ClientRoleGuard({ 
  allowedRoles, 
  children, 
  fallback = null,
  showLoader = true
}: ClientRoleGuardProps) {
  const { userRole, loading } = useRole();
  
  if (loading && showLoader) {
    return <div>Loading...</div>; // Or your loading spinner
  }
  
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

// Specific role guards for client components
export function ClientAdminOnly({ children, fallback = null }: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) {
  return (
    <ClientRoleGuard allowedRoles={['admin']} fallback={fallback}>
      {children}
    </ClientRoleGuard>
  );
}
export function ClientUserOnly({ children, fallback = null }: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) {
  return (
    <ClientRoleGuard allowedRoles={['user']} fallback={fallback}>
      {children}
    </ClientRoleGuard>
  );
}

export function ClientUserOrAdmin({ children, fallback = null }: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) {
  return (
    <ClientRoleGuard allowedRoles={['user', 'admin']} fallback={fallback}>
      {children}
    </ClientRoleGuard>
  );
}
