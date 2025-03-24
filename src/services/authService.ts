import authApiClient, { setAuthToken } from "./apiClients/authApiClient";
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

export const login = async (data: LoginPayload) => {
  try {
    const response = await authApiClient.post("/login/", data);
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { detail?: string } } };
    const message =
      err.response?.data?.detail || "Invalid username or password";
    console.error("❌ Login Failed:", message);
    throw new Error(message);
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

export const refreshToken = async (refreshToken: string): Promise<string> => {
  try {
    const response = await authApiClient.post("/token/refresh/", {
      refresh: refreshToken,
    });

    setAuthToken(response.data.access);

    return response.data.access;
  } catch (error: unknown) {
    const err = error as { response?: { data?: string } };
    throw new Error(err.response?.data || "Failed to refresh token");
  }
};

export const logout = async (): Promise<void> => {
  try {
    await authApiClient.post("/auth/logout/");
  } catch (error: unknown) {
    const err = error as { response?: { data?: string } };
    const message = err.response?.data || "Failed to logout";
    console.error("❌ Logout Failed:", message);
    throw new Error(message);
  }
};
