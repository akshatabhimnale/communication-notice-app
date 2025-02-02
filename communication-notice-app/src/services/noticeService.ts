import apiClient from "./apiClient";

export interface Notice {
  id?: string;
  title: string;
  description: string;
  createdAt?: string;
}

export const fetchNotices = async () => {
  const response = await apiClient.get<Notice[]>("/notices-type/");
  return response.data;
};

export const createNotice = async (data: Notice) => {
  const response = await apiClient.post("/notices-type/", data);
  return response.data;
};

export const updateNotice = async (id: string, data: Notice) => {
  const response = await apiClient.put(`/notices-type/${id}/`, data);
  return response.data;
};

export const deleteNotice = async (id: string) => {
  const response = await apiClient.delete(`/notices-type/${id}/`);
  return response.data;
};
