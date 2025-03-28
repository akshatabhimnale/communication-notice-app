import { AxiosError } from "axios";
import authApiClient, { setAuthToken } from "@/services/apiClients/authApiClient";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  organization: {
    id: number;
    name: string;
    address: string;
    phone: string;
    created_at: string;
  };
  organization_id: number;
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