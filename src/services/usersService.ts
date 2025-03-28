import userApiClient from "./apiClients/usersApiClient";

export interface Organization {
    id: number;
    name: string;
    address: string;
    phone: string;
    created_at: string;
  }
  
  export interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    role: string;
    organization: Organization;
    organization_id: number;
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
    
    const endpoint = url || '/users/';
    const response = await userApiClient.get<PaginatedUserResponse>(endpoint);
    return response.data;
  };