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

export default function CreateNoticeType() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dynamic_schema: "",
    organization_id: "", 
  });

  const [errors, setErrors] = useState({ name: "", dynamic_schema: "" });

  useEffect(() => {
    const getOrgId = async () => {
      try {
        const userProfile = await fetchUserProfile(); 
        const orgId = userProfile.organization_id || userProfile.organization?.id;
        if (orgId) {
          setFormData((prev) => ({ ...prev, organization_id: orgId }));
        } else {
          setErrors((prev) => ({ ...prev, dynamic_schema: "Couldn’t find your organization id!" }));
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
      console.log("Here’s our notice-type data:", formData); 
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