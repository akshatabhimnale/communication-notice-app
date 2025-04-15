"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Input,
  CircularProgress,
} from "@mui/material";
import { fetchUserProfile } from "@/services/userService";
import { createNoticeType, uploadSchemaFromCsv } from "@/services/noticeService";
import DynamicFieldBuilder from "@/app/(dashboard)/admin/notice-types/DynamicFieldBuilder";

export default function CreateNoticeType() {
  const router = useRouter();

  const [formData, setFormData] = useState<{
    name: string;
    description: string | null;
    dynamic_schema: Record<string, { label: string; type: "text" | "number" | "date" | "boolean"; required: boolean }>;
    org_id: string;
  }>({
    name: "",
    description: "",
    dynamic_schema: {},
    org_id: "",
  });

  const [errors, setErrors] = useState({ name: "", dynamic_schema: "" });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    const getOrgId = async () => {
      try {
        const userProfile = await fetchUserProfile();
        const orgId = userProfile.organization_id || userProfile.organization?.id;
        if (orgId) {
          setFormData((prev) => ({ ...prev, org_id: orgId }));
        } else {
          setErrors((prev) => ({ ...prev, dynamic_schema: "Couldn’t find your club number" }));
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setErrors((prev) => ({ ...prev, dynamic_schema: "Failed to fetch organization ID" }));
      }
    };
    getOrgId();
  }, []);

  const validateForm = () => {
    let valid = true;
    const newErrors = { name: "", dynamic_schema: "" };

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    } else if (formData.name.length > 100) {
      newErrors.name = "Name must be 100 characters or less";
      valid = false;
    }

    if (Object.keys(formData.dynamic_schema).length === 0) {
      newErrors.dynamic_schema = "At least one field is required in the schema";
      valid = false;
    }

    if (!formData.org_id) {
      newErrors.dynamic_schema = "Organization ID is missing";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      const noticeData = {
        org_id: formData.org_id,
        name: formData.name,
        description: formData.description || null,
        dynamic_schema: formData.dynamic_schema,
      };
      await createNoticeType(noticeData);
      router.push("/admin/notice-types");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save the notice type";
      setErrors((prev) => ({
        ...prev,
        dynamic_schema: errorMessage,
      }));
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".csv") && !file.name.endsWith(".xlsx")) {
      setUploadError("Please upload a CSV or XLSX file");
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const schema = await uploadSchemaFromCsv(file);
      // console.log("Raw schema from uploadSchemaFromCsv:", JSON.stringify(schema, null, 2));
      // Validate schema
      const isValidSchema = Object.keys(schema).every(
        (key) =>
          !key.includes(",") &&
          schema[key].label &&
          ["text", "number", "date", "boolean", "email"].includes(schema[key].type)
      );
      if (!isValidSchema) {
        console.error("Invalid schema detected:", JSON.stringify(schema, null, 2));
        setUploadError("Invalid schema: Field names may contain commas or types are incorrect");
        return;
      }
      // Update formData
      setFormData((prev) => ({
        ...prev,
        dynamic_schema: {
          ...prev.dynamic_schema,
          ...schema,
        },
      }));
      // console.log("Updated formData.dynamic_schema:", JSON.stringify({ ...formData.dynamic_schema, ...schema }, null, 2));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to extract schema from file";
      console.error("Upload error:", errorMessage);
      setUploadError(errorMessage);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Create Notice Type
      </Typography>
      <Box component="form" noValidate sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <TextField
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          fullWidth
          error={!!errors.name}
          helperText={errors.name || "Required, max 100 characters"}
          inputProps={{ maxLength: 100 }}
        />
        <TextField
          label="Description"
          value={formData.description ?? ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value || null }))}
          fullWidth
          multiline
          rows={2}
          helperText="Optional"
        />
        <Box sx={{ my: 2 }}>
          <Button
            variant="contained"
            component="label"
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : null}
          >
            Upload CSV/XLSX (Optional)
            <Input
              type="file"
              inputProps={{ accept: ".csv,.xlsx" }}
              onChange={handleFileUpload}
              sx={{ display: "none" }}
            />
          </Button>
          {uploadError && (
            <Typography color="error" sx={{ mt: 1 }}>
              {uploadError}
            </Typography>
          )}
        </Box>
        <DynamicFieldBuilder
          onSchemaChange={(schema) => setFormData((prev) => ({ ...prev, dynamic_schema: schema }))}
          initialSchema={formData.dynamic_schema}
        />
        {errors.dynamic_schema && (
          <Typography color="error">{errors.dynamic_schema}</Typography>
        )}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Save
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => router.push("/admin/notice-types")}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Container>
  );
}