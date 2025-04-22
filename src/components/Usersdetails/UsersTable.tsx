"use client";
import { useState } from "react";
import {
  Table,TableBody,TableCell,TableContainer,TableHead,TableRow,Paper,Button,Box,CircularProgress,Typography,Popover,MenuItem,Dialog,DialogTitle,DialogContent,DialogActions,IconButton,
} from "@mui/material";
import EditUserModal from "./EditUserModal";
import { User, deleteUser } from "@/services/userService";
import { EllipsisVertical } from "lucide-react";

export interface UserWithDelete extends User {
  deleted?: boolean;
}

interface UsersTableProps {
  users: User[];
  loading: boolean;
  error: string | null;
  nextPageUrl: string | null;
  prevPageUrl: string | null;
  onPageChange: (url: string | null) => void;
  onUserUpdated: (updatedUser: UserWithDelete) => void;
}

export default function UsersTable({
  users,
  loading,
  error,
  nextPageUrl,
  prevPageUrl,
  onPageChange,
  onUserUpdated,
}: UsersTableProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const handleActionsClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    user: User
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleClose = () => setAnchorEl(null);

  const handleEditClick = () => {
    if (!selectedUser) return; 
    setEditModalOpen(true);
    handleClose();
  };

  const handleDeletePrompt = () => {
    if (!selectedUser) return;
    setConfirmDeleteOpen(true);
    handleClose();
  };

  const handleDeleteCancel = () => {
    setConfirmDeleteOpen(false);
    setSelectedUser(null); // Clear selected user on cancel
    setDeleteError(null); // Clear delete error on cancel
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      await deleteUser(selectedUser.id);
      const userWithDelete: UserWithDelete = {
        ...selectedUser,
        deleted: true,
      };
      onUserUpdated(userWithDelete);
      setConfirmDeleteOpen(false); // Close dialog on success
      setSelectedUser(null); // Clear selected user
    } catch (error) {
      console.error("Delete user error:", error); // Log the error
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete user"
      );
      // Keep the dialog open on error to show the message
    } finally {
      setDeleteLoading(false);
    }
  };

  // Function to render table content
  const renderTableContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      );
    }

    if (users.length === 0) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <Typography>No users found.</Typography>
        </Box>
      );
    }

    return (
      <Table sx={{ minWidth: 650 }} aria-label="users table">
        <TableHead>
          <TableRow>
            <TableCell>Username</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Organization</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} hover>
              <TableCell component="th" scope="row">
                {user.username}
              </TableCell>
              <TableCell>{user.email || "-"}</TableCell>
              <TableCell>{user.phone || "-"}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>{user.organization?.name || "-"}</TableCell>
              <TableCell align="right">
                <IconButton
                  aria-label={`Actions for ${user.username}`}
                  onClick={(e) => handleActionsClick(e, user)}
                >
                  <EllipsisVertical size={20} />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <Box sx={{ width: "100%" }}>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        {" "}
        {/* Add margin top */}
        {renderTableContent()}
      </TableContainer>

      {/* Keep Popover outside TableContainer */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleEditClick} disabled={!selectedUser}>
          {" "}
          {/* Disable if no user */}
          Edit
        </MenuItem>
        <MenuItem
          onClick={handleDeletePrompt}
          sx={{ color: "error.main" }}
          disabled={!selectedUser}
        >
          {" "}
          {/* Disable if no user */}
          Delete
        </MenuItem>
      </Popover>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDeleteOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            {`Are you sure you want to delete user "${selectedUser?.username || ""}"?`}
          </Typography>
          {/* Display delete error within the dialog */}
          {deleteError && (
            <Typography color="error" sx={{ mt: 2 }}>
              {deleteError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={24} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Modal - Render conditionally but keep it structured */}
      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          open={editModalOpen}
          setOpen={setEditModalOpen}
          onUserUpdated={(updatedUser) => {
            onUserUpdated(updatedUser);
            setSelectedUser(null); // Clear selected user after update
          }}
        />
      )}

      {/* Pagination - Only show if there are users and not loading/error */}
      {!loading && !error && users.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Button
            variant="contained"
            onClick={() => onPageChange(prevPageUrl)}
            disabled={!prevPageUrl} // Loading state is handled by the parent now
          >
            Previous
          </Button>
          <Button
            variant="contained"
            onClick={() => onPageChange(nextPageUrl)}
            disabled={!nextPageUrl} // Loading state is handled by the parent now
          >
            Next
          </Button>
        </Box>
      )}
    </Box>
  );
}
