import { getCurrentUserRole } from '@/lib/authServer';

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default async function RoleGuard({ 
  allowedRoles, 
  children, 
  fallback = null 
}: RoleGuardProps) {
  const userRole = await getCurrentUserRole();
  
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

// Alternative: More specific role guards
export async function AdminOnly({ children, fallback = null }: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={['admin']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export async function UserOnly({ children, fallback = null }: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={['user']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export async function UserOrAdmin({ children, fallback = null }: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={['user', 'admin']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}