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

interface ApiErrorResponse {
  response?: {
    data?: {
      errors?: {
        [key: string]: string[];
      };
    };
  };
}

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (data: LoginPayload, { dispatch, rejectWithValue }) => {
    try {
      const response = await login(data);
      const { access, refresh, user } = response.data;
      document.cookie = `accessToken=${access}; path=/; Secure`;
      setAuthToken(access);
      dispatch(setTokens({ accessToken: access, refreshToken: refresh }));
      return { user, access, refresh };
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || "Failed to login");
    }
  }
);

export const registerThunk = createAsyncThunk(
  "auth/register",
  async (data: RegisterPayload, { rejectWithValue }) => {
    try {
      return await register(data);
    } catch (error: unknown) {
      const typedError = error as ApiErrorResponse;
      if (typedError?.response?.data?.errors) {
        return rejectWithValue(typedError.response.data.errors);
      } else {
        const errMsg = (error as Error).message || "Failed to register";
        return rejectWithValue({ message: errMsg });
      }
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
      // Clearing the access token from the cookie using unix epoch time
      document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; Secure; SameSite=Strict";
      console.log("✅ token deleted from cookie")
      setAuthToken(null);
      dispatch(logout());      
      return true;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : { message: "Unknown error" };
      return rejectWithValue(err.message || "Failed to logout");
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
      state.error = null;
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
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.access;
        state.refreshToken = action.payload.refresh;
        state.error = null;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerThunk.fulfilled, (state) => {
        state.loading = false;
        // state.user = action.payload;
        state.error = null;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(refreshTokenThunk.fulfilled, (state, action) => {
        state.accessToken = action.payload;
        state.error = null;
      })
      .addCase(refreshTokenThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = null;
      })
      .addCase(logoutThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { logout, setTokens } = authSlice.actions;
export default authSlice.reducer;
