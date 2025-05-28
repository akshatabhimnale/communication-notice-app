// BulkUpload.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
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
import {
  bulkCreateNotices,
  fetchNoticeTypesWithTransformedSchemas,
  uploadSchemaFromCsv,
} from "@/services/noticeService";
import { fetchUserProfile } from "@/services/userService";
import {
  PaginatedResponse,
  TransformedNoticeType,
} from "@/types/noticeTypesInterface";

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

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

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

  async getUserId(retries = 3, delay = 1000): Promise<string> {
    for (let attempt = 1; attempt <= retries; attempt += 1) {
      try {
        const profile = await fetchUserProfile();
        return profile.id;
      } catch (error) {
        if (attempt === retries) throw error;
        await sleep(delay);
      }
    }
    // never reached, keeps TypeScript happy
    throw new Error("Unreachable");
  },
};

// ---------- ui helpers ------------------------------------------------------

interface BannerProps {
  severity: "error" | "success";
  message: string;
}

const Banner: React.FC<BannerProps> = ({ severity, message }) => (
  <Alert severity={severity} sx={{ mb: 2 }}>
    {message}
  </Alert>
);

// ---------- component -------------------------------------------------------

const BulkUpload: React.FC = () => {
  const [noticeTypes, setNoticeTypes] = useState<TransformedNoticeType[]>([]);
  const [selectedNoticeType, setSelectedNoticeType] = useState("");
  const [validatedFile, setValidatedFile] = useState<File | null>(null);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");

  // ---------- side-effects --------------------------------------------------

  useEffect(() => {
    controller
      .getNoticeTypes()
      .then(setNoticeTypes)
      .catch(() =>
        setErrorMsg("Unable to fetch notice types. Please try again later."),
      );

    controller
      .getUserId()
      .then(setUserId)
      .catch(() =>
        setErrorMsg(
          "Unable to fetch user profile after multiple attempts. Check your network connection and retry.",
        ),
      );
  }, []);

  // ---------- handlers ------------------------------------------------------

  const resetForm = useCallback(() => {
    setSelectedNoticeType("");
    setValidatedFile(null);
    setSuccessMsg("");
    setErrorMsg("");
    // Clear the hidden input
    const input = document.getElementById("file-upload") as HTMLInputElement;
    if (input) input.value = "";
  }, []);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = e.target.files?.[0] || null;

    const validation = validateFile(file);
    if (!validation.ok) {
      setErrorMsg(validation.error);
      setValidatedFile(null);
      return;
    }

    try {
      const schema = await uploadSchemaFromCsv(validation.file);
      if (!schema || Object.keys(schema).length === 0) {
        setErrorMsg("The file headers do not match any recognised schema.");
        setValidatedFile(null);
        return;
      }
      setValidatedFile(validation.file);
      setErrorMsg("");
    } catch {
      setErrorMsg(
        "File-schema validation failed. Ensure the CSV / Excel file has the correct headers.",
      );
      setValidatedFile(null);
    }
  };

  const handleNoticeTypeChange = (e: SelectChangeEvent<string>): void => {
    setSelectedNoticeType(e.target.value);
    setErrorMsg("");
  };

  const handleUpload = async (): Promise<void> => {
    if (!selectedNoticeType) {
      setErrorMsg("Please select a notice type.");
      return;
    }
    if (!validatedFile) {
      setErrorMsg("Please add a valid file before uploading.");
      return;
    }
    if (!userId) {
      setErrorMsg("User profile not loaded. Please refresh the page.");
      return;
    }

    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const type = noticeTypes.find((t) => t.id === selectedNoticeType);
      if (!type) throw new Error("Selected notice type is no longer valid.");

      const res = await bulkCreateNotices(
        validatedFile,
        selectedNoticeType,
        userId,
        type.dynamic_schema,
      );

      if (res.success) {
        const { created, failed } = res.data;
        const createdCount = created.length;
        const failedMsg =
          failed.length > 0
            ? ` Some rows failed: ${failed
                .map((f) => `Row ${f.row}: ${f.error}`)
                .join("; ")}`
            : "";
        setSuccessMsg(`Successfully created ${createdCount} notices.${failedMsg}`);
        resetForm();
      } else {
        setErrorMsg(
          `Upload completed with errors: ${res.data.failed
            .map((f) => `Row ${f.row}: ${f.error}`)
            .join("; ")}`,
        );
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during upload.",
      );
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

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Bulk Notice Upload
        </Typography>

        {errorMsg && <Banner severity="error" message={errorMsg} />}
        {successMsg && <Banner severity="success" message={successMsg} />}

        <FormControl fullWidth sx={{ mb: 2 }} required>
          <InputLabel id="notice-type-label">Notice Type</InputLabel>
          <Select
            labelId="notice-type-label"
            value={selectedNoticeType}
            label="Notice Type"
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
          onClick={() =>
            document.getElementById("file-upload")?.click()
          }
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
              loading || !validatedFile || !selectedNoticeType || !userId
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
