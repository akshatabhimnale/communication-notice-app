"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchUsersThunk } from "@/store/slices/usersSlice";
import {
  createIndividualNotice,
  fetchNoticeTypesWithTransformedSchemas,
} from "@/services/noticeService";
import { TransformedNoticeType, SchemaField } from "@/types/noticeTypesInterface";
import { useSnackbar } from "notistack";
import { ClientAdminOnly } from "@/components/auth/ClientRoleGuard";
import { useRole } from "@/hooks/useRole";
import { useRouter } from "next/navigation";

// Utility function to decode JWT and get user ID
const getUserIdFromToken = (): string | null => {
  if (typeof window === "undefined") return null;

  try {
    const cookies = document.cookie.split(";");
    const tokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("accessToken=")
    );
    if (!tokenCookie) return null;

    const token = tokenCookie.split("=")[1];
    if (!token) return null;

    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = JSON.parse(atob(base64));

    return decodedPayload.user_id || null;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

// Controller for fetching notice types
const controller = {
  async getNoticeTypes(): Promise<TransformedNoticeType[]> {
    const all: TransformedNoticeType[] = [];
    let page = 1;
    let next: string | null = "";
    do {
      const res = await fetchNoticeTypesWithTransformedSchemas(page);
      all.push(...res.results);
      next = res.next;
      page += 1;
    } while (next);
    return all;
  },
};

const NoticeForm: React.FC = () => {
  const [noticeTypes, setNoticeTypes] = useState<TransformedNoticeType[]>([]);
  const [selectedNoticeType, setSelectedNoticeType] = useState("");
  const [dynamicData, setDynamicData] = useState<Record<string, string | number | boolean>>({});
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const dispatch = useAppDispatch();
  const users = useAppSelector((state) => state.users.users);
  const usersLoading = useAppSelector((state) => state.users.loading);
  const { enqueueSnackbar } = useSnackbar();
  const { userRole } = useRole();
  const router = useRouter();

  // Fetch notice types and users, and auto-set user ID for non-admin users
  useEffect(() => {
    // Fetch notice types for all users
    controller
      .getNoticeTypes()
      .then(setNoticeTypes)
      .catch(() =>
        enqueueSnackbar("Unable to fetch notice types. Please try again later.", {
          variant: "error",
        })
      );

    // Fetch users only for admin
    if (userRole === "admin") {
      dispatch(fetchUsersThunk(undefined)).unwrap().catch((error) => {
        enqueueSnackbar(`Failed to fetch users: ${error.message}`, { variant: "error" });
      });
    }

    // Set user ID for non-admin users
    if (userRole === "user") {
      const currentUserId = getUserIdFromToken();
      if (currentUserId) {
        setUserId(currentUserId);
        setIsAuthenticated(true);
      } else {
        enqueueSnackbar("Authentication failed. Please log in again.", { variant: "error" });
        router.push("/auth/login");
      }
    } else if (userRole === "admin") {
      setIsAuthenticated(true);
    }
  }, [dispatch, enqueueSnackbar, userRole, router]);

  // Reset dynamic data when notice type changes
  useEffect(() => {
    setDynamicData({});
    setErrors({});
  }, [selectedNoticeType]);

  // Handlers
  const handleNoticeTypeChange = (e: SelectChangeEvent<string>): void => {
    setSelectedNoticeType(e.target.value);
  };

  const handleDynamicFieldChange = (
    fieldName: string,
    value: string,
    fieldType: SchemaField["type"]
  ): void => {
    let parsedValue: string | number | boolean = value;

    if (fieldType === "number") {
      parsedValue = value ? parseFloat(value) : "";
    } else if (fieldType === "boolean") {
      parsedValue = value === "true";
    } else if (fieldType === "date") {
      parsedValue = value; // Keep as string, API expects YYYY-MM-DD
    }

    setDynamicData((prev) => ({ ...prev, [fieldName]: parsedValue }));

    // Validate field
    const schema = noticeTypes.find((t) => t.id === selectedNoticeType)?.dynamic_schema;
    if (schema && schema[fieldName].required && !value) {
      setErrors((prev) => ({ ...prev, [fieldName]: "This field is required" }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const resetForm = useCallback(() => {
    setSelectedNoticeType("");
    if (userRole === "admin") {
      setUserId("");
    }
    setDynamicData({});
    setErrors({});
  }, [userRole]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!selectedNoticeType) {
      enqueueSnackbar("Please select a notice type.", { variant: "error" });
      return;
    }

    let finalUserId = userId;
    if (userRole === "user") {
      finalUserId = getUserIdFromToken() || userId;
    }

    if (!finalUserId) {
      enqueueSnackbar(
        userRole === "admin"
          ? "Please select a user from the Created By dropdown."
          : "User authentication failed. Please log in again.",
        { variant: "error" }
      );
      if (userRole === "user") {
        router.push("/auth/login");
      }
      return;
    }

    // Validate required fields
    const schema = noticeTypes.find((t) => t.id === selectedNoticeType)?.dynamic_schema;
    const newErrors: Record<string, string> = {};
    if (schema) {
      Object.entries(schema).forEach(([fieldName, field]) => {
        if (field.required && !dynamicData[fieldName]) {
          newErrors[fieldName] = "This field is required";
        }
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      enqueueSnackbar("Please fill all required fields.", { variant: "error" });
      return;
    }

    setLoading(true);
    try {
      await createIndividualNotice(selectedNoticeType, dynamicData, finalUserId);
      enqueueSnackbar("Notice created successfully!", { variant: "success" });
      resetForm();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Get the dynamic schema for the selected notice type
  const selectedSchema = noticeTypes.find((t) => t.id === selectedNoticeType)?.dynamic_schema;

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Authenticating...
          </Typography>
          <CircularProgress />
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Create Notice
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Notice Type Dropdown */}
          <FormControl fullWidth required>
            <InputLabel id="notice-type-label">Notice Type</InputLabel>
            <Select
              labelId="notice-type-label"
              value={selectedNoticeType}
              onChange={handleNoticeTypeChange}
              disabled={loading}
            >
              {noticeTypes.map((nt) => (
                <MenuItem key={nt.id} value={nt.id}>
                  {nt.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Created By Dropdown (Admin Only) */}
          <ClientAdminOnly>
            <FormControl fullWidth required>
              <InputLabel id="created-by-label">Created By</InputLabel>
              <Select
                labelId="created-by-label"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                disabled={loading || usersLoading}
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </ClientAdminOnly>

          {/* Display User ID for Non-Admin */}
          {userRole === "user" && userId && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              Created By: {users.find((u) => u.id === userId)?.username || "Current User"}
            </Typography>
          )}

          {/* Dynamic Fields */}
          {selectedSchema &&
            Object.entries(selectedSchema).map(([fieldName, field]) => (
              <TextField
                key={fieldName}
                label={`${field.label}${field.required ? " *" : ""}`}
                value={dynamicData[fieldName] || ""}
                onChange={(e) => handleDynamicFieldChange(fieldName, e.target.value, field.type)}
                error={!!errors[fieldName]}
                helperText={errors[fieldName]}
                type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                required={field.required}
                disabled={loading}
                fullWidth
              />
            ))}

          {/* Action Buttons */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button variant="outlined" onClick={resetForm} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                loading ||
                !selectedNoticeType ||
                (userRole === "admin" && !userId) ||
                Object.keys(errors).length > 0
              }
              startIcon={loading ? <CircularProgress size={20} /> : undefined}
            >
              Create Notice
            </Button>
          </Box>

          {selectedSchema && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
              Required fields are marked with an asterisk (*)
            </Typography>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default NoticeForm;