import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { User, fetchUsers, PaginatedUserResponse } from "@/services/userService";
import { AxiosError } from "axios";

// Update User interface to include optional deleted flag
export interface UserWithDelete extends User {
  deleted?: boolean;
}

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
  count: number;
  nextPageUrl: string | null;
  prevPageUrl: string | null;
}
const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
  count: 0,
  nextPageUrl: null,
  prevPageUrl: null,
};

/**
 * Asynchronous thunk for fetching users from an API.
 *
 * @param {string | undefined} url - The URL to fetch users from, or undefined if not provided.
 * @param {object} rejectWithValue - A function to reject the promise with an error message.
 * @return {Promise<PaginatedUserResponse>} - A promise that resolves to the fetched users.
 * @throws Will throw an error if the API request fails, after logging the error to the console.
**/
export const fetchUsersThunk = createAsyncThunk(
  "user/fetchAll",
  async (_: string | undefined, { rejectWithValue }) => {
    try {
      let page = 1;
      let allResults: User[] = [];
      let count = 0;
      let next: string | null = null;
      let previous: string | null = null;
      let firstPage = true;
      do {
        // Use your usersApiClient to fetch each page
        const response = await fetchUsers(`/users/?page=${page}`);
        if (firstPage) {
          count = response.count;
          previous = response.previous;
          firstPage = false;
        }
        allResults = allResults.concat(response.results);
        next = response.next;
        page++;
      } while (next);
      return {
        count,
        next: null,
        previous,
        results: allResults,
      } as PaginatedUserResponse;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;
      const message =
        (axiosError.response?.data as { message?: string })?.message ||
        "Failed to fetch users";
      return rejectWithValue({ status, message });
    }
  }
);

/**
 * Redux slice for managing user-related state.
 *
 * This slice handles the state for a list of users, including loading status,
 * potential errors during data fetching, and pagination details. It provides
 * reducers for updating and removing individual users, and handles the
 * asynchronous actions dispatched by `fetchUsersThunk` to fetch users
 * from an API, updating the state accordingly based on the promise lifecycle
 * (pending, fulfilled, rejected).
 *
 * @property {string} name - The name of the slice, used as a prefix for generated action types.
 * @property {UsersState} initialState - The initial state of the user slice.
 * @property {object} reducers - Synchronous reducers for state modifications.
 * @property {function} reducers.updateUser - Updates an existing user in the state based on the provided payload (User object).
 * @property {function} reducers.removeUser - Removes a user from the state based on the provided user ID (string).
 * @property {function} extraReducers - Handles actions defined outside the slice, particularly async thunks.
 * @property {function} extraReducers.builder - A builder API for defining extra reducers.
 * @property {CaseReducer} extraReducers.builder.addCase(fetchUsersThunk.pending) - Handles the pending state of user fetching, setting loading to true.
 * @property {CaseReducer} extraReducers.builder.addCase(fetchUsersThunk.fulfilled) - Handles the successful fetching of users, updating the user list, count, and pagination URLs.
 * @property {CaseReducer} extraReducers.builder.addCase(fetchUsersThunk.rejected) - Handles the failed fetching of users, setting loading to false and storing the error message.
 */
const usersSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateUser: (state, action: PayloadAction<User>) => {
      const updatedUsers = state.users.map((user) =>
        user.id === action.payload.id ? { ...action.payload } : user
      );
      state.users = updatedUsers; // Assign new array reference
    },
    removeUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter((user) => user.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUsersThunk.fulfilled,
        (state, action: PayloadAction<PaginatedUserResponse>) => {
          state.loading = false;
          state.users = action.payload.results;
          state.count = action.payload.count;
          state.nextPageUrl = action.payload.next;
          state.prevPageUrl = action.payload.previous;
        }
      )
      .addCase(fetchUsersThunk.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as { status?: number; message?: string };
        state.error = payload?.message || "Unknown error";
      });
  },
});

// Export the reducer actions
export const { updateUser, removeUser } = usersSlice.actions;

export default usersSlice.reducer;
