"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Typography, 
  TextField, 
  Alert, 
  CircularProgress,
  Container,
  Paper,
  SelectChangeEvent
} from '@mui/material';
import { fetchNoticeTypesWithTransformedSchemas, uploadSchemaFromCsv, bulkCreateNotices } from '@/services/noticeService';
import { fetchUserProfile } from '@/services/userService';
import { TransformedNoticeType, PaginatedResponse } from '@/types/noticeTypesInterface';

const BulkUpload: React.FC = () => {
  const [noticeTypes, setNoticeTypes] = useState<TransformedNoticeType[]>([]);
  const [selectedNoticeType, setSelectedNoticeType] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>('');

  // Fetch all notice types, handling pagination
  const fetchAllNoticeTypes = async () => {
    try {
      let allNoticeTypes: TransformedNoticeType[] = [];
      let page = 1;
      let hasNext = true;

      while (hasNext) {
        const response: Omit<PaginatedResponse, 'results'> & { results: TransformedNoticeType[] } = await fetchNoticeTypesWithTransformedSchemas(page);
        allNoticeTypes = [...allNoticeTypes, ...response.results];
        hasNext = !!response.next;
        page++;
      }

      console.log("Fetched Notice Types:", allNoticeTypes);
      setNoticeTypes(allNoticeTypes);
    } catch (err) {
      setError('Failed to fetch notice types. Please try again.');
      console.error(err);
    }
  };

  // Fetch user profile to get user ID with retry logic
  const fetchUserId = async (retries = 3, delay = 1000): Promise<void> => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const profile = await fetchUserProfile();
        setUserId(profile.id);
        return;
      } catch (err) {
        if (attempt === retries) {
          setError('Failed to fetch user profile after multiple attempts. Please check your network and try again.');
          console.error(err);
          return;
        }
        console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };

  useEffect(() => {
    fetchAllNoticeTypes();
    fetchUserId();
  }, []);

  // Handle file selection
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      setFile(null);
      setError('No file selected.');
      return;
    }

    // Validate file type
    const validTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!validTypes.includes(selectedFile.type)) {
      setFile(null);
      setError('Invalid file type. Please upload a .csv or .xlsx file.');
      return;
    }

    try {
      // Validate schema
      const schema = await uploadSchemaFromCsv(selectedFile);
      if (!schema || Object.keys(schema).length === 0) {
        setError('Invalid CSV headers or schema.');
        return;
      }
      setFile(selectedFile);
      setError('');
    } catch (err) {
      setError('Failed to validate CSV schema. Please check the file format.');
      console.error(err);
    }
  };

  // Handle notice type selection
  const handleNoticeTypeChange = (event: SelectChangeEvent<string>) => {
    setSelectedNoticeType(event.target.value);
    setError('');
  };

  // Handle form reset
  const handleCancel = () => {
    setSelectedNoticeType('');
    setFile(null);
    setError('');
    setSuccess('');
    const input = document.getElementById('file-upload') as HTMLInputElement;
    if (input) input.value = '';
  };

  // Handle upload and notice creation
  const handleUpload = async () => {
    if (!selectedNoticeType) {
      setError('Please select a notice type.');
      return;
    }
    if (!file) {
      setError('Please upload a valid CSV or XLSX file.');
      return;
    }
    if (!userId) {
      setError('User profile not loaded. Please try again.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const selectedType = noticeTypes.find((type) => type.id === selectedNoticeType);
      if (!selectedType) {
        throw new Error('Selected notice type not found.');
      }

      console.log("Selected Notice Type Schema:", JSON.stringify(selectedType.dynamic_schema, null, 2));

      const response = await bulkCreateNotices(
        file,
        selectedNoticeType,
        userId,
        selectedType.dynamic_schema
      );

      if (response.success) {
        const createdCount = response.data.created.length;
        const failedCount = response.data.failed.length;
        setSuccess(
          `Successfully created ${createdCount} notices.${
            failedCount > 0
              ? ` Failed to create ${failedCount} rows: ${response.data.failed
                  .map((f) => `Row ${f.row}: ${f.error}`)
                  .join('; ')}`
              : ''
          }`
        );
        handleCancel();
      } else {
        setError(
          `Failed to create notices: ${response.data.failed
            .map((f) => `Row ${f.row}: ${f.error}`)
            .join('; ')}`
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred during upload. Please try again.'
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Bulk Notice Upload
        </Typography>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          <FormControl fullWidth sx={{ mb: 2 }} required>
            <InputLabel id="notice-type-label">Notice Type</InputLabel>
            <Select
              labelId="notice-type-label"
              value={selectedNoticeType}
              label="Notice Type"
              onChange={handleNoticeTypeChange}
              disabled={loading}
            >
              {noticeTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            id="file-upload"
            type="file"
            inputProps={{ accept: '.csv,.xlsx' }}
            onChange={handleFileChange}
            fullWidth
            sx={{ mb: 2 }}
            disabled={loading}
            helperText={file ? `Selected file: ${file.name}` : 'Upload a .csv or .xlsx file'}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={loading || !file || !selectedNoticeType || !userId}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              Upload & Create Notices
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default BulkUpload;