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
import { fetchUserProfile, createNoticeType } from "@/services/userService";

export default function CreateNoticeType() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dynamic_schema: '{"type": "event"}',
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
      } catch (err) {
        setErrors((prev) => ({ ...prev, dynamic_schema: "Oops! Something went wrong getting your info." }));
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

    if (formData.dynamic_schema) {
      try {
        JSON.parse(formData.dynamic_schema);
      } catch (e) {
        newErrors.dynamic_schema = "Dynamic Schema must be valid JSON";
        valid = false;
      }
    } else {
      newErrors.dynamic_schema = "Dynamic Schema is required";
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
          dynamic_schema: JSON.parse(formData.dynamic_schema),
        };
        await createNoticeType(noticeData);
        router.push("/admin/notice-types");
      } catch (err) {
        setErrors((prev) => ({
          ...prev,
          dynamic_schema: err instanceof Error ? err.message : "Failed to save the notice type!",
        }));
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Create Notice Type
      </Typography>
      <Box component="form" noValidate sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
        <TextField
          label="Dynamic Schema (JSON)"
          value={formData.dynamic_schema}
          onChange={(e) => setFormData((prev) => ({ ...prev, dynamic_schema: e.target.value }))}
          fullWidth
          multiline
          rows={4}
          error={!!errors.dynamic_schema}
          helperText={errors.dynamic_schema || "Required, e.g., {\"type\": \"event\"}"}
        />
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