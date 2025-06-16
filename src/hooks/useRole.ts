'use client';

import { useEffect, useState } from 'react';

interface UserToken {
  role?: string;
  userId?: string;
}

const decodeJWT = (token: string): UserToken | null => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = JSON.parse(atob(base64));
    return decodedPayload;
  } catch (error) {
    console.error("❌ JWT Decode Error:", error);
    return null;
  }
};

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

export function useRole() {
  const [user, setUser] = useState<UserToken | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getCookie('accessToken');
    if (token) {
      const decodedUser = decodeJWT(token);
      setUser(decodedUser);
    }
    setLoading(false);
  }, []);

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return user?.role ? roles.includes(user.role) : false;
  };

  const isAdmin = (): boolean => hasRole('admin');
  const isUser = (): boolean => hasRole('user');

  return {
    user,
    userRole: user?.role || null,
    loading,
    hasRole,
    hasAnyRole,
    isAdmin,
    isUser,
  };
}