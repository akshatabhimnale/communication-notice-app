import axios from "axios";
import { API_URLS } from "@/config/config";
import { store, RootState } from "@/store";

const noticeApiClient = axios.create({
  baseURL: API_URLS.NOTICE_SERVICE,
  headers: {
    "Content-Type": "application/json",
  },
});

noticeApiClient.interceptors.request.use((config) => {
  const { auth } = store.getState() as RootState;
  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }
  return config;
});

export default noticeApiClient;
