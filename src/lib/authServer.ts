import { cookies } from 'next/headers';

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

export async function getCurrentUser(): Promise<UserToken | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  
  if (!token) return null;
  
  return decodeJWT(token);
}

export async function getCurrentUserRole(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.role || null;
}

export async function hasRole(role: string): Promise<boolean> {
  const userRole = await getCurrentUserRole();
  return userRole === role;
}

export async function hasAnyRole(roles: string[]): Promise<boolean> {
  const userRole = await getCurrentUserRole();
  return userRole ? roles.includes(userRole) : false;
}