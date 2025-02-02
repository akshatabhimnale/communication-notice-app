import * as React from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
} from "@mui/material";

export default function Login() {
  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8, textAlign: "center" }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Sign In
        </Typography>

        <Box
          component="form"
          noValidate
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField label="Email" variant="outlined" fullWidth required />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            required
          />
          <Button variant="contained" color="primary" fullWidth>
            Sign In
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
