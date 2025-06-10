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
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Configure axios-retry
axiosRetry(userApiClient, {
  retries: 3,
  retryDelay: (retryCount) => {
    console.log(`Retry attempt ${retryCount + 1} for ${userApiClient.defaults.baseURL}`);
    return retryCount * 2000; // 2s, 4s, 6s
  },
  retryCondition: (error) => {
    const shouldRetry =
      error.code === "ERR_NETWORK" ||
      error.message.includes("timeout") ||
      error.response?.status === 429 ||
      error.response?.status === 503;
    if (shouldRetry) {
      console.log(`Retrying due to error: ${error.message}`);
    }
    return shouldRetry;
  },
});

export const setAuthorizationHeader = (token: string) => {
  userApiClient.defaults.headers.Authorization = `Bearer ${token}`;
};

let getState: () => StoreState = () => ({ auth: { accessToken: null } });

export const setStoreAccessor = (storeGetState: () => StoreState) => {
  getState = storeGetState;
};

userApiClient.interceptors.request.use(
  (config) => {
    // Normalize URL to prevent double-prefixing
    if (config.url && (config.url.startsWith("http://") || config.url.startsWith("https://"))) {
      const parsedUrl = new URL(config.url);
      // Strip baseURL prefix if present
      const baseUrl = new URL(userApiClient.defaults.baseURL || "");
      const basePath = baseUrl.pathname === "/" ? "" : baseUrl.pathname;
      if (parsedUrl.pathname.startsWith(basePath)) {
        config.url = parsedUrl.pathname.slice(basePath.length) + (parsedUrl.search || "");
      } else {
        config.url = parsedUrl.pathname + (parsedUrl.search || "");
      }
    }
    if (process.env.NODE_ENV === "development") {
      console.log("Full request URL:", `${config.baseURL ?? ""}${config.url}`);
    }

    const { auth } = getState();
    config.headers = config.headers || {};
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
      console.error(`API Error ${status}: ${JSON.stringify(data)}`, error.config?.url);
    }
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return Promise.reject(
          new Error(`API Error ${error.response.status}: ${JSON.stringify(error.response.data)}`)
        );
      }
      return Promise.reject(new Error(`Network Error: ${error.message}`));
    }
    return Promise.reject(new Error(`Non-Axios Error: ${error.message || "Unknown error"}`));
  }
);

export default userApiClient;