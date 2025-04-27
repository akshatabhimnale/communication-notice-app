import noticeApiClient from "./apiClients/noticeApiClient";
import { AxiosError } from "axios";
import { getTokenFromCookie, clearTokenCookie } from "@/services/userService";
import {
  Notice,
  SchemaField,
  DynamicSchema,
  NoticeType,
  PaginatedResponse,
  ApiSchemaField,
  ApiResponse,
  UploadSchemaResponse,
} from "@/types/noticeTypesInterface";

// Transform component's dynamic_schema to API's expected format
const transformDynamicSchemaForApi = (
  schema: Record<string, SchemaField>
): DynamicSchema => {
  return {
    fields: Object.entries(schema).reduce((acc, [key, field]) => {
      acc[key] = {
        type: field.type === "number" ? "float" : field.type,
        label: field.label,
        required: field.required,
      };
      return acc;
    }, {} as Record<string, ApiSchemaField>),
  };
};

// Transform API's dynamic_schema to component's expected format
const transformDynamicSchema = (
  apiSchema: DynamicSchema
): Record<string, SchemaField> => {
  const fields = apiSchema.fields || {};
  return Object.entries(fields).reduce((acc, [key, field]) => {
    if (key.includes(",")) {
      const subFields = key.split(",").map((f) => f.trim());
      subFields.forEach((subField) => {
        acc[subField] = {
          label: subField,
          type:
            field.type === "float"
              ? "number"
              : field.type === "string"
              ? "text"
              : (field.type as "text" | "number" | "date" | "boolean"),
          required: field.required,
        };
      });
    } else {
      acc[key] = {
        label: field.label,
        type:
          field.type === "float"
            ? "number"
            : field.type === "string"
            ? "text"
            : (field.type as "text" | "number" | "date" | "boolean"),
        required: field.required,
      };
    }
    return acc;
  }, {} as Record<string, SchemaField>);
};

// Infer field type from CSV data sample
const inferFieldType = (
  value: string
): "text" | "number" | "date" | "boolean" => {
  if (!value) return "text";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return "date";
  if (/^(true|false)$/i.test(value)) return "boolean";
  if (/^\d+(\.\d+)?$/.test(value)) return "number";
  return "text";
};

export const fetchNotices = async () => {
  const response = await noticeApiClient.get<Notice[]>("/notices/");
  return response.data;
};

export const createNotice = async (data: Notice): Promise<Notice> => {
  const token = getTokenFromCookie();
  if (!token) {
    throw new Error("No authentication token found. Please log in.");
  }
  const response = await noticeApiClient.post<Notice>("/notices/", data);
  return response.data;
};

export const updateNotice = async (id: string, data: Notice) => {
  const response = await noticeApiClient.put(`/notices/${id}/`, data);
  return response.data;
};

export const deleteNotice = async (id: string) => {
  const response = await noticeApiClient.delete(`/notices/${id}/`);
  return response.data;
};

export const createNoticeType = async (
  noticeData: Omit<NoticeType, "id" | "created_at">
): Promise<NoticeType> => {
  const token = getTokenFromCookie();
  if (!token) {
    throw new Error("No authentication token found. Please log in.");
  }
  try {
    const apiPayload = {
      org_id: noticeData.org_id,
      name: noticeData.name,
      description: noticeData.description || null,
      dynamic_schema: transformDynamicSchemaForApi(noticeData.dynamic_schema),
    };
    const response = await noticeApiClient.post<ApiResponse>(
      "/notice-types/",
      apiPayload
    );
    const apiData = response.data.data;
    return {
      id: apiData.id,
      org_id: apiData.org_id,
      name: apiData.name,
      description: apiData.description,
      dynamic_schema: transformDynamicSchema(apiData.dynamic_schema),
      created_at: apiData.created_at,
    };
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      console.error("Full error:", err.response?.data, err.config);
      if (err.response?.status === 401) {
        clearTokenCookie();
        throw new Error(
          "Authentication failed. Your session may have expired. Please log in again."
        );
      }
      throw new Error(
        err.response
          ? `API Error ${err.response.status}: ${JSON.stringify(
              err.response.data
            )}`
          : "Network Error: Unable to reach the server"
      );
    }
    throw new Error("An unexpected error occurred");
  }
};

export const fetchNoticeTypes = async (
  page: number = 1
): Promise<PaginatedResponse> => {
  const token = getTokenFromCookie();
  if (!token) {
    throw new Error("No authentication token found. Please log in.");
  }
  try {
    const response = await noticeApiClient.get<PaginatedResponse>(
      `/notice-types/?page=${page}`
    );
    return response.data;
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      console.error("Full error:", err.response?.data, err.config);
      if (err.response?.status === 401) {
        clearTokenCookie();
        throw new Error(
          "Authentication failed. Your session may have expired. Please log in again."
        );
      }
      throw new Error(
        err.response
          ? `API Error ${err.response.status}: ${JSON.stringify(
              err.response.data
            )}`
          : "Network Error: Unable to reach the server"
      );
    }
    throw new Error("An unexpected error occurred");
  }
};

export const fetchNoticeTypeById = async (id: string): Promise<NoticeType> => {
  const token = getTokenFromCookie();
  if (!token) throw new Error("No authentication token found. Please log in.");
  try {
    const response = await noticeApiClient.get<ApiResponse>(
      `/notice-types/${id}/`
    );
    const apiData = response.data.data;
    return {
      id: apiData.id,
      org_id: apiData.org_id,
      name: apiData.name,
      description: apiData.description,
      dynamic_schema: transformDynamicSchema(apiData.dynamic_schema),
      created_at: apiData.created_at,
    };
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      console.error("Full error:", err.response?.data, err.config);
      if (err.response?.status === 401) {
        clearTokenCookie();
        throw new Error(
          "Authentication failed. Your session may have expired. Please log in again."
        );
      }
      throw new Error(
        err.response
          ? `API Error ${err.response.status}: ${JSON.stringify(
              err.response.data
            )}`
          : "Network Error: Unable to reach the server"
      );
    }
    throw new Error("An unexpected error occurred");
  }
};

export const updateNoticeType = async (
  id: string,
  noticeData: Omit<NoticeType, "id" | "created_at">
): Promise<NoticeType> => {
  const token = getTokenFromCookie();
  if (!token) throw new Error("No authentication token found. Please log in.");
  try {
    const apiPayload = {
      org_id: noticeData.org_id,
      name: noticeData.name,
      description: noticeData.description,
      dynamic_schema: transformDynamicSchemaForApi(noticeData.dynamic_schema),
    };
    const response = await noticeApiClient.put<ApiResponse>(
      `/notice-types/${id}/`,
      apiPayload
    );
    const apiData = response.data.data;
    return {
      id: apiData.id,
      org_id: apiData.org_id,
      name: apiData.name,
      description: apiData.description,
      dynamic_schema: transformDynamicSchema(apiData.dynamic_schema),
      created_at: apiData.created_at,
    };
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      console.error("Full error:", err.response?.data, err.config);
      if (err.response?.status === 401) {
        clearTokenCookie();
        throw new Error(
          "Authentication failed. Your session may have expired. Please log in again."
        );
      }
      throw new Error(
        err.response
          ? `API Error ${err.response.status}: ${JSON.stringify(
              err.response.data
            )}`
          : "Network Error: Unable to reach the server"
      );
    }
    throw new Error("An unexpected error occurred");
  }
};

export const deleteNoticeType = async (id: string): Promise<void> => {
  const token = getTokenFromCookie();
  if (!token) {
    throw new Error("No authentication token found. Please log in.");
  }
  try {
    await noticeApiClient.delete(`/notice-types/${id}/`);
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      console.error("Full error:", err.response?.data, err.config);
      if (err.response?.status === 401) {
        clearTokenCookie();
        throw new Error(
          "Authentication failed. Your session may have expired. Please log in again."
        );
      }
      throw new Error(
        err.response
          ? `API Error ${err.response.status}: ${JSON.stringify(
              err.response.data
            )}`
          : "Network Error: Unable to reach the server"
      );
    }
    throw new Error("An unexpected error occurred");
  }
};

export const uploadSchemaFromCsv = async (
  file: File
): Promise<Record<string, SchemaField>> => {
  const token = getTokenFromCookie();
  if (!token) {
    throw new Error("No authentication token found. Please log in.");
  }
  try {
    const text = await file.text();
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length < 1) {
      throw new Error("CSV is empty or invalid");
    }
    const headers = lines[0]
      .split(",")
      .map((h) => h.trim().replace(/^"|"$/g, ""));
    if (headers.some((h) => !h || h.includes(","))) {
      throw new Error("Invalid CSV headers: Empty or contain commas");
    }

    const formData = new FormData();
    formData.append("file", file);
    const response = await noticeApiClient.post<UploadSchemaResponse>(
      "/notice-types/upload-schema-from-csv/",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    if (!response.data.success) {
      throw new Error(`API Error: ${JSON.stringify(response.data.errors)}`);
    }

    const transformedSchema: Record<string, SchemaField> = {};
    const firstRow = lines[1]?.split(",").map((v) => v.trim()) || [];
    headers.forEach((header, index) => {
      const sampleValue = firstRow[index] || "";
      const inferredType = inferFieldType(sampleValue);
      transformedSchema[header] = {
        label: header,
        type: inferredType,
        required: false,
      };
    });

    return transformedSchema;
  } catch (err: unknown) {
    console.error("UploadSchemaFromCsv error:", err);
    if (err instanceof AxiosError) {
      console.error("Full error:", err.response?.data, err.config);
      if (err.response?.status === 401) {
        clearTokenCookie();
        throw new Error(
          "Authentication failed. Your session may have expired. Please log in again."
        );
      }
      throw new Error(
        err.response
          ? `API Error ${err.response.status}: ${JSON.stringify(
              err.response.data
            )}`
          : "Network Error: Unable to reach the server"
      );
    }
    throw new Error(
      err instanceof Error ? err.message : "An unexpected error occurred"
    );
  }
};