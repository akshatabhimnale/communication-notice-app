import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { User, fetchUsers } from "@/services/usersService";

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
      } catch (error: any) {
        const status = error.response?.status;
        const message = error.response?.data?.message || "Failed to fetch users";
        
        return rejectWithValue({ status, message });
      }
    }
  );

const usersSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
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

export default usersSlice.reducer;
