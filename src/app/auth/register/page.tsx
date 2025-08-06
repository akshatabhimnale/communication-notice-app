"use client";

import { RegisterPayload } from "@/services/authService";
import { registerThunk } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import {
  Avatar,
  Box,
  Button,
  Container,
  CssBaseline,
  MenuItem,
  Link,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  Stack,
  Autocomplete,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { fetchOrganizations } from "@/services/organizationService";
import { useSnackbar } from "notistack";

export interface Organization {
  name: string;
  phone: string;
  address: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterPayload>({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    role: "admin",
    organization_name: "",
    organization_address: "",
    organization_phone: "",
  });

  const [allOrganizations, setAllOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const orgs = await fetchOrganizations();
        setAllOrganizations(orgs);
      } catch (error) {
        setApiError(error instanceof Error ? error.message : "Failed to load organizations");
        enqueueSnackbar("Failed to load organizations", { variant: "error",autoHideDuration: 3000  });
      }
    };
    loadOrganizations();
  }, [enqueueSnackbar]);

  const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return null;
  };

  const validatePhone = (phone: string): string | null => {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phone) return "Phone number is required";
    if (!phoneRegex.test(phone)) return "Please enter a valid phone number (minimum 10 digits)";
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validate on change
    let error: string | null = null;
    if (name === "email") {
      error = validateEmail(value);
    } else if (name === "phone") {
      error = validatePhone(value);
    }

    setValidationErrors((prev) => ({
      ...prev,
      [name]: error || "",
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    setFormData({ ...formData, role: e.target.value as "user" | "admin" });
  };

  const handleOrganizationSelect = (
    event: React.SyntheticEvent,
    value: Organization | string | null
  ) => {
    if (typeof value === "string") {
      setFormData({
        ...formData,
        organization_name: value,
      });
    } else if (value) {
      setFormData({
        ...formData,
        organization_name: value.name,
        organization_phone: value.phone,
        organization_address: value.address,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate before submission
    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.phone);

    if (emailError || phoneError) {
      setValidationErrors({
        email: emailError || "",
        phone: phoneError || "",
      });
      return;
    }

    setLoading(true);
    setErrors(null);

    try {
      await dispatch(registerThunk(formData)).unwrap();
      setLoading(false);
      enqueueSnackbar("Registration successful!", {
        variant: "success",
        autoHideDuration: 2500 
      });
      router.push("/auth/login");
    } catch (err: unknown) {
      setLoading(false);
      if (typeof err === "object" && err !== null) {
        const errors = err as Record<string, string[]>;
        setErrors(errors);
      } else {
        setErrors({ general: ["An unexpected error occurred"] });
        enqueueSnackbar("An unexpected error occurred", { variant: "error" });
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: "auto", bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ mt: 1 }}>
          Sign Up
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            margin="normal"
            error={!!errors?.username}
            helperText={errors?.username?.join(", ")}
          />

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              error={!!errors?.email || !!validationErrors.email}
              helperText={
                validationErrors.email || errors?.email?.join(", ") || ""
              }
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              error={!!errors?.password}
              helperText={errors?.password?.join(", ")}
            />
          </Stack>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              error={!!errors?.first_name}
              helperText={errors?.first_name?.join(", ")}
            />
            <TextField
              fullWidth
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              error={!!errors?.last_name}
              helperText={errors?.last_name?.join(", ")}
            />
          </Stack>

          <TextField
            fullWidth
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            margin="normal"
            error={!!errors?.phone || !!validationErrors.phone}
            helperText={validationErrors.phone || errors?.phone?.join(", ") || ""}
          />

          <Select
            fullWidth
            name="role"
            value={formData.role}
            onChange={handleSelectChange}
            required
            displayEmpty
            sx={{ mt: 1 }}
            error={!!errors?.role}
          >
            <MenuItem value="" disabled>
              Select Role
            </MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="user">User</MenuItem>
          </Select>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Autocomplete
              fullWidth
              freeSolo
              options={allOrganizations.filter((org) =>
                formData.organization_name.length >= 1
                  ? org.name.toLowerCase().includes(formData.organization_name.toLowerCase())
                  : false
              )}
              getOptionLabel={(option) =>
                typeof option === "string" ? option : option.name
              }
              onChange={handleOrganizationSelect}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Organization Name"
                  name="organization_name"
                  value={formData.organization_name}
                  onChange={handleChange}
                  required
                  error={!!errors?.organization_name}
                  helperText={
                    errors?.organization_name?.join(", ") || apiError || ""
                  }
                />
              )}
              noOptionsText="No organizations found"
              loading={allOrganizations.length === 0 && !apiError}
            />
            <TextField
              fullWidth
              label="Organization Phone"
              name="organization_phone"
              value={formData.organization_phone}
              onChange={handleChange}
              error={!!errors?.organization_phone}
              helperText={errors?.organization_phone?.join(", ")}
            />
          </Stack>

          <TextField
            fullWidth
            label="Organization Address"
            name="organization_address"
            value={formData.organization_address}
            onChange={handleChange}
            margin="normal"
            error={!!errors?.organization_address}
            helperText={errors?.organization_address?.join(", ")}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            disabled={loading || !!validationErrors.email || !!validationErrors.phone}
          >
            {loading ? "Registering..." : "Register"}
          </Button>
        </Box>

        {errors?.general && (
          <Typography color="error" sx={{ mt: 2 }}>
            ⚠️ {errors.general.join(", ")}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
        <Link href="/auth/login" variant="body2">
          {"Have an account? Sign In"}
        </Link>
      </Box>
    </Container>
  );
}