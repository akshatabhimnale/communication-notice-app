"use client";

import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Input,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { uploadSchemaFromCsv } from "@/services/noticeService";
import { Field,Schema,DynamicFieldBuilderProps } from "@/types/noticeTypesInterface";


export default function DynamicFieldBuilder({
  onSchemaChange,
  initialSchema = {},
}: DynamicFieldBuilderProps) {
  const getInitialFields = (schema: Schema) => {
    return Object.entries(schema)
      .filter(([key]) => !key.includes(","))
      .map(([key, value]) => ({
        field_name: key,
        label: value.label || key,
        type: value.type || "text",
        required: value.required || false,
      }));
  };

  const [fields, setFields] = useState<Field[]>(getInitialFields(initialSchema));
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [openDialog, setOpenDialog] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [newField, setNewField] = useState<Field>({
    field_name: "",
    label: "",
    type: "text",
    required: false,
  });
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    // Validate and sync with initialSchema
    const invalidKeys = Object.keys(initialSchema).filter((key) => key.includes(","));
    if (invalidKeys.length > 0) {
      setSchemaError(`Invalid field names detected: ${invalidKeys.join(", ")}`);
      setFields([]);
    } else {
      setSchemaError(null);
      const newFields = getInitialFields(initialSchema);
      setFields(newFields);
      console.log("Fields updated:", JSON.stringify(newFields, null, 2));
    }
  }, [initialSchema]);

  const updateSchema = (updatedFields: Field[]) => {
    const schema: Schema = updatedFields.reduce((acc: Schema, field) => {
      acc[field.field_name] = {
        label: field.label || field.field_name, // Default to field_name if label empty
        type: field.type,
        required: field.required,
      };
      return acc;
    }, {});
    onSchemaChange(schema);
  };

  const validateField = (field: Field, allFields: Field[], currentIndex?: number) => {
    const errors: { [key: string]: string } = {};
    if (!field.field_name.trim()) {
      errors.field_name = "Field name cannot be empty";
    } else if (
      allFields.some(
        (f, i) => f.field_name.trim() === field.field_name.trim() && i !== currentIndex
      )
    ) {
      errors.field_name = "Field name must be unique";
    }
    return errors;
  };

  const handleAddOrEditField = () => {
    const allFields = editIndex !== null ? fields : [...fields, newField];
    const currentIndex = editIndex !== null ? editIndex : fields.length;
    const validationErrors = validateField(newField, allFields, currentIndex);

    if (Object.keys(validationErrors).length === 0) {
      const updatedFields = [...fields];
      if (editIndex !== null) {
        updatedFields[editIndex] = newField;
      } else {
        updatedFields.push(newField);
      }
      setFields(updatedFields);
      updateSchema(updatedFields);
      setNewField({ field_name: "", label: "", type: "text", required: false });
      setOpenDialog(false);
      setEditIndex(null);
      setErrors({});
    } else {
      setErrors(validationErrors);
    }
  };

  const removeField = (index: number) => {
    const updatedFields = fields.filter((_, i) => i !== index);
    setFields(updatedFields);
    updateSchema(updatedFields);
  };

  const openEditDialog = (index: number) => {
    setNewField(fields[index]);
    setEditIndex(index);
    setOpenDialog(true);
    setErrors({});
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".csv") && !file.name.endsWith(".xlsx")) {
      setUploadError("Please upload a CSV or XLSX file");
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const schema = await uploadSchemaFromCsv(file);
      const newFields = getInitialFields(schema);
      setFields((prev) => [...prev, ...newFields]);
      updateSchema([...fields, ...newFields]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to extract schema from file";
      console.error("Upload error:", errorMessage);
      setUploadError(errorMessage);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {schemaError && (
        <Typography color="error" sx={{ mb: 2 }}>
          {schemaError}
        </Typography>
      )}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6">Dynamic Schema Builder</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setNewField({ field_name: "", label: "", type: "text", required: false });
              setEditIndex(null);
              setOpenDialog(true);
              setErrors({});
            }}
            size="medium"
          >
            Add Field
          </Button>
          <Button
            variant="contained"
            component="label"
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : null}
          >
            Upload CSV/XLSX (Optional)
            <Input
              type="file"
              inputProps={{ accept: ".csv,.xlsx" }}
              onChange={handleFileUpload}
              sx={{ display: "none" }}
            />
            
          </Button>
        </Box>
      </Box>
      {uploadError && (
        <Typography color="error" sx={{ mt: 1 }}>
          {uploadError}
        </Typography>
      )}

      {fields.length === 0 ? (
        <Typography color="text.secondary">No fields added yet.</Typography>
      ) : (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {fields.map((field, index) => (
            <Chip
              key={index}
              label={`${field.field_name} (${field.type}${field.required ? ", required" : ""})`}
              onClick={() => openEditDialog(index)}
              onDelete={() => removeField(index)}
              deleteIcon={<DeleteIcon />}
              icon={<EditIcon />}
              color="primary"
              variant="outlined"
              sx={{ px: 1 }}
            />
          ))}
        </Box>
      )}

      

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editIndex !== null ? "Edit Field" : "Add New Field"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Field Name"
              value={newField.field_name}
              onChange={(e) => setNewField({ ...newField, field_name: e.target.value })}
              fullWidth
              error={!!errors.field_name}
              helperText={errors.field_name || "Unique code (e.g., due_date)"}
              size="small"
            />
            <TextField
              label="Label"
              value={newField.label}
              onChange={(e) => setNewField({ ...newField, label: e.target.value })}
              fullWidth
              helperText="Optional, defaults to field name"
              size="small"
            />
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={newField.type}
                onChange={(e) => setNewField({ ...newField, type: e.target.value as Field["type"] })}
                label="Type"
              >
                <MenuItem value="text">Text</MenuItem>
                <MenuItem value="number">Number</MenuItem>
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="boolean">Boolean</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={newField.required}
                  onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                />
              }
              label="Required"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddOrEditField} variant="contained" color="primary">
            {editIndex !== null ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}