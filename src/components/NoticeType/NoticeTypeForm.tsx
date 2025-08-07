"use client";
import { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import DynamicFieldBuilder from "@/app/(dashboard)/[role]/notice-types/DynamicFieldBuilder";
import TemplateSetupDialog from "../templates/TemplateSetupDialog";
import { NoticeTypeFormProps, NoticeTypeFormValues } from "@/types/noticeTypesInterface";
import { AppWindow } from "lucide-react";
import { User } from "@/services/userService";
import { template } from "@/services/TemplateService";
import { ClientAdminOnly } from "@/components/auth/ClientRoleGuard";

// Utility function to decode JWT and get user info
const decodeJWT = (token: string): { user_id?: string; role?: string } | null => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = JSON.parse(atob(base64));
    return decodedPayload;
  } catch (error) {
    console.error("❌ JWT Decode Error:", error);
    return null;
  }
};

// Get current user info from cookie
const getCurrentUserInfo = (): { user_id?: string; role?: string } | null => {
  if (typeof window === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('accessToken='));
  
  if (!accessTokenCookie) return null;
  
  const token = accessTokenCookie.split('=')[1];
  return decodeJWT(token);
};

interface ExtendedNoticeTypeFormProps extends NoticeTypeFormProps {
  users: User[];
  templates: template[];
}

export const NoticeTypeForm = ({
  initialValues = {
    name: "",
    description: null,
    dynamic_schema: {},
    org_id: "",
    assigned_to: null,
  },
  onSubmit,
  onCancel,
  mode,
  orgId,
  isLoading = false,
  users,
  templates,
}: ExtendedNoticeTypeFormProps) => {
  const [values, setValues] = useState<NoticeTypeFormValues>({
    ...initialValues,
    org_id: orgId,
    name: initialValues?.name || "",
    description: initialValues?.description || null,
    dynamic_schema: initialValues?.dynamic_schema || {},
    assigned_to: initialValues?.assigned_to || null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openTemplateDialog, setOpenTemplateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<template | null>(null);
  const [templateData, setTemplateData] = useState<{
    name: string;
    channel: string[];
    template_content: string;
    id?: string;
  } | null>(null);

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
      newErrors.org_id = "Organization ID is missing";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log("handleSubmit: Starting form submission validation.");
    if (!validateForm()) {
      console.warn("handleSubmit: Form validation failed.", errors);
      return;
    }

    console.log("handleSubmit: Form validation successful. Proceeding with submission.");
    setIsSubmitting(true);

    // Get current user info to handle assigned_to field for non-admin users
    const currentUser = getCurrentUserInfo();
    const isAdmin = currentUser?.role === 'admin';
    
    const submissionData = {
      ...values,
      org_id: orgId,
      description: values.description || null,
      // For non-admin users, always set assigned_to to their own user_id
      assigned_to: isAdmin ? (values.assigned_to || null) : (currentUser?.user_id || null),
    };

    console.log("handleSubmit: Submitting notice type data:", submissionData);
    if (templateData) {
      console.log("handleSubmit: Including template data:", templateData);
    } else {
      console.log("handleSubmit: No template data to include.");
    }

    try {
      await onSubmit(submissionData, templateData ?? undefined);
      console.log("handleSubmit: Submission successful.");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred during submission.";
      console.error("handleSubmit: Submission failed.", err);
      setErrors((prev) => ({
        ...prev,
        form: `Failed to save the notice type: ${errorMessage}`,
      }));
    } finally {
      console.log("handleSubmit: Finalizing submission process.");
      setIsSubmitting(false);
    }
  };

  const handleTemplateConfirm = (data: {
    name: string;
    channel: string[];
    template_content: string;
  }) => {
    setTemplateData({ ...data, id: selectedTemplate?.id });
    setOpenTemplateDialog(false);
    setSelectedTemplate(null);
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setOpenTemplateDialog(true);
    }
  };

  if (isLoading) {
    return <></>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 0.5 }}>
      <Typography variant="h3" gutterBottom>
        {mode === "create" ? "Create" : "Edit"} Notice Type
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, justifyContent: "center" }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
          <TextField
            label="Name"
            role="NoticeName"
            placeholder="Enter notice type name"
            required
            value={values.name}
            onChange={(e) => setValues((prev) => ({ ...prev, name: e.target.value }))}
            error={!!errors.name}
            helperText={errors.name || "Required, max 100 characters"}
            inputProps={{ maxLength: 100 }}
            variant="outlined"
            disabled={isSubmitting}
          />
          <Button
            variant="contained"
            onClick={() => {
              setSelectedTemplate(null);
              setOpenTemplateDialog(true);
            }}
            disabled={isSubmitting}
            sx={{ width: "32ch", textTransform: "none" }}
            color="primary"
            size="large"
            role="Setup_btn"
            startIcon={<AppWindow />}
          >
            Create New Template
          </Button>
          {templates.length > 0 && (
            <FormControl sx={{ width: "32ch" }}>
              <InputLabel id="template-select-label">Select Template to Edit</InputLabel>
              <Select
                labelId="template-select-label"
                label="Select Template to Edit"
                value=""
                onChange={(e) => handleTemplateSelect(e.target.value)}
                disabled={isSubmitting}
              >
                <MenuItem value="">
                  <em>Select a template</em>
                </MenuItem>
                {templates.map((template) => (
                  <MenuItem key={template.id} value={template.id}>
                    {`${template.channel} Template (${template.updated_at ? new Date(template.updated_at).toLocaleString() : "N/A"})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>

        <ClientAdminOnly>
          <FormControl variant="outlined" sx={{ width: "70%" }} error={!!errors.assigned_to}>
            <InputLabel id="assigned-to-label">Assigned To</InputLabel>
            <Select
              labelId="assigned-to-label"
              label="Assigned To"
              value={values.assigned_to || ""}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, assigned_to: e.target.value || null }))
              }
              disabled={isSubmitting}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {`${user.first_name} ${user.last_name} (${user.email})`}
                </MenuItem>
              ))}
            </Select>
            {errors.assigned_to && (
              <Typography color="error" variant="body2">
                {errors.assigned_to}
              </Typography>
            )}
          </FormControl>
        </ClientAdminOnly>

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
        <TextField
          label="Description"
          role="Description"
          placeholder="Enter description"
          value={values.description || ""}
          onChange={(e) =>
            setValues((prev) => ({
              ...prev,
              description: e.target.value || null,
            }))
          }
          sx={{ width: "70%" }}
          multiline
          rows={3}
          helperText="Optional"
          variant="outlined"
          disabled={isSubmitting}
        />

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

      <TemplateSetupDialog
        open={openTemplateDialog}
        onClose={() => {
          setOpenTemplateDialog(false);
          setSelectedTemplate(null);
        }}
        onConfirm={handleTemplateConfirm}
        initialName={selectedTemplate ? selectedTemplate.channel.join(", ") : values.name}
        dynamicFields={Object.entries(values.dynamic_schema).map(([field_name, value]) => ({
          field_name,
          label: value.label || field_name,
        }))}
        initialTemplate={
          selectedTemplate
            ? { channel: selectedTemplate.channel, template_content: selectedTemplate.template_content }
            : undefined
        }
      />
    </Container>
  );
};