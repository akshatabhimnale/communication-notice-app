"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { updateNoticeThunk } from "@/store/slices/noticeSlice";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useSnackbar } from "notistack";
import noticeApiClient from "@/services/apiClients/noticeApiClient";
import { getTokenFromCookie } from "@/services/userService";
import { Notice } from "@/types/noticeTypesInterface";

interface ApiResponse {
  success: boolean;
  data: Notice;
  errors: Record<string, string[]>;
  meta: Record<string, string | number | boolean>;
}

export default function EditNoticePage() {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dynamicData, setDynamicData] = useState<Record<string, string | number | boolean>>({});

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const token = getTokenFromCookie();
        if (!token) throw new Error("No authentication token found.");

        console.log(`Fetching notice with ID: ${id}`);
        const response = await noticeApiClient.get<ApiResponse>(`/notices/${id}/`, {
          headers: { Authorization: `Basic ${token}` },
        });
        console.log("API Response:", response.data);

        const fetchedNotice = response.data.data;
        if (!fetchedNotice.dynamic_data) {
          console.warn("No dynamic_data in response:", fetchedNotice);
          fetchedNotice.dynamic_data = {};
        }

        setNotice(fetchedNotice);
        setDynamicData(fetchedNotice.dynamic_data || {});
      } catch (error) {
        enqueueSnackbar("Failed to fetch notice details.", { variant: "error" });
        console.error("Error fetching notice:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotice();
  }, [id, enqueueSnackbar]);

  const handleDynamicFieldChange = (
    fieldName: string,
    value: string
  ) => {
    const parsedValue: string | number | boolean = value;
    setDynamicData((prev) => ({ ...prev, [fieldName]: parsedValue }));

    if (notice?.dynamic_data && fieldName in notice.dynamic_data && !value) {
      setErrors((prev) => ({ ...prev, [fieldName]: "This field is required" }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notice) return;

    const newErrors: Record<string, string> = {};
    if (notice.dynamic_data) {
      Object.keys(notice.dynamic_data).forEach((fieldName) => {
        if (notice.dynamic_data && fieldName in notice.dynamic_data && !dynamicData[fieldName]) {
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
      const updatedNotice: Notice = {
        id: notice.id as string,
        notice_type: notice.notice_type,
        dynamic_data: dynamicData,
        created_by: notice.created_by,
        status: notice.status,
        priority: notice.priority,
      };
      await dispatch(updateNoticeThunk({ id: notice.id as string, data: updatedNotice })).unwrap();
      enqueueSnackbar("Notice updated successfully!", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Failed to update notice.", { variant: "error" });
      console.error("Update error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/notices");
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (!notice) return <Typography>Notice not found.</Typography>;

  console.log("Rendered Notice:", notice);
  console.log("Rendered Dynamic Data:", dynamicData);

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Edit Notice - {notice.id}
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
        <FormControl fullWidth disabled>
          <InputLabel id="notice-type-label">Notice Type</InputLabel>
          <Select
            labelId="notice-type-label"
            value={notice.notice_type || ""}
            disabled
          >
            <MenuItem value={notice.notice_type || ""}>{notice.notice_type || "N/A"}</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth disabled>
          <InputLabel id="created-by-label">Created By</InputLabel>
          <Select
            labelId="created-by-label"
            value={notice.created_by || ""}
            disabled
          >
            <MenuItem value={notice.created_by || ""}>{notice.created_by || "N/A"}</MenuItem>
          </Select>
        </FormControl>

        {notice.dynamic_data &&
          Object.keys(notice.dynamic_data).map((fieldName) => (
            <TextField
              key={fieldName}
              label={fieldName}
              value={dynamicData[fieldName] || ""}
              onChange={(e) => handleDynamicFieldChange(fieldName, e.target.value)}
              error={!!errors[fieldName]}
              helperText={errors[fieldName]}
              type="text"
              required={!!notice.dynamic_data && fieldName in notice.dynamic_data}
              disabled={loading}
              fullWidth
            />
          ))}

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleCancel} // Use onClick with handleCancel
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || Object.keys(errors).length > 0}
            startIcon={loading ? <CircularProgress size={20} /> : undefined}
          >
            Update Notice
          </Button>
        </Box>

        {notice.dynamic_data && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
            Required fields are marked with an asterisk (*)
          </Typography>
        )}
      </Box>
    </Container>
  );
}
