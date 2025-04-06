"use client";

import { useState } from "react";
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Grid,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

interface Field {
  field_name: string;
  label: string;
  type: "text" | "number" | "date" | "boolean";
  required: boolean;
}

interface SchemaField {
  label: string;
  type: "text" | "number" | "date" | "boolean";
  required: boolean;
}

interface Schema {
  [key: string]: SchemaField;
}

interface DynamicFieldBuilderProps {
  onSchemaChange: (schema: Schema) => void;
  initialSchema?: Schema;
}

export default function DynamicFieldBuilder({
  onSchemaChange,
  initialSchema = {},
}: DynamicFieldBuilderProps) {
  const initialFields = Object.entries(initialSchema).map(([key, value]) => ({
    field_name: key,
    label: value.label || key,
    type: value.type || "text",
    required: value.required || false,
  }));

  const [fields, setFields] = useState<Field[]>(initialFields.length ? initialFields : []);
  const [errors, setErrors] = useState<string[]>([]);

  const updateSchema = (updatedFields: Field[]) => {
    const schema: Schema = updatedFields.reduce((acc: Schema, field) => {
      acc[field.field_name] = {
        label: field.label,
        type: field.type,
        required: field.required,
      };
      return acc;
    }, {});
    onSchemaChange(schema);
  };

  const addField = () => {
    const newField: Field = { field_name: "", label: "", type: "text", required: false };
    const updatedFields = [...fields, newField];
    setFields(updatedFields);
    updateSchema(updatedFields);
  };

  const removeField = (index: number) => {
    const updatedFields = fields.filter((_, i) => i !== index);
    setFields(updatedFields);
    updateSchema(updatedFields);
    validateFields(updatedFields);
  };

  const updateField = (
    index: number,
    key: keyof Field,
    value: string | "text" | "number" | "date" | "boolean" | boolean
  ) => {
    const updatedFields = fields.map((field, i) =>
      i === index ? { ...field, [key]: value } : field
    );
    setFields(updatedFields);
    updateSchema(updatedFields);
    validateFields(updatedFields);
  };

  const validateFields = (fieldsToValidate: Field[]) => {
    const newErrors: string[] = [];
    const fieldNames = fieldsToValidate.map((f) => f.field_name.trim());

    fieldsToValidate.forEach((field, index) => {
      if (!field.field_name.trim()) {
        newErrors[index] = "Field name cannot be empty";
      } else if (fieldNames.indexOf(field.field_name.trim()) !== index) {
        newErrors[index] = "Field name must be unique";
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const schemaPreview = JSON.stringify(
    fields.reduce((acc, field) => {
      acc[field.field_name] = {
        label: field.label,
        type: field.type,
        required: field.required,
      };
      return acc;
    }, {} as Schema),
    null,
    2
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: 0, mb: 2, px: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Dynamic Schema Builder
      </Typography>
      <Grid container spacing={26} alignItems="stretch">
        <Grid item xs={12} md={6}>
          <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
              Schema Preview
            </Typography>
            <TextField
              value={schemaPreview}
              fullWidth
              multiline
              rows={8}
              InputProps={{ readOnly: true }}
              variant="outlined"
              size="small"
              sx={{ fontFamily: "monospace", flexGrow: 1, minHeight: 0 }}
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ display: "flex", flexDirection: "column", height: "100%", pr: 4 }}>
            {fields.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 2 }}>
                No fields yet. Add one to start building!
              </Typography>
            ) : (
              fields.map((field, index) => (
                <Accordion
                  key={index}
                  defaultExpanded={!field.field_name}
                  sx={{ mb: 2 }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>
                      {field.field_name || `Field ${index + 1}`} {field.required && "(Required)"}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, py: 1 }}>
                      <TextField
                        label="Field Name"
                        value={field.field_name}
                        onChange={(e) => updateField(index, "field_name", e.target.value)}
                        fullWidth
                        error={!!errors[index]}
                        helperText={errors[index] || "Unique code (e.g., due_date)"}
                        size="small"
                      />
                      <TextField
                        label="Label"
                        value={field.label}
                        onChange={(e) => updateField(index, "label", e.target.value)}
                        fullWidth
                        helperText="Display name (e.g., Due Date)"
                        size="small"
                      />
                      <FormControl fullWidth size="small">
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={field.type}
                          onChange={(e) =>
                            updateField(index, "type", e.target.value as Field["type"])
                          }
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
                            checked={field.required}
                            onChange={(e) => updateField(index, "required", e.target.checked)}
                          />
                        }
                        label="Required"
                        sx={{ mt: -1 }}
                      />
                      <IconButton
                        color="error"
                        onClick={() => removeField(index)}
                        sx={{ alignSelf: "flex-end", mt: -1 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))
            )}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addField}
              fullWidth
              sx={{ mt: 3 }}
            >
              Add Field
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}