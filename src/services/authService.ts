import { AppDispatch } from '@/store';
import { logout as logoutAction, setTokens } from '@/store/slices/authSlice';

import authApiClient, { setAuthToken } from './apiClients/authApiClient';

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

export const login = async (dispatch: AppDispatch, data: LoginPayload) => {
  try {
    const response = await authApiClient.post("/login/", data);

    const { access, refresh } = response.data;

    document.cookie = `accessToken=${access}; path=/; Secure`;
    setAuthToken(access);
    dispatch(setTokens({ accessToken: access, refreshToken: refresh }));

    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Login Failed:",
      error.response?.data?.detail || "Unknown error"
    );
    throw new Error(
      error.response?.data?.detail || "Invalid username or password"
    );
  }
};

export const register = async (data: RegisterPayload) => {
  try {
    const response = await authApiClient.post("/register/", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const refreshToken = async (
  dispatch: AppDispatch,
  refreshToken: string
) => {
  try {
    const response = await authApiClient.post("/token/refresh/", {
      refresh: refreshToken,
    });

    setAuthToken(response.data.access);
    dispatch(setTokens({ accessToken: response.data.access, refreshToken }));

    return response.data.access;
  } catch (error) {
    dispatch(logoutAction());
    throw error;
  }
};

export const logout = async (dispatch: AppDispatch) => {
  try {
    await authApiClient.post("/auth/logout/");

    setAuthToken(null);
    dispatch(logoutAction());
  } catch (error) {
    throw error;
  }
};
