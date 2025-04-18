import axios from "axios";
import userApiClient from "./apiClients/usersApiClient";

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

interface PaginatedUserResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

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