import { setAuthToken } from "@/services/apiClients/authApiClient";
import {
  login,
  LoginPayload,
  refreshToken,
  register,
  RegisterPayload,
} from "@/services/authService";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

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
  async (data: LoginPayload, { dispatch, rejectWithValue }) => {
    try {
      const response = await login(data);
      const { access, refresh, user } = response;
      document.cookie = `accessToken=${access}; path=/; Secure`;
      setAuthToken(access);
      dispatch(setTokens({ accessToken: access, refreshToken: refresh }));
      return { user, access, refresh };
    } catch (error: unknown) {
      const err = error as { response?: { data?: string } };
      return rejectWithValue(err.response?.data || "Failed to login");
    }
  }
);

export const registerThunk = createAsyncThunk(
  "auth/register",
  async (data: RegisterPayload, { rejectWithValue }) => {
    try {
      return await register(data);
    } catch (error: unknown) {
      const err = error as { response?: { data?: string } };
      return rejectWithValue(err.response?.data || "Failed to register");
    }
  }
);

export const refreshTokenThunk = createAsyncThunk(
  "auth/refreshToken",
  async (token: string, { dispatch, rejectWithValue }) => {
    try {
      const accessToken = await refreshToken(token);
      setAuthToken(accessToken);
      dispatch(setTokens({ accessToken, refreshToken: token }));

      return accessToken;
    } catch (error: unknown) {
      const err = error as Error;
      dispatch(logout());
      return rejectWithValue(err.message || "Failed to refresh token");
    }
  }
);

export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_: void, { dispatch, rejectWithValue }) => {
    try {
      await logout();
      setAuthToken(null);
      dispatch(logout());
    } catch (error: unknown) {
      const err = error as { response?: { data?: string } };
      return rejectWithValue(err.response?.data || "Failed to logout");
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
          // state.user = action.payload;
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
