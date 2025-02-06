import apiClient from "./apiClient";

export interface Notice {
  id?: string;
  title: string;
  description: string;
  createdAt?: string;
}

export const fetchNotices = async () => {
  const response = await apiClient.get<Notice[]>("/notice-types/");
  return response.data;
};

export const createNotice = async (data: Notice) => {
  const response = await apiClient.post("/notice-types/", data);
  return response.data;
};

export const updateNotice = async (id: string, data: Notice) => {
  const response = await apiClient.put(`/notice-types/${id}/`, data);
  return response.data;
};

export const deleteNotice = async (id: string) => {
  const response = await apiClient.delete(`/notice-types/${id}/`);
  return response.data;
};
