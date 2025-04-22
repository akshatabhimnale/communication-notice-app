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
  TextField,
} from "@mui/material";
import { fetchUserProfile, updateCurrentUserProfile } from "@/services/userService";
import { styles } from "./profileStyles"; 
import { ProfileSkeleton } from "./ProfileSkeleton"; 

interface UserProfile {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  organization: {
    id: string;
    name: string;
    address: string;
    phone: string;
    created_at: string;
  };
  organization_id: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "", phone: "" });
  const [updateError, setUpdateError] = useState<string | null>(null);
  // New state for save operation
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const userProfile = await fetchUserProfile();
        setProfile(userProfile);
        setFormData({
          username: userProfile.username,
          email: userProfile.email,
          phone: userProfile.phone || "",
        });
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

    // Removed router from dependencies as it doesn't change
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]); // Empty dependency array

  const handleEditToggle = () => {
    setEditMode(!editMode);
    setUpdateError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear update error when user starts typing
    setUpdateError(null);
  };

  // Basic email validation regex
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleUpdate = async () => {
    if (!profile) return;

    // Validate inputs
    if (!formData.username.trim()) {
      setUpdateError("Username is required");
      return;
    }
    if (!formData.email.trim()) {
      setUpdateError("Email is required");
      return;
    }
    if (!isValidEmail(formData.email)) {
      setUpdateError("Please enter a valid email address");
      return;
    }

    setIsSaving(true);
    try {
      const updates = {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
      };
      const updatedProfile = await updateCurrentUserProfile(profile, updates);
      setProfile(updatedProfile);
      setEditMode(false);
      setUpdateError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile";
      setUpdateError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error || !profile) {
    return (
      <Container maxWidth="sm">
        <Typography color="error">{error || "Profile not found"}</Typography>
        {!error?.includes("Redirecting") && (
          <Button
            variant="outlined"
            color="primary"
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
    <Container maxWidth="sm">
      <CssBaseline />
      <Box sx={styles.root}>
        <Typography component="h1" variant="h4" gutterBottom>
          User Profile
        </Typography>

        <Avatar sx={{ width: 100, height: 100, bgcolor: "secondary.main", fontSize: 40 }}>
          {initials || "N/A"}
        </Avatar>

        <Typography component="h2" variant="h5" fontWeight="bold" gutterBottom>
          {fullName}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {roleDisplay}
        </Typography>

        <Card sx={styles.card}>
          <CardContent>
            <Box sx={styles.fieldContainer}>
              {editMode ? (
                <>
                  <TextField
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    fullWidth
                    variant="outlined"
                    error={!!updateError && updateError.includes("Username")}
                  />
                  <TextField
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    fullWidth
                    variant="outlined"
                    type="email"
                    error={!!updateError && updateError.includes("Email")}
                  />
                  <TextField
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    fullWidth
                    variant="outlined"
                  />
                  {updateError && (
                    <Typography color="error" variant="body2">
                      {updateError}
                    </Typography>
                  )}
                  <Box sx={styles.buttonGroup}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleUpdate}
                      disabled={isSaving} // Disable button while saving
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={handleEditToggle}>
                      Cancel
                    </Button>
                  </Box>
                </>
              ) : (
                <>
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
                </>
              )}
            </Box>
          </CardContent>
        </Card>

        {!editMode && (
          <Button variant="outlined" color="primary" onClick={handleEditToggle} sx={{ mt: 4 }}>
            Edit Profile
          </Button>
        )}
      </Box>
    </Container>
  );
}