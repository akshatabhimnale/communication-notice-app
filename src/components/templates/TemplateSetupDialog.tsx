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
  Typography,
} from "@mui/material";

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
const DEFAULT_TEMPLATE = `<b>NOTICE TEMPLATE</b><br/><br/>This is a default template for <b>[NAME]</b>.<br/>`;

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

  useEffect(() => {
    setName(initialName);
    setTemplateContent(DEFAULT_TEMPLATE.replace("[NAME]", initialName));
  }, [initialName, open]);

  const handleConfirm = () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!channel) {
      setError("Channel is required");
      return;
    }
    if (!templateContent.trim()) {
      setError("Template content is required");
      return;
    }
    setError("");
    onConfirm({ name, channel, template_content: templateContent });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Setup Common Template</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Template Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
          />
          <TextField
            select
            label="Channel"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            fullWidth
            required
          >
            {CHANNEL_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Template Content (HTML)"
            value={templateContent}
            onChange={(e) => setTemplateContent(e.target.value)}
            fullWidth
            multiline
            minRows={5}
            required
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleConfirm} color="primary" variant="contained">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}