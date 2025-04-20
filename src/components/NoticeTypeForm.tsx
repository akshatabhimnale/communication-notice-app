// components/NoticeTypeForm/NoticeTypeForm.tsx
"use client";

import { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
} from "@mui/material";
import DynamicFieldBuilder from "@/app/(dashboard)/admin/notice-types/DynamicFieldBuilder";
import {NoticeTypeFormProps,NoticeTypeFormValues } from "@/types/noticeTypesInterface";


export const NoticeTypeForm = ({
  initialValues = {
    name: "",
    description: null,
    dynamic_schema: {},
    org_id: "",
  },
  onSubmit,
  onCancel,
  mode,
  orgId,
  isLoading = false,
}: NoticeTypeFormProps) => {
  const [values, setValues] = useState<NoticeTypeFormValues>({
    ...initialValues,
    org_id: orgId,
    name: initialValues?.name || "",
    description: initialValues?.description || null,
    dynamic_schema: initialValues?.dynamic_schema || {},
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!values.name.trim()) {
      newErrors.name = "Name is required";
    } else if (values.name.length > 100) {
      newErrors.name = "Name must be 100 characters or less";
    }

    if (Object.keys(values.dynamic_schema).length === 0) {
      newErrors.dynamic_schema = "At least one field is required in the schema";
    }

    if (!values.org_id) {
      newErrors.dynamic_schema = "Organization ID is missing";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
  
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...values,
        org_id: orgId, // Ensure org_id is included in submission
        description: values.description || null,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save the notice type";
      setErrors((prev) => ({
        ...prev,
        form: errorMessage,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 0.5 }}>
      <Typography variant="h4" gutterBottom>
        {mode === "create" ? "Create" : "Edit"} Notice Type
      </Typography>
      
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <TextField
          label="Name"
          value={values.name}
          onChange={(e) =>
            setValues((prev) => ({ ...prev, name: e.target.value }))
          }
          fullWidth
          error={!!errors.name}
          helperText={errors.name || "Required, max 100 characters"}
          inputProps={{ maxLength: 100 }}
          variant="outlined"
          disabled={isSubmitting}
        />

        <TextField
          label="Description"
          value={values.description || ""}
          onChange={(e) =>
            setValues((prev) => ({ 
              ...prev, 
              description: e.target.value || null 
            }))
          }
          fullWidth
          multiline
          rows={2}
          helperText="Optional"
          variant="outlined"
          disabled={isSubmitting}
        />

        <DynamicFieldBuilder
          onSchemaChange={(schema) =>
            setValues((prev) => ({ ...prev, dynamic_schema: schema }))
          }
          initialSchema={values.dynamic_schema}
          disabled={isSubmitting}
        />

        {errors.dynamic_schema && (
          <Typography color="error" variant="body2">
            {errors.dynamic_schema}
          </Typography>
        )}

        {errors.form && (
          <Typography color="error" variant="body2">
            {errors.form}
          </Typography>
        )}

        <Box sx={{ display: "flex", gap: 2, mt: 0 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting
              ? mode === "create"
                ? "Creating..."
                : "Updating..."
              : mode === "create"
              ? "Create"
              : "Update"}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Container>
  );
};