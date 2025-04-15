"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { fetchNoticeTypeById, updateNoticeType } from "@/services/noticeService";
import DynamicFieldBuilder from "@/app/(dashboard)/admin/notice-types/DynamicFieldBuilder";

export default function EditNoticeType() {
  const router = useRouter();
  const { id } = useParams();
  // console.log("Notice type ID:", id);

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNoticeType = async () => {
      if (!id || typeof id !== "string") {
        setErrors((prev) => ({ ...prev, dynamic_schema: "Invalid notice type ID" }));
        setLoading(false);
        return;
      }
      try {
        const data = await fetchNoticeTypeById(id);
        // console.log("Data loaded:", JSON.stringify(data, null, 2));
        setFormData({
          name: data.name || "",
          description: data.description || "",
          dynamic_schema: data.dynamic_schema || {},
          org_id: data.org_id || "",
        });
      } catch (error) {
        console.error("Error fetching notice type:", error);
        setErrors((prev) => ({ ...prev, dynamic_schema: "Failed to load notice type" }));
      } finally {
        setLoading(false);
      }
    };
    loadNoticeType();
  }, [id]);

  useEffect(() => {
    // console.log("Form data updated:", JSON.stringify(formData, null, 2));
  }, [formData]);

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
      await updateNoticeType(id as string, noticeData);
      router.push("/admin/notice-types");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update the notice type";
      setErrors((prev) => ({
        ...prev,
        dynamic_schema: errorMessage,
      }));
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="h6">Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Edit Notice Type
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Box>
          <TextField
            label="Notice Name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            fullWidth
            error={!!errors.name}
            helperText={errors.name || "Required, max 100 characters"}
            inputProps={{ maxLength: 100 }}
            variant="outlined"
          />
        </Box>
        <Box>
          <TextField
            label="Description"
            value={formData.description || ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value || null }))}
            fullWidth
            multiline
            rows={3}
            helperText="Optional"
            variant="outlined"
          />
        </Box>
        <DynamicFieldBuilder
          onSchemaChange={(schema) => setFormData((prev) => ({ ...prev, dynamic_schema: schema }))}
          initialSchema={formData.dynamic_schema}
        />
        {errors.dynamic_schema && (
          <Typography color="error" variant="body2">
            {errors.dynamic_schema}
          </Typography>
        )}
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Update
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => router.push("/admin/notice-types")}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Container>
  );
}