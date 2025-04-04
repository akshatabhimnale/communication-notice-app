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