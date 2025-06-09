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
  channel: string[]; // Changed to string[] to match API
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
  channel: string | string[];
  template_content: string;
  notice_type: string;
}) => {
  const token = getTokenFromCookie();
  if (!token) {
    throw new Error("No authentication token found. Please log in.");
  }
  try {
    // Normalize channel to array
    const normalizedData = {
      ...data,
      channel: Array.isArray(data.channel) ? data.channel : [data.channel],
    };
    // Validate inputs
    if (!normalizedData.channel.length) {
      throw new Error("Channel is required.");
    }
    if (!normalizedData.template_content.trim()) {
      throw new Error("Template content cannot be empty.");
    }
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(normalizedData.notice_type)) {
      throw new Error("Invalid notice type UUID.");
    }
    const response = await noticeApiClient.post<template>("/templates/", normalizedData);
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
    throw error instanceof Error ? error : new Error("An unexpected error occurred");
  }
};

// Update a template by ID
export const updateTemplate = async (id: string, data: {
  channel: string | string[];
  template_content: string;
  notice_type: string;
}) => {
  const token = getTokenFromCookie();
  if (!token) {
    throw new Error("No authentication token found. Please log in.");
  }
  try {
    // Normalize channel to array
    const normalizedData = {
      ...data,
      channel: Array.isArray(data.channel) ? data.channel : [data.channel],
    };
    // Validate inputs
    if (!normalizedData.channel.length) {
      throw new Error("Channel is required.");
    }
    if (!normalizedData.template_content.trim()) {
      throw new Error("Template content cannot be empty.");
    }
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(normalizedData.notice_type)) {
      throw new Error("Invalid notice type UUID.");
    }
    const response = await noticeApiClient.put<template>(`/templates/${id}/`, normalizedData);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("Error updating template:", error.response?.data);
      throw new Error(
        error.response
          ? `API Error ${error.response.status}: ${JSON.stringify(
              error.response.data
            )}`
          : "Network Error: Unable to reach the server"
      );
    }
    console.error("Error updating template:", error);
    throw error instanceof Error ? error : new Error("An unexpected error occurred");
  }
};

// Delete a template by ID
export const deleteTemplate = async (id: string) => {
  const token = getTokenFromCookie();
  if (!token) {
    throw new Error("No authentication token found. Please log in.");
  }
  try {
    const response = await noticeApiClient.delete(`/templates/${id}/`);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("Error deleting template:", error.response?.data);
      throw new Error(
        error.response
          ? `API Error ${error.response.status}: ${JSON.stringify(
              error.response.data
            )}`
          : "Network Error: Unable to reach the server"
      );
    }
    console.error("Error deleting template:", error);
    throw new Error("An unexpected error occurred");
  }
};