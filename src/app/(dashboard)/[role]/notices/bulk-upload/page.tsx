
"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  Chip,
} from "@mui/material";
import {
  bulkUploadFile,
  createIndividualNotice,
  fetchNoticeTypesWithTransformedSchemas,
} from "@/services/noticeService";
import { fetchUserProfile } from "@/services/userService";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchUsersThunk } from "@/store/slices/usersSlice";
import {
  PaginatedResponse,
  TransformedNoticeType,
} from "@/types/noticeTypesInterface";
import { useSnackbar } from "notistack";
import { ClientAdminOnly } from "@/components/auth/ClientRoleGuard";
import { useRole } from "@/hooks/useRole";
import { useRouter } from "next/navigation";
import useBatchNameCheck from "@/hooks/useBatchNameCheck";

// ---------- helpers ---------------------------------------------------------

type FileValidation =
  | { ok: true; file: File }
  | { ok: false; error: string };

const ACCEPTED_MIME_TYPES = new Set([
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
]);

const ACCEPTED_EXTENSIONS = [".csv", ".xls", ".xlsx"];

const validateFile = (file?: File | null): FileValidation => {
  if (!file) return { ok: false, error: "No file selected." };

  const { type, name } = file;

  const hasValidMime = ACCEPTED_MIME_TYPES.has(type);
  const hasValidExtension = ACCEPTED_EXTENSIONS.some((ext) =>
    name.toLowerCase().endsWith(ext),
  );

  if (!hasValidMime && !hasValidExtension) {
    return {
      ok: false,
      error: "Invalid file type. Please choose a .csv, .xls, or .xlsx file.",
    };
  }

  return { ok: true, file };
};

/**
 * Consolidates every side-effect (network, retry, pagination)
 * in one object so UI remains declarative.
 */
const controller = {
  async getNoticeTypes(): Promise<TransformedNoticeType[]> {
    const all: TransformedNoticeType[] = [];
    let page = 1;
    let next: string | null = "";
    do {
      const res: Omit<PaginatedResponse, "results"> & {
        results: TransformedNoticeType[];
      } = await fetchNoticeTypesWithTransformedSchemas(page);
      all.push(...res.results);
      next = res.next;
      page += 1;
    } while (next);
    return all;
  },
};

// ---------- component -------------------------------------------------------

const BulkUpload: React.FC = () => {
  const [noticeTypes, setNoticeTypes] = useState<TransformedNoticeType[]>([]);
  const [selectedNoticeType, setSelectedNoticeType] = useState("");
  const [validatedFile, setValidatedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [batchName, setBatchName] = useState("");

  const dispatch = useAppDispatch();
  const users = useAppSelector((state) => state.users.users);
  const usersLoading = useAppSelector((state) => state.users.loading);
  const { enqueueSnackbar } = useSnackbar();
  const { userRole } = useRole();
  const router = useRouter();

  // Batch name validation hook
  const {
    isChecking: isBatchNameChecking,
    result: batchNameResult,
    error: batchNameError,
    checkBatchName,
    clearResult: clearBatchNameResult,
  } = useBatchNameCheck(500);

  // Debug effect to log batch name results
  useEffect(() => {
    if (batchNameResult) {
      console.log("🔍 UI - Batch name result:", {
        batchName,
        available: batchNameResult.available,
        message: batchNameResult.message,
        suggestions: batchNameResult.suggestions
      });
    }
  }, [batchNameResult, batchName]);

  // ---------- side-effects --------------------------------------------------
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
        enqueueSnackbar(`Failed to fetch users: ${error.message}`, {
          variant: "error",
        });
      });
    }

    // Set user ID and username for non-admin users
    if (userRole === "user") {
      fetchUserProfile()
        .then((profile) => {
          if (profile.id) {
            setUserId(profile.id);
            setUsername(profile.username || "Current User");
            setIsAuthenticated(true);
          } else {
            enqueueSnackbar("Authentication failed: No user ID found. Please log in again.", {
              variant: "error",
            });
            router.push("/auth/login");
          }
        })
        .catch((error) => {
          enqueueSnackbar(`Authentication error: ${error.message}`, {
            variant: "error",
          });
          router.push("/auth/login");
        });
    } else if (userRole === "admin") {
      setIsAuthenticated(true);
    }
  }, [dispatch, enqueueSnackbar, userRole, router]);

  // ---------- handlers ------------------------------------------------------
  const resetForm = useCallback(() => {
    setSelectedNoticeType("");
    setBatchName("");
    clearBatchNameResult();
    if (userRole === "admin") {
      setUserId("");
    }
    setValidatedFile(null);
    // Clear the hidden input
    const input = document.getElementById("file-upload") as HTMLInputElement;
    if (input) input.value = "";
  }, [userRole, clearBatchNameResult]);

  const handleBatchNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setBatchName(value);
    checkBatchName(value);
  }, [checkBatchName]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setBatchName(suggestion);
    checkBatchName(suggestion);
  }, [checkBatchName]);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = e.target.files?.[0] || null;

    const validation = validateFile(file);
    if (!validation.ok) {
      enqueueSnackbar(validation.error, { variant: "error" });
      setValidatedFile(null);
      return;
    }

    setValidatedFile(validation.file);
  };

  const handleNoticeTypeChange = (e: SelectChangeEvent<string>): void => {
    setSelectedNoticeType(e.target.value);
  };

  const handleUpload = async (): Promise<void> => {
    if (!selectedNoticeType) {
      enqueueSnackbar("Please select a notice type.", { variant: "error" });
      return;
    }
    if (!validatedFile) {
      enqueueSnackbar("Please add a valid file before uploading.", {
        variant: "error",
      });
      return;
    }
    if (!batchName.trim()) {
      enqueueSnackbar("Please enter a batch name.", { variant: "error" });
      return;
    }
    if (batchNameResult && !batchNameResult.available) {
      enqueueSnackbar("Please choose an available batch name or use one of the suggestions.", { variant: "error" });
      return;
    }

    let finalUserId = userId;
    if (userRole === "user") {
      const profile = await fetchUserProfile().catch(() => null);
      finalUserId = profile?.id || userId;
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

    setLoading(true);
    try {
      // Step 1: Upload file and get dynamic data
      const bulkUploadResponse = await bulkUploadFile(
        validatedFile,
        selectedNoticeType,
      );

      console.warn("Bulk upload response:", bulkUploadResponse);
      if (!bulkUploadResponse.success) {
        throw new Error("Failed to process the uploaded file");
      }

      const dynamicDataArray = bulkUploadResponse.data[0]?.dynamic_data;

      console.log("Dynamic data array:", dynamicDataArray);
      console.log("First item structure:", dynamicDataArray?.[0]);

      if (!dynamicDataArray || dynamicDataArray.length === 0) {
        throw new Error("No valid data found in the uploaded file");
      }

      // Step 2: Create notices one by one
      let createdCount = 0;
      let failedCount = 0;
      const failedErrors: string[] = [];

      for (let i = 0; i < dynamicDataArray.length; i++) {
        try {
          console.log(`Creating notice ${i + 1} with data:`, dynamicDataArray[i]);
          await createIndividualNotice(
            selectedNoticeType,
            dynamicDataArray[i],
            finalUserId,
            batchName
          );
          createdCount++;
        } catch (error) {
          failedCount++;
          const errorMsg = error instanceof Error ? error.message : "Unknown error";
          console.error(`Failed to create notice ${i + 1}:`, errorMsg);
          failedErrors.push(`Row ${i + 1}: ${errorMsg}`);
        }
      }

      // Show results
      if (createdCount > 0) {
        const successMessage = `Successfully created ${createdCount} notices.`;
        const failureMessage =
          failedCount > 0
            ? ` ${failedCount} failed: ${failedErrors
                .slice(0, 3)
                .join("; ")}${failedErrors.length > 3 ? "..." : ""}`
            : "";

        enqueueSnackbar(successMessage + failureMessage, {
          variant: createdCount > failedCount ? "success" : "warning",
          autoHideDuration: 5000,
        });

        if (failedCount === 0) {
          resetForm();
        }
      } else {
        enqueueSnackbar(
          `All ${failedCount} notices failed to create: ${failedErrors
            .slice(0, 2)
            .join("; ")}`,
          {
            variant: "error",
            autoHideDuration: 5000,
          },
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred during upload.";
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  // ---------- memoised values ----------------------------------------------

  const selectedSchema = useMemo(
    () => noticeTypes.find((t) => t.id === selectedNoticeType)?.dynamic_schema,
    [noticeTypes, selectedNoticeType],
  );

  // ---------- render --------------------------------------------------------

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
          Bulk Notice Upload
        </Typography>
        {/* -----------------Notice Type dropdown---------------- */}
        <FormControl fullWidth sx={{ mb: 2 }} required>
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
        {/* -----------------Username dropdown (admin only)---------------- */}
        <ClientAdminOnly>
          <FormControl fullWidth sx={{ mb: 2 }} required>
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

        {/* -----------------Batch Name Input---------------- */}
        <FormControl fullWidth sx={{ mb: 2 }} required>
          <TextField
            label="Batch Name"
            value={batchName}
            onChange={handleBatchNameChange}
            disabled={loading}
            error={!!batchNameError || (batchNameResult?.available === false)}
            helperText={
              batchNameError ? (
                batchNameError
              ) : isBatchNameChecking ? (
                "Checking availability..."
              ) : batchNameResult?.available ? (
                <Typography component="span" color="success.main">
                  ✓ Batch name is available
                </Typography>
              ) : batchNameResult && !batchNameResult.available ? (
                batchNameResult.message || "Batch name is already taken"
              ) : (
                "Enter a unique batch name for this upload"
              )
            }
            InputProps={{
              endAdornment: isBatchNameChecking ? (
                <CircularProgress size={20} />
              ) : undefined,
            }}
          />
          
          {/* Suggestions */}
          {batchNameResult && !batchNameResult.available && batchNameResult.suggestions && batchNameResult.suggestions.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Suggested available names:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {batchNameResult.suggestions.map((suggestion, index) => (
                  <Chip
                    key={index}
                    label={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    clickable
                    size="small"
                    variant="outlined"
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </FormControl>

        {/* -----------------Display username for non-admin---------------- */}
        {userRole === "user" && userId && (
          <Typography variant="body2" sx={{ mb: 2 }}>
            Created By: {username}
          </Typography>
        )}


        {/* Drag-and-Drop area doubles as file input label */}
        <Box
          sx={{
            border: "2px dashed",
            borderColor: "divider",
            borderRadius: 2,
            p: 3,
            mb: 2,
            textAlign: "center",
            cursor: "pointer",
            "&:hover": { backgroundColor: "action.hover" },
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const droppedFile = e.dataTransfer.files?.[0] || null;
            handleFileChange({
              target: { files: droppedFile ? [droppedFile] : null },
            } as unknown as React.ChangeEvent<HTMLInputElement>);
          }}
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <Typography variant="body2">
            {validatedFile
              ? `Selected file: ${validatedFile.name}`
              : "Drag & drop your .csv, .xls, or .xlsx file here, or click to browse"}
          </Typography>
        </Box>

        {/* Hidden native input to preserve accessibility */}
        <TextField
          id="file-upload"
          type="file"
          sx={{ display: "none" }}
          inputProps={{ accept: ".csv,.xls,.xlsx" }}
          onChange={handleFileChange}
          disabled={loading}
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button variant="outlined" onClick={resetForm} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={
              loading ||
              !validatedFile ||
              !selectedNoticeType ||
              !batchName.trim() ||
              isBatchNameChecking ||
              (batchNameResult?.available === false) ||
              (userRole === "admin" && !userId)
            }
            startIcon={loading ? <CircularProgress size={20} /> : undefined}
          >
            Upload &amp; Create Notices
          </Button>
        </Box>

        {selectedSchema && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
            Expected Columns: {Object.keys(selectedSchema).join(", ")}
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default BulkUpload;