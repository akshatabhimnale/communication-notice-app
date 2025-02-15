import axios from "axios";
import { API_URLS } from "@/config/config";

let accessToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  accessToken = token;
};

const authApiClient = axios.create({
  baseURL: API_URLS.AUTH_SERVICE,
  headers: {
    "Content-Type": "application/json",
  },
});

authApiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export default authApiClient;
