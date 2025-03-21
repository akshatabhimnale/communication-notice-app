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
    role: "user",
    organization_name: "",
    organization_address: "",
    organization_phone: "",
  });

  const dispatch = useAppDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    setFormData({ ...formData, role: e.target.value as "user" | "admin" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await dispatch(registerThunk(formData)).unwrap();

      setLoading(false);
      router.push("/auth/login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
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
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
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
          />

          <Select
            fullWidth
            name="role"
            value={formData.role}
            onChange={handleSelectChange}
            required
            sx={{ mt: 2 }}
          >
            {/* <MenuItem value="user">User</MenuItem> */}
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
            />
            <TextField
              fullWidth
              label="Organization Phone"
              name="organization_phone"
              value={formData.organization_phone}
              onChange={handleChange}
            />
          </Stack>

          <TextField
            fullWidth
            label="Organization Address"
            name="organization_address"
            value={formData.organization_address}
            onChange={handleChange}
            margin="normal"
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

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            ⚠️ {error}
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
