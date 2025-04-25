"use client"
import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Select, MenuItem, IconButton, CircularProgress, Typography,
  FormHelperText,
  SelectChangeEvent
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { User, editUser } from "@/services/userService";

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
  // Initialize state with empty strings for potentially null/undefined values
  const [formData, setFormData] = useState({
    username: user.username || "",
    email: user.email || "",
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    phone: user.phone || "",
    role: user.role || "user", // Provide a default role if needed
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Reset form when user changes, ensuring values are not null
  useEffect(() => {
    if (open) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
        role: user.role || "user", // Ensure role has a default
      });
      setError(null);
      setFormErrors({});
    }
  }, [user, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear field-specific error when field is edited
    if (name in formErrors) {
      setFormErrors(prevFormErrors => ({ ...prevFormErrors, [name]: undefined }));
    }
  };

    const validateForm = (): boolean => {
      const errors: FormErrors = {};
      let isValid = true;

      // Normalize input values
      const username = formData.username.trim();
      const email = formData.email.trim();
      const phone = formData.phone.trim();

      // Validate username
      if (!username) {
        errors.username = "Username is required";
        isValid = false;
      }
      // Validate email
      if (!email) {
        errors.email = "Email is required";
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        errors.email = "Email is invalid";
        isValid = false;
      }
      // Validate phone (optional validation)
      // Allow empty phone number
      if (phone && !/^\+?[0-9\s\-\(\)]{8,20}$/.test(phone)) {
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
        // Construct the payload ensuring types match the User interface
        const updatedUserData: User = {
          ...user, // Spread the original user data first
          // Override with form data, ensuring string types where required
          username: formData.username,
          email: formData.email,
          first_name: formData.first_name || "",
          last_name: formData.last_name || "",
          phone: formData.phone || "",
          role: formData.role,
          // Ensure required fields like id and organization_id are present from the original user
          id: user.id,
          organization_id: user.organization_id,
        };

        // Call the API to update the user
        const updatedUserResult = await editUser(user.id, updatedUserData);

        // Create a new object to ensure reference change detection using the API result
        const updatedUserWithNewRef = { ...updatedUserResult };

        // Send the updated user to the parent component
        onUserUpdated(updatedUserWithNewRef);

        setOpen(false); // Close the modal
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
          autoComplete="username" 
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
          autoComplete="email" 
        />
        <TextField
          fullWidth
          margin="normal"
          label="First Name"
          name="first_name"
          value={formData.first_name} 
          autoComplete="given-name" 
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Last Name"
          name="last_name"
          value={formData.last_name} 
          autoComplete="family-name" 
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Phone"
          name="phone"
          type="tel" // Use type="tel" for phone numbers
          value={formData.phone} 
          onChange={handleChange}
          error={!!formErrors.phone}
          autoComplete="tel" 
          helperText={formErrors.phone}
        />
        <Select
          fullWidth
          margin="dense"
          name="role"
          value={formData.role} 
          
          autoComplete="off"
          onChange={handleChange} 
          sx={{ mt: 2 }}
          displayEmpty 
        >
          
          {/* <MenuItem value="" disabled>Select Role</MenuItem> */}
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="manager">Manager</MenuItem>
          <MenuItem value="user">User</MenuItem>
        </Select>
        <FormHelperText sx={{ mt: 1 }}> 
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