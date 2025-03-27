"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  CssBaseline,
  Typography,
} from "@mui/material";
import { fetchUserProfile } from "@/services/userService";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  organization: {
    id: number;
    name: string;
    address: string;
    phone: string;
    created_at: string;
  };
  organization_id: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const userProfile = await fetchUserProfile();
        setProfile(userProfile);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        if (errorMessage.includes("Please log in again")) {
          setTimeout(() => router.push("/auth/login"), 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  if (loading) {
    return (
      <Container component="main" maxWidth="sm">
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error || !profile) {
    return (
      <Container component="main" maxWidth="sm">
        <Typography color="error">{error || "Profile not found"}</Typography>
        {!error?.includes("Redirecting") && (
          <Button
            variant="outlined"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => router.push("/auth/login")}
          >
            Go to Login
          </Button>
        )}
      </Container>
    );
  }

  const fullName = `${profile.first_name} ${profile.last_name}`;
  const initials = `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`;
  const roleDisplay = profile.role
    ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
    : "Unknown";

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h4" sx={{ mb: 4 }}>
          User Profile
        </Typography>

        <Avatar
          sx={{
            width: 100,
            height: 100,
            bgcolor: "secondary.main",
            fontSize: 40,
            mb: 2,
          }}
        >
          {initials || "N/A"}
        </Avatar>

        <Typography component="h2" variant="h5" sx={{ fontWeight: "bold" }}>
          {fullName}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          {roleDisplay}
        </Typography>

        <Card sx={{ width: "100%", maxWidth: 400 }}>
          <CardContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Username
                </Typography>
                <Typography variant="body1">{profile.username}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{profile.email}</Typography>
              </Box>
              {profile.phone && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body1">{profile.phone}</Typography>
                </Box>
              )}
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Organization
                </Typography>
                <Typography variant="body1">
                  {profile.organization?.name || "Not specified"}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Button
          variant="outlined"
          color="primary"
          sx={{ mt: 3 }}
          onClick={() => alert("Edit functionality coming soon!")}
        >
          Edit Profile
        </Button>
      </Box>
    </Container>
  );
}