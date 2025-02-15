import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import {
  login,
  register,
  refreshToken,
  logout as logoutService,
  LoginPayload,
  RegisterPayload,
} from "@/services/authService";

interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
};

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (
    { dispatch, data }: { dispatch: any; data: LoginPayload },
    { rejectWithValue }
  ) => {
    try {
      return await login(dispatch, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to login");
    }
  }
);

export const registerThunk = createAsyncThunk(
  "auth/register",
  async (data: RegisterPayload, { rejectWithValue }) => {
    try {
      return await register(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to register");
    }
  }
);

export const refreshTokenThunk = createAsyncThunk(
  "auth/refreshToken",
  async (
    { dispatch, token }: { dispatch: any; token: string },
    { rejectWithValue }
  ) => {
    try {
      return await refreshToken(dispatch, token);
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to refresh token");
    }
  }
);

export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (dispatch: any, { rejectWithValue }) => {
    try {
      return await logoutService(dispatch);
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to logout");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
    },
    setTokens(
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>
    ) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        loginThunk.fulfilled,
        (
          state,
          action: PayloadAction<{ user: User; access: string; refresh: string }>
        ) => {
          state.loading = false;
          state.user = action.payload.user;
          state.accessToken = action.payload.access;
          state.refreshToken = action.payload.refresh;
        }
      )
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        registerThunk.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.loading = false;
          state.user = action.payload;
        }
      )
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(
        refreshTokenThunk.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.accessToken = action.payload;
        }
      )
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      });
  },
});

export const { logout, setTokens } = authSlice.actions;
export default authSlice.reducer;
