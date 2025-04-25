import axios from "axios";
import { API_URLS } from "@/config/config";

interface AuthState {
  accessToken: string | null;
}
interface StoreState {
  auth: AuthState;
}

// Use NOTICE_SERVICE for templates
const templateApiClient = axios.create({
  baseURL: API_URLS.NOTICE_SERVICE, 
  headers: {
    "Content-Type": "application/json",
  },
});

export const setAuthorizationHeader = (token: string) => {
  templateApiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

let getState: () => StoreState = () => ({ auth: { accessToken: null } });

export const setStoreAccessor = (storeGetState: () => StoreState) => {
  getState = storeGetState;
};

templateApiClient.interceptors.request.use((config) => {
  // Only log in development for security
  if (process.env.NODE_ENV === "development") {
    console.log('Full request URL:', `${config.baseURL ?? ''}${config.url}`);
  }

  const { auth } = getState();
  // Ensure headers object exists
  config.headers = config.headers ?? {};
  if (auth.accessToken && !config.headers?.Authorization) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }
  return config;
});

templateApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only log in development for security
    if (process.env.NODE_ENV === "development") {
      console.error("API Error:", error.response?.status, error.response?.data);
    }
    return Promise.reject(error);
  }
);

export default templateApiClient;