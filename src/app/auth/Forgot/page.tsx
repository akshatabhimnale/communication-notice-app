"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Stack,
  useTheme,
  Paper,
} from "@mui/material";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const theme = useTheme();
  const router = useRouter();

  // Simple email validation regex
  const validateEmail = (email: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");

    // TODO: Replace this with actual API call
    console.log("Sending verification link to:", email);
  };

  const handleCancel = () => {
    router.push("/auth/login");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        backgroundColor:
          theme.palette.mode === "dark"
            ? "background.default"
            : "#f5f5f5",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            p: 4,
            borderRadius: 3,
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.04)"
                : "#ffffff",
          }}
        >
          {/* Heading */}
          <Typography variant="h5" fontWeight="bold" textAlign="center" gutterBottom>
            Forgot Password?
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            mb={3}
          >
            Enter your email address and we will send you a link to reset your password.
          </Typography>

          {/* Form */}
          <Box component="form" onSubmit={handleSend}>
            <TextField
              fullWidth
              required
              type="email"
              label="Email"
              placeholder="Enter your email address"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={Boolean(error)}
              helperText={error}
            />

            {/* Buttons */}
            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              sx={{ mt: 4 }}
            >
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCancel}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                Send Verification Link
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
