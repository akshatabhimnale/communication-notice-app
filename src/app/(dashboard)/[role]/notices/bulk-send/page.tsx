import React from 'react';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';

const BulkSend: React.FC = () => {
  return (
    <Box sx={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>

      <FormControl fullWidth>
        <InputLabel>Select User*</InputLabel>
        <Select
          label="Select User*"
          value=""
        >
          <MenuItem value="" disabled>
            Select
          </MenuItem>
        </Select>
      </FormControl>
      <Box sx={{ display: 'flex', gap: '30px' }}>
        <FormControl fullWidth sx={{ flex: 1 }}>
          <InputLabel>Select Notice Type*</InputLabel>
          <Select
            label="Select Notice Type*"
            value=""
          >
            <MenuItem value="" disabled>
              Select Notice Type
            </MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ flex: 1 }}>
          <InputLabel>Select Batch Name</InputLabel>
          <Select
            label="Select Batch Name"
            value=""
          >
            <MenuItem value="" disabled>
              Select Batch Name
            </MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ display: 'flex', gap: '30px' }}>
        <TextField
          label="From Notice Id *"
          variant="filled"
          value="From ex. IN12-1234"
          InputProps={{ disableUnderline: true }}
          sx={{ flex: 1 }}
        />
        <TextField
          label="To Notice Id *"
          variant="filled"
          value="To ex. IN12-2345"
          InputProps={{ disableUnderline: true }}
          sx={{ flex: '1' }}
        />
        <TextField
          label="Except Notice Id"
          variant="filled"
          value="Except ex. IN12-23,IN12-34,IN12-45"
          InputProps={{ disableUnderline: true }}
          sx={{ flex: 1 }}
        />
      </Box>
      <Box sx={{ display: 'flex', gap: '30px' }}>
        <FormControl fullWidth sx={{ flex: 1 }}>
          <InputLabel>Schedule Date :</InputLabel>
          <TextField
            type="date"
            variant="filled"
            defaultValue="2025-07-23"
            InputProps={{ disableUnderline: true }}
          />
        </FormControl>
      </Box>
      <Button variant="contained" sx={{ width: '200px' }}>Submit</Button>
    </Box>
  );
};

export default BulkSend;