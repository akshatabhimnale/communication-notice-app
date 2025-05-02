// import noticeApiClient from "./apiClients/noticeApiClient";
// import { AxiosError } from "axios";
// import { getTokenFromCookie, clearTokenCookie } from "@/services/userService";

export interface PaginatedTemplateResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: template[];
}

export interface template {
  id: string;
  channel: string;
  template_content: string;
  created_at: string;
  updated_at: string;
  notice_type: string;
}

export interface TemplateInput {
  channel: string;
  template_content: string;
  notice_type: string;
}

// Fetch paginated templates from API


// Submit a new template to the API
// export const submitTemplate = async (templateData: TemplateInput): Promise<template> => {
//   const token = getTokenFromCookie();
//   if (!token) {
//     throw new Error("No authentication token found. Please log in.");
//   }
//   try {
//     const response = await noticeApiClient.post<template>("/templates/", templateData);
//     return response.data;
//   } catch (err: unknown) {
//     if (err instanceof AxiosError) {
//       console.error("Full error:", err.response?.data, err.config);
//       if (err.response?.status === 401) {
//         clearTokenCookie();
//         throw new Error("Authentication failed. Your session may have expired. Please log in again.");
//       }
//       throw new Error(
//         err.response
//           ? `API Error ${err.response.status}: ${JSON.stringify(err.response.data)}`
//           : "Network Error: Unable to reach the server"
//       );
//     }
//     throw new Error("An unexpected error occurred");
//   }
// };