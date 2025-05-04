import React, { useState, useEffect } from "react";
import {
  Drawer,
  Button,
  TextField,
  MenuItem,
  Box,
  IconButton,
  Alert,
  AlertTitle,
  useMediaQuery,
  Typography,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useTheme } from "@mui/material/styles";

interface TemplateSetupDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: {
    name: string;
    channel: string;
    template_content: string;
  }) => void;
  initialName: string;
}

export const CHANNEL_OPTIONS = ["email", "whatsapp", "sms", "rpad"];

const DEFAULT_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sample HTML Preview</title>
</head>
<body>
    <h1>Hello from HTML!</h1>
    <p>This is a simple HTML file with an image.</p>
    <img src="" alt="City Image">
</body>
</html>
`

;

export default function TemplateSetupDialog({
  open,
  onClose,
  onConfirm,
  initialName,
}: TemplateSetupDialogProps) {
  const [name, setName] = useState(initialName);
  const [channel, setChannel] = useState("email");
  const [templateContent, setTemplateContent] = useState(DEFAULT_TEMPLATE);
  const [error, setError] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Reset form state when dialog opens or initialName changes
  useEffect(() => {
    if (open) {
      setName(initialName);
      setChannel("email"); 
      setTemplateContent(DEFAULT_TEMPLATE.replace("[NAME]", initialName || "Recipient")); // Handle empty initialName
      setError(""); 
    }
  }, [initialName, open]);

  const handleConfirm = () => {
    let validationError = "";
    if (!name.trim()) {
      validationError = "Template Name is required.";
    } else if (!channel) {
      validationError = "Channel is required.";
    } else if (!templateContent.trim()) {
      validationError = "Template Content cannot be empty.";
    }

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    onConfirm({ name, channel, template_content: templateContent });
  };

  const handleClose = () => {
    setError(""); 
    onClose(); 
  };

  return (
    <Drawer
      anchor={isMobile ? "bottom" : "right"}
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: isMobile ? "100%" : 480,
          maxWidth: "100vw",
          borderTopLeftRadius: isMobile ? 16 : 0,
          borderTopRightRadius: isMobile ? 16 : 0,
          borderBottomLeftRadius: !isMobile ? 16 : 0,
          bgcolor: "#f0f8ff",
          boxShadow: 8,
          position: "fixed",
          top: "64px", // Adjust to your navbar height
          height: isMobile ? "calc(70vh - 64px)" : "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Box sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 3,
        py: 2,
        borderBottom: 1,
        borderColor: "#b2dfdb",
  bgcolor: "#00897b",
      }}>
        <Typography component="div" sx={{ fontSize: "1.15rem", fontWeight: 400 }}>
          <b>Setup Common Template for</b>
          <span style={{fontWeight: 700, fontSize: "1.2rem", textTransform: "capitalize" }}> {name}</span>
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ color: "#000", ml: 1, '&:hover': { color: "#fff" } }}
          size="small"
        >
          <CloseIcon fontSize="inherit" />
        </IconButton>
      </Box>
      <Divider />
      <Box sx={{ flex: 1, overflowY: "auto", p: 4, bgcolor: "#f0f8ff" }}>
        {error && (
          <Alert
            severity="error"
            icon={<ErrorOutlineIcon fontSize="inherit" />}
            sx={{
              mb: 2.5,
              bgcolor: "#ffeaea",
              color: "#b71c1c",
              border: "1px solid #f44336",
              borderRadius: 2,
              px: 2,
              py: 1.5,
            }}
          >
            <AlertTitle sx={{ fontWeight: 700, color: "#b71c1c" }}>Error</AlertTitle>
            {error}
          </Alert>
        )}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <TextField
            select
            label="Channel"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            fullWidth
            required
            variant="filled"
            error={!!error && !channel}
            sx={{
              bgcolor: '#e0f7fa',
              borderRadius: 2,
              '& .MuiFilledInput-root': {
                borderRadius: 2,
                backgroundColor: '#e0f7fa',
              },
              '& .MuiSelect-select': { color: '#333' },
              '& .MuiInputBase-input': { color: '#333' },
              '& .MuiFilledInput-underline:before': { borderBottom: '2px solid #26a69a' },
              '& .MuiFilledInput-underline:after': { borderBottom: '2px solid #00897b' },
            }}
            InputLabelProps={{ sx: { color: "#00897b" } }}
          >
            {CHANNEL_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Template Content (HTML is supported)"
            value={templateContent}
            onChange={(e) => setTemplateContent(e.target.value)}
            fullWidth
            multiline
            minRows={6}
            required
            variant="filled"
            error={!!error && !templateContent.trim()}
            sx={{
              bgcolor: '#e8f5e9',
              borderRadius: 2,
              '& .MuiFilledInput-root': {
                borderRadius: 2,
                backgroundColor: '#e8f5e9',
              },
              '& .MuiInputBase-input': { color: '#333' },
              '& .MuiFilledInput-underline:before': { borderBottom: '2px solid #43a047' },
              '& .MuiFilledInput-underline:after': { borderBottom: '2px solid #1b5e20' },
            }}
            InputLabelProps={{ sx: { color: "#388e3c" } }}
          />
        </Box>
      </Box>
      <Divider />
      <Box sx={{
        bgcolor: "#e0f2f1",
        borderTop: 1,
        borderColor: '#b2dfdb',
        px: 4,
        py: 2,
        borderBottomLeftRadius: isMobile ? 16 : 0,
        borderBottomRightRadius: isMobile ? 16 : 0,
        display: 'flex',
        gap: 2,
        justifyContent: 'flex-end',
      }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          color="secondary"
          sx={{
            borderColor: "#00897b",
            color: "#00897b",
            fontWeight: 500,
            px: 2.5,
            py: 1,
            borderRadius: 2,
            '&:hover': {
              bgcolor: "#b2dfdb",
              borderColor: "#00897b",
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          color="primary"
          variant="contained"
          sx={{
            bgcolor: "#00897b",
            color: "#fff",
            fontWeight: 600,
            px: 3,
            py: 1.2,
            borderRadius: 2,
            boxShadow: 2,
            '&:hover': {
              bgcolor: "#00695c",
              boxShadow: 4,
            }
          }}
        >
          Confirm Setup
        </Button>
      </Box>
    </Drawer>
  );
}
