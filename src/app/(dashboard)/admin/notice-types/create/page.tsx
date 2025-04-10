"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { fetchUserProfile } from "@/services/userService";
import { createNoticeType } from "@/services/noticeService";
import DynamicFieldBuilder from "@/app/(dashboard)/admin/notice-types/DynamicFieldBuilder"

export default function CreateNoticeType() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dynamic_schema: {},
    org_id: "",
  });

  const [errors, setErrors] = useState({ name: "", dynamic_schema: "" });

  useEffect(() => {
    const getOrgId = async () => {
      try {
        const userProfile = await fetchUserProfile();
        const orgId = userProfile.organization_id || userProfile.organization?.id;
        if (orgId) {
          setFormData((prev) => ({ ...prev, org_id: orgId }));
        } else {
          setErrors((prev) => ({ ...prev, dynamic_schema: "Couldn’t find your club number!" }));
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setErrors((prev) => ({ ...prev, dynamic_schema: "Failed to fetch organization ID!" }));
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
      newErrors.dynamic_schema = "Organization ID is missing!";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        const noticeData = {
          org_id: formData.org_id,
          name: formData.name,
          description: formData.description || undefined,
          dynamic_schema: formData.dynamic_schema,
        };
        await createNoticeType(noticeData);
        router.push("/admin/notice-types");
      } catch (err) {
        const errorMessage=err instanceof Error ? err.message : "Failed to save the notice type!";   
        setErrors((prev) => ({
          ...prev,
          dynamic_schema: errorMessage,
        }));
      }
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
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          fullWidth
          multiline
          rows={2}
          helperText="Optional"
        />
        <DynamicFieldBuilder
          onSchemaChange={(schema) => setFormData((prev) => ({ ...prev, dynamic_schema: schema }))}
          initialSchema={{ type: { label: "Type", type: "text", required: true } }} 
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