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
  BulkUploadResponse,
  TransformedNoticeType,
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
  console.log("Raw API Schema:", JSON.stringify(apiSchema, null, 2));
  const fields = apiSchema.fields || {};
  const transformed = Object.entries(fields).reduce((acc, [key, field]) => {
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
  console.log("Transformed Schema:", JSON.stringify(transformed, null, 2));
  return transformed;
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

// Updated function to fetch notice types with transformed schemas
export const fetchNoticeTypesWithTransformedSchemas = async (
  page: number = 1
): Promise<Omit<PaginatedResponse, 'results'> & { results: TransformedNoticeType[] }> => {
  const response = await fetchNoticeTypes(page);
  const transformedResults = response.results.map((noticeType) => ({
    ...noticeType,
    dynamic_schema: transformDynamicSchema(noticeType.dynamic_schema) as Record<string, SchemaField>,
  }));
  return {
    ...response,
    results: transformedResults,
  };
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

// Validate CSV headers against notice type's dynamic_schema
const validateCsvHeaders = (
  headers: string[],
  dynamicSchema: Record<string, SchemaField>
): { isValid: boolean; missingFields: string[]; extraFields: string[] } => {
  const schemaFields = Object.keys(dynamicSchema);
  const lowerCaseSchemaFields = schemaFields.map((field) => field.toLowerCase());
  const lowerCaseHeaders = headers.map((header) => header.toLowerCase());

  const missingFields = schemaFields.filter(
    (field) =>
      dynamicSchema[field].required &&
      !lowerCaseHeaders.includes(field.toLowerCase())
  );
  const extraFields = headers.filter(
    (header) => !lowerCaseSchemaFields.includes(header.toLowerCase())
  );

  console.log("CSV Headers:", headers);
  console.log("Dynamic Schema:", JSON.stringify(dynamicSchema, null, 2));
  console.log("Schema Fields:", schemaFields);
  console.log("Missing Required Fields:", missingFields);
  console.log("Extra Fields:", extraFields);

  return {
    isValid: missingFields.length === 0 && extraFields.length === 0,
    missingFields,
    extraFields,
  };
};

export const bulkCreateNotices = async (
  file: File,
  noticeTypeId: string,
  createdBy: string,
  noticeTypeSchema: Record<string, SchemaField>
): Promise<BulkUploadResponse> => {
  const token = getTokenFromCookie();
  if (!token) {
    throw new Error("No authentication token found. Please log in.");
  }

  console.log("Input Notice Type Schema:", JSON.stringify(noticeTypeSchema, null, 2));

  try {
    // Read CSV file
    const text = await file.text();
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length < 2) {
      throw new Error("CSV is empty or has no data rows");
    }

    const headers = lines[0]
      .split(",")
      .map((h) => h.trim().replace(/^"|"$/g, ""));
    if (headers.some((h) => !h || h.includes(","))) {
      throw new Error("Invalid CSV headers: Empty or contain commas");
    }

    // Validate CSV headers against notice type schema
    const { isValid, missingFields, extraFields } = validateCsvHeaders(
      headers,
      noticeTypeSchema
    );
    if (!isValid) {
      throw new Error(
        `CSV headers do not match notice type schema. Missing required fields: ${missingFields.join(
          ", "
        )}. Extra fields: ${extraFields.join(", ")}`
      );
    }

    const createdNotices: Notice[] = [];
    const failedRows: Array<{ row: number; error: string }> = [];

    // Process each row (skip header)
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(",").map((v) => v.trim());
      if (row.length !== headers.length) {
        failedRows.push({ row: i + 1, error: "Invalid number of columns" });
        continue;
      }

      // Build dynamic_data from row, mapping headers to schema fields (case-insensitive)
      const dynamicData: Record<string, any> = {};
      headers.forEach((header, index) => {
        const schemaField = Object.keys(noticeTypeSchema).find(
          (field) => field.toLowerCase() === header.toLowerCase()
        );
        if (schemaField) {
          dynamicData[schemaField] = row[index]; // Use schema field name (e.g., "Title" instead of "title")
        }
      });

      // Create notice payload
      const payload = {
        notice_type: noticeTypeId,
        dynamic_data: dynamicData,
        created_by: createdBy,
        status: "active",
        priority: "medium",
      };

      console.log(`Sending payload for row ${i + 1}:`, JSON.stringify(payload, null, 2));

      try {
        const response = await noticeApiClient.post<Notice>("/notices/", payload);
        createdNotices.push(response.data);
      } catch (err) {
        const errorMessage =
          err instanceof AxiosError
            ? `API Error ${err.response?.status}: ${JSON.stringify(err.response?.data)}`
            : "Unexpected error";
        failedRows.push({ row: i + 1, error: errorMessage });
      }
    }

    return {
      success: createdNotices.length > 0,
      data: {
        created: createdNotices,
        failed: failedRows,
      },
      errors: failedRows.length > 0 ? { failedRows } : {},
      meta: {},
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
    throw new Error(
      err instanceof Error ? err.message : "An unexpected error occurred"
    );
  }
};