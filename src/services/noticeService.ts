import noticeApiClient from "./apiClients/noticeApiClient";
import { AxiosError } from "axios";
import { getTokenFromCookie, clearTokenCookie } from "@/services/userService";
import {
  Notice,
  SchemaField,
  DynamicSchema,
  NoticeType,
  PaginatedResponse,
  PaginatedNoticeResponse,
  ApiSchemaField,
  ApiResponse,
  UploadSchemaResponse,
  BulkUploadResponse,
  TransformedNoticeType,
  BatchNameCheckResponse,
  BatchNameApiResponse,
  CreateNoticeRequest,
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
  const fields = apiSchema.fields.fields || {};
  const transformed = Object.entries(fields).reduce((acc, [key, field]) => {
    // Ensure field is typed as ApiSchemaField
    const typedField = field as unknown as ApiSchemaField;
    // Handle cases where key might contain commas (e.g., "field1, field2")
    if (key.includes(",")) {
      const subFields = key.split(",").map((f) => f.trim());
      subFields.forEach((subField) => {
        acc[subField] = {
          label: subField,
          type: typedField.type === "float"
              ? "number"
              : typedField.type === "string"
              ? "text"
              : (typedField.type as "text" | "number" | "date" | "boolean"),
          required: typedField.required,
        };
      });
    } else {
      acc[key] = {
        label: typedField.label,
        type:
          typedField.type === "float"
            ? "number"
            : typedField.type === "string"
            ? "text"
            : (typedField.type as "text" | "number" | "date" | "boolean"),
        required: typedField.required,
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

// export const fetchNotices = async () => {
//   const token = getTokenFromCookie();
//   if (!token) {
//     throw new Error("No authentication token found. Please log in.");
//   }
//   try {
//     const response = await noticeApiClient.get<PaginatedNoticeResponse>("/notices/");
//     return response.data.results;
//   } catch (err: unknown) {
//     if (err instanceof AxiosError) {
//       console.error("Full error:", err.response?.data, err.config);
//       if (err.response?.status === 401) {
//         clearTokenCookie();
//         throw new Error(
//           "Authentication failed. Your session may have expired. Please log in again."
//         );
//       }
//       throw new Error(
//         err.response
//           ? `API Error ${err.response.status}: ${JSON.stringify(
//               err.response.data
//             )}`
//           : "Network Error: Unable to reach the server"
//       );
//     }
//     throw new Error("An unexpected error occurred");
//   }
// };

export const fetchNotices = async (params: { user_id?: string; notice_type?: string } = {}) => {
  const token = getTokenFromCookie();
  if (!token) {
    throw new Error("No authentication token found. Please log in.");
  }
  try {
    // Construct query string from params
    const queryString = new URLSearchParams(
    
      Object.entries(params).filter(([, v]) => v != null)
    ).toString();
    const url = `/notices/${queryString ? `?${queryString}` : ""}`;
    const response = await noticeApiClient.get<PaginatedNoticeResponse>(url);
    return response.data.results;
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
      assigned_to: noticeData.assigned_to || null,
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
      assigned_to: apiData.assigned_to,
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

export const fetchNoticeTypesWithTransformedSchemas = async (
  page: number = 1
): Promise<Omit<PaginatedResponse, 'results'> & { results: TransformedNoticeType[] }> => {
  const response = await fetchNoticeTypes(page);
  const transformedResults = response.results.map((noticeType) => {
    // Some notice types might not have dynamic_schema in the new flow
    if (!noticeType.dynamic_schema) {
      return noticeType as unknown as TransformedNoticeType;
    }

    const dynamicSchemaForTransform: DynamicSchema = {
      fields: noticeType.dynamic_schema as unknown as Record<string, { type: string; label: string; required: boolean }>
    };

    return {
      ...noticeType,
      dynamic_schema: transformDynamicSchema(dynamicSchemaForTransform),
    } as TransformedNoticeType;
  });
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
      assigned_to: apiData.assigned_to,
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
      assigned_to: noticeData.assigned_to || null,
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
      assigned_to: apiData.assigned_to,
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

// New bulk notices API: upload file directly to create bulk record
export const bulkCreateNotices = async (
  file: File,
  noticeTypeId: string,
  createdBy: string,
  batchName: string,
  status: string = "pending"
): Promise<BulkUploadResponse> => {
  const token = getTokenFromCookie();
  if (!token) {
    throw new Error("No authentication token found. Please log in.");
  }

  try {
    const formData = new FormData();
    formData.append("filename", file);
    formData.append("notice_type", noticeTypeId);
    formData.append("created_by", createdBy);
    formData.append("batch_name", batchName);
    if (status) formData.append("status", status);

    const response = await noticeApiClient.post(
      "/bulk-notices/",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return response.data;
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      console.error("Bulk notices upload error:", err.response?.data, err.config);
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
    throw new Error("An unexpected error occurred during bulk notices upload");
  }
};

// New individual notice creation - Step 2: Create notices one by one

export const createIndividualNotice = async (
  noticeTypeId: string,
  dynamicData: Record<string, unknown>,
  createdBy: string,
  batchName?: string
): Promise<Notice> => {
  const token = getTokenFromCookie();
  if (!token) {
    throw new Error("No authentication token found. Please log in.");
  }

  // Debug: Log the raw dynamic data
  console.log("Creating notice with dynamic_data:", dynamicData);
  console.log("Notice type ID:", noticeTypeId);
  console.log("Created by:", createdBy);
  console.log("Batch name:", batchName);

  // Clean and validate dynamic_data to ensure only primitive types
  const cleanDynamicData: Record<string, string | number | boolean> = {};
  
  for (const [key, value] of Object.entries(dynamicData)) {
    if (value === null || value === undefined) {
      cleanDynamicData[key] = "";
    } else if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      cleanDynamicData[key] = value;
    } else {
      // Convert any complex types to string
      cleanDynamicData[key] = String(value);
    }
  }
  
  console.log("Cleaned dynamic_data:", cleanDynamicData);
  
  // Ensure the dynamic_data is a plain object without any nested structures
  const payload: CreateNoticeRequest = {
    notice_type: noticeTypeId,
    dynamic_data: cleanDynamicData,
    created_by: createdBy,
    status: "active",
    priority: "medium",
  };

  // Add batch_name if provided
  if (batchName && batchName.trim()) {
    payload.batch_name = batchName.trim();
  }

  // Debug: Log the final payload
  console.log("Final payload being sent:", JSON.stringify(payload, null, 2));
  
  try {
    // Remove explicit Content-Type header - let the API client handle it
    const response = await noticeApiClient.post<Notice>("/notices/", payload);
    return response.data;
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      console.error("Create notice error:", err.response?.data, err.config);
      console.error("Error response details:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        headers: err.config?.headers,
      });
      
      if (err.response?.status === 401) {
        clearTokenCookie();
        throw new Error(
          "Authentication failed. Your session may have expired. Please log in again."
        );
      }
      
      // Extract error message from response
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message ||
                          err.response?.data?.error ||
                          `API Error ${err.response?.status}`;
      
      throw new Error(errorMessage);
    }
    throw new Error("An unexpected error occurred while creating notice");
  }
};

export const checkBatchNameAvailability = async (
  batchName: string
): Promise<BatchNameCheckResponse> => {
  const token = getTokenFromCookie();
  if (!token) {
    throw new Error("No authentication token found. Please log in.");
  }

  try {
    const searchUrl = `/bulk-notices/batch-names/?search=${encodeURIComponent(batchName)}`;
    console.log("🔍 Making API call to:", searchUrl);
    console.log("🔍 Full URL will be:", `${noticeApiClient.defaults.baseURL}${searchUrl}`);
    
    const response = await noticeApiClient.get<BatchNameApiResponse>(searchUrl);
    
    // Debug: Log the full response
    console.log("Batch name check API response:", JSON.stringify(response.data, null, 2));
    
    // Handle the actual API response format
    const responseData = response.data;
    
    // If the response is successful and batch_names array is empty, the name is available
    if (responseData.success && responseData.data && Array.isArray(responseData.data.batch_names)) {
      const existingBatchNames = responseData.data.batch_names;
      
      console.log("Existing batch names found:", existingBatchNames);
      console.log("Searched batch name:", batchName);
      
      // Check if the searched batch name exists in the returned array
      const isNameTaken = existingBatchNames.some(name => 
        name.toLowerCase() === batchName.toLowerCase()
      );
      
      if (!isNameTaken) {
        // The searched name is not in the list - name is available
        console.log("✅ Batch name is available (not found in existing names)");
        return {
          available: true,
          message: "Batch name is available"
        };
      } else {
        // Found the searched name in the list - name is taken
        console.log("❌ Batch name is taken (found in existing names)");
        return {
          available: false,
          message: "Batch name is already taken",
          suggestions: [] // Will be generated by the hook
        };
      }
    }
    
    // Fallback: if response structure is unexpected, assume available
    return {
      available: true,
      message: "Batch name is available"
    };
    
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      // If 404, it means the batch name is available (old logic as fallback)
      if (err.response?.status === 404) {
        return {
          available: true,
          message: "Batch name is available"
        };
      }
      
      console.error("CheckBatchNameAvailability error:", err.response?.data);
      
      // If the API returns a proper response with suggestions
      if (err.response?.data) {
        return {
          available: false,
          suggestions: err.response.data.suggestions || [],
          message: err.response.data.message || "Batch name is already taken"
        };
      }
      
      throw new Error(
        `API Error ${err.response?.status}: ${err.response?.statusText}`
      );
    }
    throw new Error("An unexpected error occurred while checking batch name");
  }
};