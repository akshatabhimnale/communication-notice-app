import axios from "axios";
import { store } from "@/store";
import { setTokens, logout } from "@/store/slices/authSlice";

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const { auth } = store.getState();

  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }

  return config;
});

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
//     const { auth } = store.getState();

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const refreshResponse = await axios.post(
//           "http://localhost:8000/api/v1/token/refresh/",
//           {
//             refresh: auth.refreshToken,
//           }
//         );

//         store.dispatch(
//           setTokens({
//             accessToken: refreshResponse.data.access,
//             refreshToken: auth.refreshToken,
//           })
//         );
//         originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.access}`;

//         return axios(originalRequest);
//       } catch (refreshError) {
//         store.dispatch(logout());
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

export default api;
