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
import {
  fetchUserProfile,
  updateCurrentUserProfile,
} from "@/services/userService";
import { styles } from "./profileStyles";
import { ProfileSkeleton } from "./ProfileSkeleton";
import { useSnackbar } from "notistack";

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
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

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
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        enqueueSnackbar(errorMessage, { 
          variant: "error", 
          autoHideDuration: 3000 
        });
        if (errorMessage.includes("Please log in again")) {
          setTimeout(() => router.push("/auth/login"), 1500);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [enqueueSnackbar, router]);

  const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return null;
  };

  const validatePhone = (phone: string): string | null => {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (phone && !phoneRegex.test(phone)) 
      return "Please enter a valid phone number (minimum 10 digits)";
    return null;
  };

  const validateUsername = (username: string): string | null => {
    if (!username.trim()) return "Username is required";
    return null;
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
    setValidationErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate on change
    let error: string | null = null;
    if (name === "email") {
      error = validateEmail(value);
    } else if (name === "phone") {
      error = validatePhone(value);
    } else if (name === "username") {
      error = validateUsername(value);
    }

    setValidationErrors((prev) => ({
      ...prev,
      [name]: error || "",
    }));
  };

  const handleUpdate = async () => {
    if (!profile) return;

    // Validate before submission
    const usernameError = validateUsername(formData.username);
    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.phone);

    const newErrors: Record<string, string> = {};
    if (usernameError) newErrors.username = usernameError;
    if (emailError) newErrors.email = emailError;
    if (phoneError) newErrors.phone = phoneError;

    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors);
      Object.values(newErrors).forEach((error) => {
        enqueueSnackbar(error, { variant: "error", autoHideDuration: 3000 });
      });
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
      setValidationErrors({});
      enqueueSnackbar("Profile updated successfully", { 
        variant: "success", 
        autoHideDuration: 3000 
      });
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null) {
        const errors = err as Record<string, string[]>;
        if (Object.keys(errors).length > 0) {
          const newValidationErrors: Record<string, string> = {};
          Object.entries(errors).forEach(([field, messages]) => {
            newValidationErrors[field] = messages.join(", ");
            messages.forEach((message) =>
              enqueueSnackbar(message, { variant: "error", autoHideDuration: 3000 })
            );
          });
          setValidationErrors(newValidationErrors);
        } else {
          const errorMessage = "Failed to update profile";
          enqueueSnackbar(errorMessage, { variant: "error", autoHideDuration: 3000 });
        }
      } else {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update profile";
        enqueueSnackbar(errorMessage, { variant: "error", autoHideDuration: 3000 });
      }
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

        <Avatar
          sx={{
            width: 100,
            height: 100,
            bgcolor: "secondary.main",
            fontSize: 40,
          }}
        >
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
                    error={!!validationErrors.username}
                    helperText={validationErrors.username}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    fullWidth
                    variant="outlined"
                    type="email"
                    error={!!validationErrors.email}
                    helperText={validationErrors.email}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    fullWidth
                    variant="outlined"
                    error={!!validationErrors.phone}
                    helperText={validationErrors.phone || "Optional"}
                    sx={{ mb: 2 }}
                  />
                  <Box sx={styles.buttonGroup}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleUpdate}
                      disabled={isSaving || !!validationErrors.username || !!validationErrors.email || !!validationErrors.phone}
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={handleEditToggle}
                    >
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
          <Button
            variant="outlined"
            color="primary"
            onClick={handleEditToggle}
            sx={{ mt: 4 }}
          >
            Edit Profile
          </Button>
        )}
      </Box>
    </Container>
  );
}