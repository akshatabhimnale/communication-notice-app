"use client";

import React, { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import {
  Box,
  TextField,
  Typography,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  MenuItem,
  IconButton,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import dynamic from "next/dynamic";
import { updateTemplate } from "@/services/TemplateService";
import { CHANNEL_OPTIONS } from "./TemplateSetupDialog";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface TemplatePreviewProps {
  open: boolean;
  onClose: () => void;
  template: {
    id: string;
    channel: string;
    template_content: string;
    notice_type: string;
  } | null;
  onUpdated?: () => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ open, onClose, template, onUpdated }) => {
  const [templateContent, setTemplateContent] = useState<string>("");
  const [previewContent, setPreviewContent] = useState<string>("");
  const [channel, setChannel] = useState<string>("email");
  const [isLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  useEffect(() => {
    if (template) {
      setTemplateContent(template.template_content);
      setPreviewContent(template.template_content);
      setChannel(template.channel);
    }
  }, [template]);

  // Handle compile button click
  const handleCompile = () => {
    setPreviewContent(templateContent);
    enqueueSnackbar("Preview updated.", {
      variant: "success",
      autoHideDuration: 2000,
    });
  };

  const handleSave = async () => {
    if (!template) return;
    setSaving(true);
    try {
      await updateTemplate(template.id, {
        channel,
        template_content: templateContent,
        notice_type: template.notice_type,
      });
      enqueueSnackbar("Template updated successfully!", { variant: "success" });
      if (onUpdated) onUpdated();
      onClose();
    } catch (err: unknown) {
      enqueueSnackbar(err instanceof Error ? err.message : "Failed to update template.", { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      sx={{ "& .MuiDialog-paper": { height: "calc(100% - 64px)" } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6" component="div">
          Template Preview & Edit
        </Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Button
            variant="outlined"
            onClick={handleCompile}
            disabled={isLoading}
            sx={{ textTransform: "none" }}
          >
            Refresh Preview
          </Button>
          <TextField
            select
            label="Channel"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            size="small"
            sx={{ minWidth: 140, "& .MuiInputBase-root": { height: 40 } }}
          >
            {CHANNEL_OPTIONS.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={saving || isLoading}
            sx={{ fontWeight: 600, textTransform: "none" }}
          >
            {saving ? <CircularProgress size={20} /> : "Save Changes"}
          </Button>
          <IconButton
            onClick={onClose}
            size="small"
            aria-label="Close preview"
            sx={{ color: theme.palette.text.secondary }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 0,
          height: "100%",
          display: "flex",
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            flex: 1,
            minHeight: 600,
          }}
        >
          {/* Editor Section */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              borderRight: { md: `1px solid ${theme.palette.divider}` },
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1,
                backgroundColor: theme.palette.background.paper,
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="subtitle2" color="textSecondary">
                EDITOR
              </Typography>
            </Box>
            <Box
              sx={{
                flex: 1,
                position: "relative",
                "& .monaco-editor": { borderRadius: "0 0 4px 4px" },
              }}
            >
              <MonacoEditor
                height="100%"
                defaultLanguage="html"
                value={templateContent}
                onChange={(v) => setTemplateContent(v || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  formatOnPaste: true,
                  formatOnType: true,
                  padding: { top: 12 },
                  quickSuggestions: true,
                  autoClosingBrackets: "always",
                  autoClosingQuotes: "always",
                  autoIndent: "full",
                  suggestOnTriggerCharacters: true,
                }}
                theme={theme.palette.mode === "dark" ? "vs-dark" : "vs-light"}
              />
            </Box>
          </Box>

          {/* Preview Section */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1,
                backgroundColor: theme.palette.background.paper,
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="subtitle2" color="textSecondary">
                LIVE PREVIEW
              </Typography>
            </Box>
            <Box
              sx={{
                flex: 1,
                position: "relative",
                backgroundColor: theme.palette.background.paper,
                overflow: "hidden",
                p: 2,
              }}
            >
              {isLoading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    backgroundColor: theme.palette.background.default,
                  }}
                >
                  <CircularProgress size={24} />
                </Box>
              ) : previewContent ? (
                <iframe
                  srcDoc={previewContent}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    borderRadius: 4,
                    backgroundColor: theme.palette.background.paper,
                  }}
                  title="Template Preview"
                  sandbox="allow-same-origin"
                />
              ) : (
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: theme.palette.text.secondary,
                  }}
                >
                  <Typography variant="body2">
                    Compile template to see preview
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TemplatePreview;