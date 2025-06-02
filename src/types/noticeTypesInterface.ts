export interface Notice {
  id?: string;
  title: string;
  description: string;
  createdAt?: string;
}

export interface BulkUploadResponse {
  success: boolean;
  data: {
    created: Notice[];
    failed: Array<{ row: number; error: string }>;
  };
  errors: Record<string, unknown>;
  meta: Record<string, unknown>;
}

export interface SchemaField {
  label: string;
  type: "text" | "number" | "date" | "boolean";
  required: boolean;
}

export interface DynamicSchema {
  fields: Record<string, { type: string; label: string; required: boolean }>;
}

export interface NoticeType {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  dynamic_schema: Record<string, SchemaField>;
  created_at: string;
  assigned_to: string | null;
}

export interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NoticeType[];
}

export interface ApiSchemaField {
  type: string;
  label: string;
  required: boolean;
}

export interface ApiNoticeType {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  dynamic_schema: DynamicSchema;
  created_at: string;
  assigned_to: string | null;
}

export interface ApiResponse {
  success: boolean;
  data: ApiNoticeType;
  errors: Record<string, unknown>;
  meta: Record<string, unknown>;
}

export interface UploadSchemaResponse {
  success: boolean;
  data: {
    dynamic_schema: Record<string, { label: string; type: string }>;
  };
  errors: Record<string, unknown>;
  meta: Record<string, unknown>;
}

export interface Field {
  field_name: string;
  label: string;
  type: "text" | "number" | "date" | "boolean";
  required: boolean;
}

export interface Schema {
  [key: string]: SchemaField;
}

export interface DynamicFieldBuilderProps {
  onSchemaChange: (schema: Schema) => void;
  initialSchema?: Schema;
  disabled?: boolean;
}

export interface NoticeTypeFormValues {
  name: string;
  description: string | null;
  dynamic_schema: Record<string, SchemaField>;
  org_id: string;
  assigned_to: string | null;
}

export interface NoticeTypeFormProps {
  initialValues?: Partial<NoticeTypeFormValues>;
  onSubmit: (
    values: NoticeTypeFormValues,
    templateData?: { name: string; channel: string; template_content: string }
  ) => Promise<void>;
  onCancel: () => void;
  mode: "create" | "edit";
  orgId: string;
  isLoading?: boolean;
}

export interface TransformedNoticeType {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  dynamic_schema: Record<string, SchemaField>;
  created_at: string;
  assigned_to: string | null;
}