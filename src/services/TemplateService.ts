import noticeApiClient from "@/services/apiClients/noticeApiClient";
import { AxiosError } from "axios";
import { getTokenFromCookie } from "@/services/userService";

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

// Fetch paginated templates from API
export const fetchTemplates = async (
  url?: string
): Promise<PaginatedTemplateResponse> => {
  try {
    const endpoint = url || "/templates/";
    const response =
      await noticeApiClient.get<PaginatedTemplateResponse>(endpoint);
    return response.data;
  } catch (error) {
    console.error("Error fetching templates:", error);
    throw error;
  }
};

// Create a template for a notice type
export const createTemplate = async (data: {
  channel: string;
  template_content: string;
  notice_type: string;
}) => {
  const token = getTokenFromCookie();
  if (!token) {
    throw new Error("No authentication token found. Please log in.");
  }
  try {
    const response = await noticeApiClient.post<template>("/templates/", data);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("Error creating template:", error.response?.data);
      throw new Error(
        error.response
          ? `API Error ${error.response.status}: ${JSON.stringify(
              error.response.data
            )}`
          : "Network Error: Unable to reach the server"
      );
    }
    console.error("Error creating template:", error);
    throw new Error("An unexpected error occurred");
  }
};