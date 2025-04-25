"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from "@mui/material";
import { fetchTemplates,template as Template } from "@/services/templateServices"; // Assume this service exists


const TemplatesPage: React.FC = () => {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetchTemplates(); // Fetch templates from API
        setTemplates(response.results || []);
      } catch (err) {
        setError("Failed to load templates.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadTemplates();
  }, []);

  const handleCreateTemplate = () => {
    router.push("/admin/templates/create");
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Templates (Test page)
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleCreateTemplate}
        sx={{ mb: 2 }}
      >
        Create New Template
      </Button>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {isLoading ? (
        <CircularProgress />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Channel</TableCell>
              <TableCell>Notice Type</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>No templates available</TableCell>
              </TableRow>
            ) : (
              templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>{template.id}</TableCell>
                  <TableCell>{template.channel}</TableCell>
                  <TableCell>{template.notice_type}</TableCell>
                  {/* <TableCell>
                    <Button
                      variant="outlined"
                      onClick={() =>
                        router.push(`/admin/templates/edit/${template.id}`)
                      }
                    >
                      Edit
                    </Button>
                  </TableCell> */}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};

export default TemplatesPage;