"use client";
import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Select, MenuItem, IconButton, CircularProgress, Typography,
  FormHelperText
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { User, editUser } from "@/services/usersService";

interface EditUserModalProps {
  user: User;
  open: boolean;
  setOpen: (open: boolean) => void;
  onUserUpdated: (updatedUser: User) => void;
}

interface FormErrors {
  username?: string;
  email?: string;
  phone?: string;
}

export default function EditUserModal({
  user,
  open,
  setOpen,
  onUserUpdated,
}: EditUserModalProps) {
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    phone: user.phone || "",
    role: user.role,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Reset form when user changes
  useEffect(() => {
    if (open) {
      setFormData({
        username: user.username,
        email: user.email,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
        role: user.role,
      });
      setError(null);
      setFormErrors({});
    }
  }, [user, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field-specific error when field is edited
    if (name in formErrors) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    // Validate username
    if (!formData.username.trim()) {
      errors.username = "Username is required";
      isValid = false;
    }

    // Validate email
    if (!formData.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
      isValid = false;
    }

    // Validate phone (optional validation)
    if (formData.phone && !/^\+?[0-9\s\-\(\)]{8,20}$/.test(formData.phone)) {
      errors.phone = "Phone number format is invalid";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      
      const updatedUserData = {
        ...user,                
        ...formData,            
        organization_id: user.organization_id,
        id: user.id,            
      };
      
      const updatedUser = await editUser(user.id, updatedUserData);
      onUserUpdated(updatedUser);
      setOpen(false);
    } catch (err) {
      console.error("Edit user error:", err);
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>
        Edit User
        <IconButton onClick={() => setOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 2 }}>
        <TextField
          fullWidth
          margin="normal"
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          error={!!formErrors.username}
          helperText={formErrors.username}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          error={!!formErrors.email}
          helperText={formErrors.email}
        />
        <TextField
          fullWidth
          margin="normal"
          label="First Name"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Last Name"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          error={!!formErrors.phone}
          helperText={formErrors.phone}
        />
        <Select
          fullWidth
          margin="dense"
          name="role"
          value={formData.role}
          onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
          sx={{ mt: 2 }}
        >
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="manager">Manager</MenuItem>
          <MenuItem value="user">User</MenuItem>
        </Select>
        <FormHelperText>
          Organization: {user.organization?.name || "Unknown"}
        </FormHelperText>
        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}