import noticeApiClient from "./apiClients/noticeApiClient";
import { AxiosError } from "axios";
import { getTokenFromCookie, clearTokenCookie } from "@/services/userService"


export interface Notice {
  id?: string;
  title: string;
  description: string;
  createdAt?: string;
}
// interface Template {
//   id: string;
//   channel: string;
//   template_content: string;
//   created_at: string;
//   updated_at: string;
//   notice_type: string;
// }


export interface SchemaField {
  label: string;
  type: "text" | "number" | "date" | "boolean";
  required: boolean;
}
export interface NoticeType {
  id: string; // Required in response
  org_id: string; // Required
  name: string; // Required, 1-100 chars
  description?: string | null | undefined; // Nullable
  dynamic_schema: Record<string, SchemaField>; // Required object
  created_at: string; // Date-time
}


export const fetchNotices = async () => {
  const response = await noticeApiClient.get<Notice[]>("/notice-types/");
  return response.data;
};

export const createNotice = async (data: Notice) => {
  const response = await noticeApiClient.post("/notice-types/", data);
  return response.data;
};

export const updateNotice = async (id: string, data: Notice) => {
  const response = await noticeApiClient.put(`/notice-types/${id}/`, data);
  return response.data;
};

export const deleteNotice = async (id: string) => {
  const response = await noticeApiClient.delete(`/notice-types/${id}/`);
  return response.data;
};


export const createNoticeType = async (noticeData: Omit<NoticeType, "id" | "templates" | "created_at">): Promise<NoticeType> => {
  const token = getTokenFromCookie();
  if (!token) {
    throw new Error("No authentication token found. Please log in.");
  }
  try {
    console.log("Sending to server:", noticeData);
    const response = await noticeApiClient.post("/notice-types/", noticeData);
    console.log("Server response (FULL):", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      console.error("Full error:", err.response?.data, err.config);
      if (err.response?.status === 401) {
        clearTokenCookie();
        throw new Error("Authentication failed. Your session may have expired. Please log in again.");
      }
      throw new Error(
        err.response
          ? `API Error ${err.response.status}: ${JSON.stringify(err.response.data)}`
          : "Network Error: Unable to reach the server"
      );
    }
    throw new Error("An unexpected error occurred");
  }
};


export const fetchNoticeTypes = async (): Promise<NoticeType[]> => {
  const token = getTokenFromCookie();
  if (!token) {
    throw new Error("No authentication token found. Please log in.");
  }
  try {
    const response = await noticeApiClient.get("/notice-types/");
    return response.data; // Array of NoticeType
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      console.error("Full error:", err.response?.data, err.config);
      if (err.response?.status === 401) {
        clearTokenCookie();
        throw new Error("Authentication failed. Your session may have expired. Please log in again.");
      }
      throw new Error(
        err.response
          ? `API Error ${err.response.status}: ${JSON.stringify(err.response.data)}`
          : "Network Error: Unable to reach the server"
      );
    }
    throw new Error("An unexpected error occurred");
  }
};