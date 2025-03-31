import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { User, fetchUsers } from "@/services/usersService";
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

interface PaginatedUserResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
  count: 0,
  nextPageUrl: null,
  prevPageUrl: null
};

export const fetchUsersThunk = createAsyncThunk(
  "user/fetchAll",
  async (url: string | undefined, { rejectWithValue }) => {
    try {
      const response = await fetchUsers(url);
      return response;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;
      const message = (axiosError.response?.data as { message?: string })?.message || "Failed to fetch users";
      return rejectWithValue({ status, message });
    }
  }
);

const usersSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    
    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex(user => user.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    removeUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter(user => user.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUsersThunk.fulfilled,
        (state, action: PayloadAction<PaginatedUserResponse>) => { // Fix the PayloadAction type
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