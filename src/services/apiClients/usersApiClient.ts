import axios from "axios";
import { API_URLS } from "@/config/config";
import axiosRetry from "axios-retry";

interface AuthState {
  accessToken: string | null;
}
interface StoreState {
  auth: AuthState;
}

const userApiClient = axios.create({
  baseURL: API_URLS.USERS_SERVICE,
  timeout: 10000, // Increased timeout to 10 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Configure axios-retry
axiosRetry(userApiClient, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000, // Exponential backoff: 1s, 2s, 3s
  retryCondition: (error) => {
    return (
      error.code === "ERR_NETWORK" ||
      error.message.includes("timeout") ||
      error.response?.status === 429 ||
      error.response?.status === 503
    );
  },
});

export const setAuthorizationHeader = (token: string) => {
  userApiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

let getState: () => StoreState = () => ({ auth: { accessToken: null } });

export const setStoreAccessor = (storeGetState: () => StoreState) => {
  getState = storeGetState;
};

userApiClient.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === "development") {
      console.log("Full request URL:", `${config.baseURL ?? ""}${config.url}`);
    }

    const { auth } = getState();
    config.headers = config.headers ?? {};
    if (auth.accessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${auth.accessToken}`;
    }
    return config;
  },
  (error) => {
    if (process.env.NODE_ENV === "development") {
      console.error("Request interceptor error:", error);
    }
    return Promise.reject(error);
  }
);

userApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (process.env.NODE_ENV === "development") {
      const status = error.response?.status || "No status";
      const data = error.response?.data || "No response data";
      console.error("API Error:", status, data, error.config?.url);
    }
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || "No status";
      const data = error.response?.data || "No response data";
      return Promise.reject(new Error(`API Error ${status}: ${JSON.stringify(data)}`));
    }
    return Promise.reject(new Error(`Non-Axios Error: ${error.message || "Unknown error"}`));
  }
);

export default userApiClient;