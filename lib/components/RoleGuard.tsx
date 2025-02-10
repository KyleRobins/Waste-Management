"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUserRole, UserRole } from '@/lib/services/auth.service';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const userRole = await getCurrentUserRole();
        if (!allowedRoles.includes(userRole)) {
          router.push('/unauthorized');
          return;
        }
        setHasAccess(true);
      } catch (error) {
        router.push('/auth/login');
      }
    };

    checkAccess();
  }, [allowedRoles, router]);

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}; 