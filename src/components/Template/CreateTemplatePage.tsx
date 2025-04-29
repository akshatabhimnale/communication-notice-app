"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchNoticeTypes } from "@/services/noticeService";
import { submitTemplate, TemplateInput } from "@/services/templateServices";
import { PaginatedResponse, NoticeType } from "@/types/noticeTypesInterface";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  Paper,
} from "@mui/material";
import Mammoth from "mammoth";

const CreateTemplatePage: React.FC = () => {
  const router = useRouter();
  const [channel, setChannel] = useState<string>("");
  const [noticeType, setNoticeType] = useState<string>("");
  const [templateContent, setTemplateContent] = useState<string>("");
  const [noticeTypes, setNoticeTypes] = useState<NoticeType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch all notice types across all pages
  useEffect(() => {
    const loadAllNoticeTypes = async () => {
      try {
        let allNoticeTypes: NoticeType[] = [];
        let nextUrl: string | null = "/notice-types/?page=1";

        while (nextUrl) {
          const page = nextUrl.includes("page=")
            ? parseInt(nextUrl.split("page=")[1])
            : 1;
          const response: PaginatedResponse = await fetchNoticeTypes(page);
          allNoticeTypes = [...allNoticeTypes, ...response.results];
          nextUrl = response.next;
        }

        setNoticeTypes(allNoticeTypes);
      } catch (err) {
        setError("Failed to load notice types.");
        console.error(err);
      }
    };
    loadAllNoticeTypes();
  }, []);

  // Handle file upload for .html and .docx
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileType = file.type;
    try {
      if (fileType === "text/html") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setTemplateContent(content);
        };
        reader.readAsText(file);
      } else if (
        fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await Mammoth.convertToHtml({ arrayBuffer });
        // Wrap the HTML in a full document structure for proper rendering
        const fullHtml = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Preview</title>
          </head>
          <body>
            ${result.value}
          </body>
          </html>
        `;
        setTemplateContent(fullHtml);
      } else {
        setError("Unsupported file type. Please upload an HTML or DOCX file.");
      }
    } catch (err) {
      setError("Failed to process the uploaded file.");
      console.error(err);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!channel) {
      setError("Please select a channel.");
      setIsLoading(false);
      return;
    }

    if (!noticeType) {
      setError("Please select a notice type.");
      setIsLoading(false);
      return;
    }

    if (!templateContent.trim()) {
      setError("Template content is required.");
      setIsLoading(false);
      return;
    }

    const templateData: TemplateInput = {
      channel,
      notice_type: noticeType,
      template_content: templateContent,
    };

    try {
      await submitTemplate(templateData);
      router.push("/admin/templates");
    } catch (err) {
      setError("Failed to create template. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Create Template
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Channel Dropdown */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel id="channel-label">Channel</InputLabel>
              <Select
                labelId="channel-label"
                id="channel"
                value={channel}
                label="Channel"
                onChange={(e) => setChannel(e.target.value as string)}
              >
                <MenuItem value="">Select a channel</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="whatsapp">WhatsApp</MenuItem>
                <MenuItem value="sms">SMS</MenuItem>
                <MenuItem value="rpad">RPAD</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Notice Type Dropdown */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel id="notice-type-label">Notice Type</InputLabel>
              <Select
                labelId="notice-type-label"
                id="noticeType"
                value={noticeType}
                label="Notice Type"
                onChange={(e) => setNoticeType(e.target.value as string)}
              >
                <MenuItem value="">Select a notice type</MenuItem>
                {noticeTypes.length === 0 ? (
                  <MenuItem value="" disabled>
                    No notice types available
                  </MenuItem>
                ) : (
                  noticeTypes.map((nt) => (
                    <MenuItem key={nt.id} value={nt.id}>
                      {nt.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>

          {/* Template Content Section */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {/* Left: Textbox and File Upload */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: "100%" }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Template Content
                  </Typography>
                  <TextField
                    id="templateContent"
                    label="Enter HTML content"
                    multiline
                    rows={10}
                    value={templateContent}
                    onChange={(e) => setTemplateContent(e.target.value)}
                    fullWidth
                    required
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                  <input
                    type="file"
                    accept=".html,.docx"
                    onChange={handleFileUpload}
                    style={{ display: "block", marginBottom: "8px" }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Upload HTML or DOCX files only.
                  </Typography>
                </Paper>
              </Grid>

              {/* Right: Preview */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: "100%" }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Preview
                  </Typography>
                  <Box
                    sx={{
                      border: "1px solid",
                      borderColor: "grey.300",
                      borderRadius: 1,
                      height: "calc(10 * 1.5em + 32px)", // Match TextField height
                      overflow: "auto",
                    }}
                  >
                    {templateContent ? (
                      <iframe
                        srcDoc={templateContent}
                        style={{ width: "100%", height: "100%", border: "none" }}
                        title="Template Preview"
                        sandbox="allow-same-origin"
                      />
                    ) : (
                      <Typography sx={{ p: 2, color: "grey.500" }}>
                        No content to preview.
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? "Creating..." : "Create Template"}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default CreateTemplatePage;