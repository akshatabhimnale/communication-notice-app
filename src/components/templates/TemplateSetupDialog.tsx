import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
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
  Chip,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useTheme } from "@mui/material/styles";

// Import Monaco editor types
import type { editor } from 'monaco-editor';
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface TemplateSetupDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: {
    name: string;
    channel: string;
    template_content: string;
  }) => void;
  initialName: string;
  dynamicFields?: Array<{ field_name: string; label?: string } | string>;
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
`;

export default function TemplateSetupDialog({
  open,
  onClose,
  onConfirm,
  initialName,
  dynamicFields = [],
}: TemplateSetupDialogProps) {
  const [name, setName] = useState(initialName);
  const [channel, setChannel] = useState("email");
  const [templateContent, setTemplateContent] = useState(DEFAULT_TEMPLATE);
  const [previewContent, setPreviewContent] = useState(DEFAULT_TEMPLATE);
  const [error, setError] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  // Editor reference for cursor position management
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (open) {
      setName(initialName);
      setChannel("email");
      setTemplateContent(DEFAULT_TEMPLATE.replace("[NAME]", initialName || "Recipient"));
      setPreviewContent(DEFAULT_TEMPLATE.replace("[NAME]", initialName || "Recipient"));
      setError("");
    }
  }, [initialName, open]);

  // Function to insert field placeholder at cursor position
  const insertFieldAtCursor = (fieldName: string) => {
    if (!editorRef.current) return;
    
    const editor = editorRef.current;
    const selection = editor.getSelection();
    
    if (selection) {
      const placeholder = `{{${fieldName}}}`;
      const operation = {
        range: selection,
        text: placeholder,
        forceMoveMarkers: true
      };
      
      editor.executeEdits("insert-field", [operation]);
      editor.focus();
      
      // Update template content after insertion
      const updatedContent = editor.getValue();
      setTemplateContent(updatedContent);
    }
  };

  // Function to handle editor initialization
  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  };

  // Replace placeholders with mock values for preview
  const generatePreviewWithMockValues = (content: string) => {
    let previewWithMocks = content;
    
    // Regular expression to find all {{field_name}} patterns
    const placeholderRegex = /{{([^}]+)}}/g;
    
    // Replace each placeholder with a mock value
    previewWithMocks = previewWithMocks.replace(placeholderRegex, (match, fieldName) => {
      // Generate appropriate mock value based on field type
      const fieldInfo = dynamicFields.find(f => {
        if (typeof f === 'string') return f === fieldName;
        return f.field_name === fieldName;
      });
      
      if (!fieldInfo) return match; // Keep original if field not found
      
      // If field info is available and has a type, generate appropriate mock
      if (typeof fieldInfo !== 'string') {
        // Find the field in dynamicFields and check its type
        const mockValues: Record<string, string> = {
          text: `Example ${fieldName}`,
          number: "42",
          date: "2025-05-08",
          boolean: "Yes",
        };
        
        // Default to text if type not specified
        return mockValues.text;
      }
      
      // Default mock value
      return `Example ${fieldName}`;
    });
    
    return previewWithMocks;
  };

  const handleCompile = () => {
    setIsCompiling(true);
    // Generate preview with mock values for placeholders
    const contentWithMockValues = generatePreviewWithMockValues(templateContent);
    setPreviewContent(contentWithMockValues);
    setTimeout(() => setIsCompiling(false), 500);
  };

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

  // Render dynamic fields as chips (display only)
  const renderDynamicFields = () => {
    if (!dynamicFields || dynamicFields.length === 0) return null;
    return (
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2, mt: 2 }}>
        {dynamicFields.map((field, idx) => {
          const label = typeof field === "string" ? field : (field.label || field.field_name);
          return (
            <Chip key={idx} label={label} color="secondary" variant="filled" onClick={() => insertFieldAtCursor(typeof field === "string" ? field : field.field_name)} />
          );
        })}
      </Box>
    );
  };

  return (
    <Drawer
      anchor={isMobile ? "bottom" : "right"}
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: isMobile ? "100%" : '80vw',
          maxWidth: "100vw",
          borderRadius: 2,
          boxShadow: 8,
          position: "fixed",
          top: "64px",
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
        borderColor: "divider",
        bgcolor: "background.paper",
      }}>
        <Typography component="div" sx={{ fontSize: "1.15rem", fontWeight: 400 }}>
          <b>Setup Common Template for</b>
          <span style={{fontWeight: 700, fontSize: "1.2rem", textTransform: "capitalize" }}> {name}</span>
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ ml: 1 }}
          size="small"
        >
          <CloseIcon fontSize="inherit" />
        </IconButton>
      </Box>
      <Divider />
      <Box sx={{ flex: 1, overflowY: "auto", p: 4, bgcolor: "background.default" }}>
        {error && (
          <Alert
            severity="error"
            icon={<ErrorOutlineIcon fontSize="inherit" />}
            sx={{ mb: 2.5 }}
          >
            <AlertTitle sx={{ fontWeight: 700 }}>Error</AlertTitle>
            {error}
          </Alert>
        )}
        {/* Channel Dropdown and Refresh Preview Button */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
          <TextField
            select
            label="Channel"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            fullWidth
            required
            variant="filled"
            error={!!error && !channel}
          >
            {CHANNEL_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="outlined"
            onClick={handleCompile}
            disabled={isCompiling}
            sx={{ textTransform: "none", minWidth: 160 }}
          >
            {isCompiling ? <CircularProgress size={20} /> : "Refresh Preview"}
          </Button>
        </Box>
        {/* Dynamic Fields as Chips (schema) */}
        {renderDynamicFields()}
        {/* Editor and Preview Side by Side */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, minHeight: 400, height: 400 }}>
          {/* Editor Section */}
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', borderRight: { md: `1px solid ${theme.palette.divider}` }, height: '100%' }}>
            <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
              EDITOR
            </Typography>
            <Box sx={{ flex: 1, minHeight: 300, height: '100%', position: 'relative' }}>
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
                onMount={handleEditorDidMount}
              />
            </Box>
          </Box>
          {/* Preview Section */}
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
              LIVE PREVIEW
            </Typography>
            <Box sx={{ flex: 1, minHeight: 300, height: '100%', backgroundColor: theme.palette.background.paper, borderRadius: 2, p: 1, overflow: 'hidden', position: 'relative' }}>
              {isCompiling ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress size={24} />
                </Box>
              ) : previewContent ? (
                <iframe
                  srcDoc={previewContent}
                  style={{ width: '100%', height: '100%', border: 'none', borderRadius: 4, backgroundColor: theme.palette.background.paper }}
                  title="Template Preview"
                  sandbox="allow-same-origin"
                />
              ) : (
                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.palette.text.secondary }}>
                  <Typography variant="body2">Compile template to see preview</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
      <Divider />
      <Box sx={{
        bgcolor: "background.paper",
        borderTop: 1,
        borderColor: 'divider',
        px: 4,
        py: 2,
        borderBottomLeftRadius: 2,
        borderBottomRightRadius: 2,
        display: 'flex',
        gap: 2,
        justifyContent: 'flex-end',
      }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          color="secondary"
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          color="primary"
          variant="contained"
        >
          Confirm Setup
        </Button>
      </Box>
    </Drawer>
  );
}
