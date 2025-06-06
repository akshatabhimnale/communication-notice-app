import userApiClient from "@/services/apiClients/usersApiClient";
import { AxiosError } from "axios";
import { PaginatedUserResponse, User, UserProfile } from "@/services/userService";

export const fetchUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await userApiClient.get<UserProfile>("/profile/");
    return response.data;
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      console.error("Error fetching user profile:", err.response?.data, err.config);
      if (err.response?.status === 401) {
        throw new Error("Authentication failed. Your session may have expired. Please log in again.");
      }
      throw err;
    }
    throw new Error("An unexpected error occurred while fetching user profile.");
  }
};

export const fetchUsers = async (url: string = "/users/"): Promise<PaginatedUserResponse> => {
  // Normalize URL if it's absolute
  const normalizedUrl = url.startsWith("http") ? new URL(url).pathname + new URL(url).search : url;
  try {
    const response = await userApiClient.get<PaginatedUserResponse>(normalizedUrl);
    return response.data;
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      console.error("Error fetching users:", err.response?.data, err.config);
      if (err.response?.status === 401) {
        throw new Error("Authentication failed. Your session may have expired. Please log in again.");
      }
      throw new Error(
        err.response
          ? `API Error ${err.response.status}: ${JSON.stringify(err.response.data)}`
          : `Network Error: Unable to reach the server`
      );
    }
    throw new Error("An unexpected error occurred while fetching users.");
  }
};

export const fetchAllUsers = async (): Promise<User[]> => {
  console.log("Fetching all users...");
  try {
    let allUsers: User[] = [];
    let nextUrl: string | null = "/users/";

    while (nextUrl) {
      const response: PaginatedUserResponse = await fetchUsers(nextUrl);
      allUsers = [...allUsers, ...response.results];
      nextUrl = response.next;
      console.log(`Fetched ${response.results.length} users, total so far: ${allUsers.length}, next: ${nextUrl}`);
    }

    console.log("All users fetched successfully:", allUsers.length);
    return allUsers;
  } catch (err: unknown) {
    console.error("Error fetching all users:", err);
    throw err;
  }
};