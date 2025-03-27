import axios from "axios";
import { API_URLS } from "@/config/config";

const userApiClient = axios.create({
  baseURL: API_URLS.AUTH_SERVICE,
  headers: {
    "Content-Type": "application/json",
  },
});

export const setAuthorizationHeader = (token: string | null) => {
  if (token) {
    userApiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete userApiClient.defaults.headers.common['Authorization'];
  }
};

export default userApiClient;