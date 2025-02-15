// import axios from "axios";
// // import { API_URL } from "@/config/config";
// import { store, RootState } from "@/store";
// import { refreshToken, logout } from "./authService";

// const apiClient = axios.create({
//   // baseURL: API_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// apiClient.interceptors.request.use((config) => {
//   const { auth } = store.getState() as RootState;
//   if (auth.accessToken) {
//     config.headers.Authorization = `Bearer ${auth.accessToken}`;
//   }
//   return config;
// });

// apiClient.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
//     const { auth } = store.getState() as RootState;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const newAccessToken = await refreshToken(
//           store.dispatch,
//           auth.refreshToken as string
//         );
//         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//         return axios(originalRequest);
//       } catch (refreshError) {
//         await logout(store.dispatch);
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default apiClient;
