import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  IconButton,
  Alert,
  AlertTitle,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

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

const CHANNEL_OPTIONS = ["email", "whatsapp", "sms", "rpad"];

const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <title>Communication Notice</title>
  <style>
    body { font-family: sans-serif; line-height: 1.6; }
    b { font-weight: bold; }
  </style>
</head>
<body>
  <b>Communication Notice Template</b><br/><br/>
  Dear <b>[NAME]</b>,<br/><br/>
  This is a sample template to get you started.<br/>
  <b>Feel free to edit this text directly below.</b> You can use basic HTML tags like &lt;b&gt;bold&lt;/b&gt;, &lt;i&gt;italics&lt;/i&gt;, and &lt;br/&gt; for line breaks.<br/><br/>
  Replace placeholders like [NAME] with dynamic data fields if needed.<br/><br/>
  After customizing, confirm the setup to save and use this template for your communications.<br/><br/>
  Best regards,<br/>
  Your Organization
</body>
</html>`;

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
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: "#f0f8ff", 
          boxShadow: 8,
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: 'teal.600', 
          color: '#000',
          py: 2,
          px: 3,
          fontSize: '1.15rem',
          fontWeight: 600,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      >
        Setup Common Template
        <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
                color: "#000",
                ml: 1,
                '&:hover': { color: "#fff" }
            }}
            size="small"
        >
            <CloseIcon fontSize="inherit" />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          bgcolor: "#f0f8ff", 
          pt: 3,
          pb: 2,
          px: 4,
        }}
      >
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
            label="Template Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter template name"
            role="TemplateName"
            fullWidth
            required
            variant="filled"
            error={!!error && !name.trim()}
            sx={{
              bgcolor: '#e0f7fa',
              borderRadius: 2,
              '& .MuiFilledInput-root': {
          borderRadius: 2,
          backgroundColor: '#e0f7fa',
              },
              '& .MuiInputBase-input': { 
                color: '#333',
              },
              '& .MuiFilledInput-underline:before': { borderBottom: '2px solid #26a69a' },
              '& .MuiFilledInput-underline:after': { borderBottom: '2px solid #00897b' },
            }}
            InputLabelProps={{ sx: { color: "#00897b" } }}
          />
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
              '& .MuiSelect-select': { 
           color: '#333',
              },
              '& .MuiInputBase-input': {
           color: '#333',
              },
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
              '& .MuiInputBase-input': {
          color: '#333',
              },
              '& .MuiFilledInput-underline:before': { borderBottom: '2px solid #43a047' },
              '& .MuiFilledInput-underline:after': { borderBottom: '2px solid #1b5e20' },
            }}
            InputLabelProps={{ sx: { color: "#388e3c" } }}
            
          />
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          bgcolor: "#e0f2f1",
          borderTop: 1,
          borderColor: '#b2dfdb',
          px: 4,
          py: 2,
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
        }}
      >
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
      </DialogActions>
    </Dialog>
  );
}
