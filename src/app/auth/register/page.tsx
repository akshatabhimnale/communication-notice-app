"use client";

import { RegisterPayload } from "@/services/authService";
import { registerThunk } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

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

  const dispatch = useAppDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    setFormData({ ...formData, role: e.target.value as "user" | "admin" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors(null);

    try {
      await dispatch(registerThunk(formData)).unwrap();
      setLoading(false);
      router.push("/auth/login");
    } catch (err: unknown) {
      setLoading(false);
      if (typeof err === "object" && err !== null) {
        const errors = err as { [key: string]: any[] };
        setErrors(errors);
      } else {
        setErrors({ general: ["An unexpected error occurred"] });
      }
    }
  };
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
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

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
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
              error={!!errors?.email}
              helperText={errors?.email?.join(", ")}
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
            error={!!errors?.phone}
            helperText={errors?.phone?.join(", ")}
          />

          <Select
            fullWidth
            name="role"
            value={formData.role}
            onChange={handleSelectChange}
            required
            displayEmpty
            sx={{ mt: 2 }}
            error={!!errors?.role}
          >
            <MenuItem value="" disabled>
              Select Role
            </MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Organization Name"
              name="organization_name"
              value={formData.organization_name}
              onChange={handleChange}
              required
              error={!!errors?.organization_name}
              helperText={errors?.organization_name?.join(", ")}
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
            sx={{ mt: 3 }}
            disabled={loading}
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
