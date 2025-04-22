import { AxiosError } from "axios";
import axios from "axios";
import authApiClient, { setAuthToken } from "@/services/apiClients/authApiClient";
import userApiClient from "./apiClients/usersApiClient";

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

export interface Organization {
  id: string;
  name: string;
  address: string;
  phone: string;
  created_at: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  organization: Organization;
  organization_id: string;
}

export interface UserResponse {
  count: number;
  next: string;
  previous: string;
  results: User[];
}

export interface PaginatedUserResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

export const getTokenFromCookie = (): string | null => {
  const cookies = document.cookie.split("; ");
  const accessTokenCookie = cookies.find((cookie) =>
    cookie.startsWith("accessToken=")
  );
  return accessTokenCookie ? accessTokenCookie.split("=")[1] : null;
};

export const clearTokenCookie = () => {
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

/**
 * Fetches a paginated list of users from the API.
 *
 * @param url - Optional. The specific API endpoint URL to fetch users from. Defaults to '/users/' if not provided.
 * @returns A promise that resolves to a PaginatedUserResponse object containing the list of users and pagination details.
 * @throws Will throw an error if the API request fails, after logging the error to the console.
 */
export const fetchUsers = async (url?: string): Promise<PaginatedUserResponse> => {
  try {
    const endpoint = url || '/users/';
    const response = await userApiClient.get<PaginatedUserResponse>(endpoint);
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

/**
 * Edits an existing user by their ID.
 *
 * Makes a PUT request to the `/users/{id}/` endpoint with the cleaned user data.
 * It extracts relevant fields from the input `data` object before sending the request.
 *
 * @param id - The unique identifier of the user to edit. Can be a number or a string.
 * @param data - An object containing the updated user information. It expects properties like username, email, first_name, last_name, phone, role, and either organization_id or an organization object with an id property.
 * @returns A Promise that resolves to the updated user object (`User`) returned by the API.
 * @throws Will re-throw any error encountered during the API request after logging it to the console.
 */
export const editUser = async (id: number | string, data: User): Promise<User> => {
  try {
    const cleanedData = {
      username: data.username,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      role: data.role,
      organization_id: data.organization_id || data.organization?.id,
    };
    
    const response = await userApiClient.put<User>(`/users/${id}/`, cleanedData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    throw error;
  }
};

export const deleteUser = async (id: string): Promise<void> => {
  try {
    // Log the request before making it
    console.log(`Attempting to delete user with ID: ${id}`);
    await userApiClient.delete(`/users/${id}/`);
    console.log(`Successfully deleted user with ID: ${id}`);
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error);
    
    // More detailed error handling
    if (axios.isAxiosError(error) && error.response) {
      console.error(`Status: ${error.response.status}, Details:`, error.response.data);
    }
    
    throw error;
  }
};