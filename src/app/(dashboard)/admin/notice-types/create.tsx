// src/app/(dashboard)/admin/notice-types/create.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { RootState } from "@/store";

export default function CreateNoticeType() {
  const router = useRouter();
  const orgId = useSelector((state: RootState) => state.user.organization_id);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dynamic_schema: "",
  });
  const [errors, setErrors] = useState({ name: "", dynamic_schema: "" });

  const validateForm = () => {
    let valid = true;
    const newErrors = { name: "", dynamic_schema: "" };

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
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

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const dataToSubmit = {
        ...formData,
        organization_id: orgId,
      };
      console.log("Form data:", dataToSubmit);
      router.push("/admin/notice-types");
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
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          fullWidth
          error={!!errors.name}
          helperText={errors.name}
        />
        <TextField
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          fullWidth
          multiline
          rows={2}
        />
        <TextField
          label="Dynamic Schema (JSON)"
          value={formData.dynamic_schema}
          onChange={(e) => setFormData({ ...formData, dynamic_schema: e.target.value })}
          fullWidth
          multiline
          rows={4}
          error={!!errors.dynamic_schema}
          helperText={errors.dynamic_schema}
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