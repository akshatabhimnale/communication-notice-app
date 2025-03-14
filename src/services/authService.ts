import authApiClient, { setAuthToken } from "./apiClients/authApiClient";
import { setTokens, logout as logoutAction } from "@/store/slices/authSlice";
import { AppDispatch } from "@/store";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: "admin" | "user";
  organization_name: string;
  organization_address?: string;
  organization_phone?: string;
}

interface AuthResponse {
  access: string;
  refresh: string;
}

interface ApiError {
  response?: {
    data?: {
      detail?: string;
    };
  };
}

export const login = async (
  dispatch: AppDispatch,
  data: LoginPayload
): Promise<AuthResponse> => {
  try {
    const response = await authApiClient.post<AuthResponse>("/login/", data);

    const { access, refresh } = response.data;

    document.cookie = `accessToken=${access}; path=/; Secure`;
    setAuthToken(access);
    dispatch(setTokens({ accessToken: access, refreshToken: refresh }));

    return response.data;
  } catch (error) {
    const apiError = error as ApiError;
    console.error(
      "❌ Login Failed:",
      apiError.response?.data?.detail || "Unknown error"
    );
    throw new Error(
      apiError.response?.data?.detail || "Invalid username or password"
    );
  }
};

export const register = async (data: RegisterPayload): Promise<void> => {
  try {
    await authApiClient.post("/register/", data);
  } catch (error) {
    throw error;
  }
};

export const refreshToken = async (
  dispatch: AppDispatch,
  refreshToken: string
): Promise<string> => {
  try {
    const response = await authApiClient.post<{ access: string }>(
      "/token/refresh/",
      { refresh: refreshToken }
    );

    setAuthToken(response.data.access);
    dispatch(setTokens({ accessToken: response.data.access, refreshToken }));

    return response.data.access;
  } catch (error) {
    dispatch(logoutAction());
    throw error;
  }
};

export const logout = async (dispatch: AppDispatch): Promise<void> => {
  try {
    await authApiClient.post("/auth/logout/");

    setAuthToken(null);
    dispatch(logoutAction());
  } catch (error) {
    throw error;
  }
};
