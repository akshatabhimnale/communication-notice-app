"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { loginThunk } from "@/store/slices/authSlice";
import { RootState } from "@/store";
import Link from "next/link";

import { Avatar, Button, Container, CssBaseline, Grid, TextField, Typography, Box } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch<any>();
  const router = useRouter();

  const { user, loading, error } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user) {
      router.push(user.role === "admin" ? "/admin" : "/user");
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginThunk({ dispatch, data: { username, password } }));
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Grid container justifyContent="center" alignItems="center" style={{ minHeight: "100vh" }}>
        <Box
          sx={{
            width: "100%",
            textAlign: "center",
          }}
        >
          <Avatar sx={{ bgcolor: "purple", mx: "auto", mb: 1 }}>
            <LockIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <form onSubmit={handleLogin} style={{ width: "100%", marginTop: "10px" }}>
            <TextField
              fullWidth
              margin="normal"
              label="Username"
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? "Signing in..." : "SIGN IN"}
            </Button>
            {error && <Typography color="error" sx={{ mt: 1 }}>⚠️ {error}</Typography>}
            <Grid container justifyContent="center" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <Link href="/auth/register" style={{ textDecoration: "none", color: "#1976D2", fontWeight: "bold" }}>
                  Don't have an account? <span style={{ color: "#1976D2" }}>Sign Up</span>
                </Link>
              </Typography>
            </Grid>
          </form>
        </Box>
      </Grid>
    </Container>
  );
}
