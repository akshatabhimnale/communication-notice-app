import axios from "axios";
import { API_URLS } from "@/config/config";
import { store, RootState } from "@/store";

const userApiClient = axios.create({
  baseURL: API_URLS.USERS_SERVICE, 
  headers: {
    "Content-Type": "application/json",
  },
});

export const setAuthorizationHeader = (token: string) => {
  userApiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

userApiClient.interceptors.request.use((config) => {
  console.log('Full request URL:', `${config.baseURL ?? ''}${config.url}`);
  const { auth } = store.getState() as RootState;
  if (auth.accessToken) {
    // Only set if not already set
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${auth.accessToken}`;
    }
    
  }
  return config;
});

userApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default userApiClient;