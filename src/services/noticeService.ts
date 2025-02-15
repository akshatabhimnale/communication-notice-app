import noticeApiClient from "./apiClients/noticeApiClient";

export interface Notice {
  id?: string;
  title: string;
  description: string;
  createdAt?: string;
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
