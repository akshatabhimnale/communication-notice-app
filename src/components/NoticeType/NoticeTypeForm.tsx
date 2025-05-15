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
import TemplateSetupDialog from "../templates/TemplateSetupDialog";
import { NoticeTypeFormProps, NoticeTypeFormValues } from "@/types/noticeTypesInterface";
import { AppWindow } from "lucide-react";


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
  const [openTemplateDialog, setOpenTemplateDialog] = useState(false);
  const [templateData, setTemplateData] = useState<{
    name: string;
    channel: string;
    template_content: string;
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
      newErrors.dynamic_schema = "Organization ID is missing";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles the form submission process.
   * Validates the form, sets the submitting state, calls the onSubmit prop,
   * and handles potential errors.
   */
  const handleSubmit = async () => {
    console.log("handleSubmit: Starting form submission validation.");
    if (!validateForm()) {
      console.warn("handleSubmit: Form validation failed.", errors);
      return;
    }

    console.log("handleSubmit: Form validation successful. Proceeding with submission.");
    setIsSubmitting(true);

    const submissionData = {
      ...values,
      org_id: orgId,
      description: values.description || null,
    };

    console.log("handleSubmit: Submitting notice type data:", submissionData);
    if (templateData) {
      console.log("handleSubmit: Including template data:", templateData);
    } else {
      console.log("handleSubmit: No template data to include.");
    }


    try {
      // Call the provided onSubmit function with the form values and optional template data
      await onSubmit(submissionData, templateData ?? undefined);
      console.log("handleSubmit: Submission successful.");

    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred during submission.";
      console.error("handleSubmit: Submission failed.", err);
      setErrors((prev) => ({
        ...prev,
        form: `Failed to save the notice type: ${errorMessage}`, // Provide more context
      }));
    } finally {
      console.log("handleSubmit: Finalizing submission process.");
      setIsSubmitting(false);
    }
  };

  const handleTemplateConfirm = (data: {
    name: string;
    channel: string;
    template_content: string;
  }) => {
    setTemplateData(data);
    setOpenTemplateDialog(false);
  };

  if (isLoading) {
    return <></>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 0.5 }}>
      <Typography variant="h3" gutterBottom>
        {mode === "create" ? "Create" : "Edit"} Notice Type
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3,justifyContent: "center" }}>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}> {/* Added Box wrapper */}
          <TextField
            label="Name"
            role="NoticeName"
            placeholder="Enter notice type name"
            required
            value={values.name}
            onChange={(e) =>setValues((prev) => ({ ...prev, name: e.target.value }))}
            error={!!errors.name}
            helperText={errors.name || "Required, max 100 characters"}
            inputProps={{ maxLength: 100 }}
            variant="outlined"
            disabled={isSubmitting}
          />
          <Button
            variant="contained"
            onClick={() => setOpenTemplateDialog(true)}
            disabled={isSubmitting}
            sx={{width: '32ch',textTransform: "none"}}
            color="primary"
            size="large"
            role="Setup_btn"
            startIcon={<AppWindow />}
          >
            Setup Common Template
          </Button>
        </Box> 

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
        onClose={() => setOpenTemplateDialog(false)}
        onConfirm={handleTemplateConfirm}
        initialName={values.name}
        dynamicFields={Object.entries(values.dynamic_schema).map(([field_name, value]) => ({
          field_name,
          label: value.label || field_name,
        }))}
      />
    </Container>
  );
};