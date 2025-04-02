import { AxiosError } from "axios";
import authApiClient, { setAuthToken } from "@/services/apiClients/authApiClient";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  organization: {
    id: string;
    name: string;
    address: string;
    phone: string;
    created_at: string;
  };
  organization_id: string;
}

const getTokenFromCookie = (): string | null => {
  const cookies = document.cookie.split("; ");
  const accessTokenCookie = cookies.find((cookie) =>
    cookie.startsWith("accessToken=")
  );
  return accessTokenCookie ? accessTokenCookie.split("=")[1] : null;
};

const clearTokenCookie = () => {
  document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure";
};

export const fetchUserProfile = async (): Promise<UserProfile> => {
  const token = getTokenFromCookie();

  if (!token) {
    throw new Error("No authentication token found. Please log in.");
  }

  try {
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    const userId = decodedToken.user_id;

    setAuthToken(token);
    const response = await authApiClient.get(`/users/${userId}/`);
    return response.data.data;
  } catch (err: unknown) {
    if (err instanceof SyntaxError) {
      clearTokenCookie();
      throw new Error("Invalid token format. Please log in again.");
    }
    if (err instanceof AxiosError) {
      if (err.response?.status === 401) {
        clearTokenCookie();
        throw new Error("Authentication failed. Your session may have expired. Please log in again.");
      }
      throw new Error(
        err.response
          ? `API Error ${err.response.status}: ${JSON.stringify(err.response.data)}`
          : "Network Error: Unable to reach the server"
      );
    }
    throw new Error("An unexpected error occurred");
  }
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<Pick<UserProfile, "username" | "email" | "phone"> & { organization_id: string }>
): Promise<UserProfile> => {
  const token = getTokenFromCookie();

  if (!token) {
    throw new Error("No authentication token found. Please log in.");
  }

  try {
    setAuthToken(token);
    const response = await authApiClient.put(`/users/${userId}/`, updates);
    return response.data.data;
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      if (err.response?.status === 401) {
        clearTokenCookie();
        throw new Error("Authentication failed. Your session may have expired. Please log in again.");
      }
      console.error("Axios error details:", err.message, err.config);
      throw new Error(
        err.response
          ? `API Error ${err.response.status}: ${JSON.stringify(err.response.data)}`
          : `Network Error: ${err.message}`
      );
    }
    throw new Error("An unexpected error occurred");
  }
};

export const updateCurrentUserProfile = async (
  currentProfile: UserProfile,
  updates: Partial<Pick<UserProfile, "username" | "email" | "phone">>
): Promise<UserProfile> => {
  const orgId = currentProfile.organization_id || currentProfile.organization?.id;
  if (!orgId) {
    throw new Error("Organization ID is missing from profile data");
  }

  const payload = {
    username: updates.username,
    email: updates.email,
    phone: updates.phone,
    organization_id: orgId,
  };

  return updateUserProfile(currentProfile.id, payload);
};