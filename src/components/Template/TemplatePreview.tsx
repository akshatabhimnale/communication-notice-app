"use client";

import React, { useState } from "react";
import { useSnackbar } from "notistack";
import Mammoth from "mammoth";
import {
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const TemplatePreview: React.FC = () => {
  const [templateContent, setTemplateContent] = useState<string>("");
  const [previewContent, setPreviewContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();

  // Function to check if content is valid HTML
  const isValidHtml = (content: string): boolean => {
    const trimmedContent = content.trim();
    return (
      trimmedContent.startsWith("<!DOCTYPE html>") ||
      trimmedContent.includes("<html") ||
      trimmedContent.includes("<body")
    );
  };

  // Handle file upload for .html and .docx
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const fileType = file.type;
    try {
      if (fileType === "text/html") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setTemplateContent(content);
          setPreviewContent(content); // Update preview for file uploads
          setIsLoading(false);
        };
        reader.readAsText(file);
      } else if (
        fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const arrayBuffer = await file.arrayBuffer();

        // Extract raw text using Mammoth's text extraction
        const textResult = await Mammoth.extractRawText({ arrayBuffer });
        const rawText = textResult.value.trim();

        if (isValidHtml(rawText)) {
          // If the content is valid HTML, use it directly
          setTemplateContent(rawText);
          setPreviewContent(rawText); // Update preview for file uploads
        } else {
          // Otherwise, convert to HTML using Mammoth
          const htmlResult = await Mammoth.convertToHtml({ arrayBuffer });
          const fullHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Preview</title>
            </head>
            <body>
              ${htmlResult.value}
            </body>
            </html>
          `;
          setTemplateContent(fullHtml);
          setPreviewContent(fullHtml); // Update preview for file uploads
        }
        setIsLoading(false);
      } else {
        enqueueSnackbar("Unsupported file type. Please upload an HTML or DOCX file.", {
          variant: "error",
          autoHideDuration: 3000,
        });
        setIsLoading(false);
      }
    } catch (err) {
      enqueueSnackbar("Failed to process the uploaded file.", {
        variant: "error",
        autoHideDuration: 3000,
      });
      console.error(err);
      setIsLoading(false);
    }
  };

  // Handle compile button click
  const handleCompile = () => {
    setPreviewContent(templateContent); // Update preview with current input
    enqueueSnackbar("Preview updated.", {
      variant: "success",
      autoHideDuration: 2000,
    });
  };

  return (
    <Box sx={{ p: 1, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h6" gutterBottom>
        Template Preview
      </Typography>
      <Grid container spacing={2}>
        {/* Left: Input Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Template Input
              </Typography>
              <TextField
                id="templateContent"
                label="Enter HTML content"
                multiline
                rows={15} // Increased height
                value={templateContent}
                onChange={(e) => setTemplateContent(e.target.value)}
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<UploadFileIcon />}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Upload File"}
                  <input
                    type="file"
                    accept=".html,.docx"
                    onChange={handleFileUpload}
                    hidden
                  />
                </Button>
                <Button
                  variant="contained"
                  onClick={handleCompile}
                  disabled={isLoading || !templateContent}
                >
                  Compile
                </Button>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Only HTML or DOCX files are supported.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Preview Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Preview
              </Typography>
              <Box
                sx={{
                  border: "1px solid",
                  borderColor: "grey.300",
                  borderRadius: 1,
                  height: "calc(15 * 1.5em + 32px)", // Increased height to match TextField
                  overflow: "auto",
                }}
              >
                {isLoading ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <CircularProgress size={24} />
                  </Box>
                ) : previewContent ? (
                  <iframe
                    srcDoc={previewContent}
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TemplatePreview;