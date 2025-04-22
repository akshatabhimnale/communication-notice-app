"use client";
import { useState } from "react";
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Button, Box, CircularProgress, Typography, Popover, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import EditUserModal from "./EditUserModal";
import { User, deleteUser } from "@/services/usersService";

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
    setEditModalOpen(true);
    handleClose();
  };

  const handleDeletePrompt = () => {
    setConfirmDeleteOpen(true);
    handleClose();
  };

  const handleDeleteCancel = () => {
    setConfirmDeleteOpen(false);
  };

  /**

   * Handles user deletion confirmation. Calls the usersService to delete the selected user,
   * updates the parent component via onUserUpdated with a deleted flag, manages loading state,
   * and handles errors. Closes the confirmation dialog on successful deletion.
   **/
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
      setConfirmDeleteOpen(false);
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete user"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <TableContainer component={Paper}>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        {!loading && !error && (
          <Table sx={{ minWidth: 650 }} aria-label="users table">
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Organization</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.organization?.name}</TableCell>
                  <TableCell>
                    <Button onClick={(e) => handleActionsClick(e, user)}>
                      ⋮
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleEditClick}>Edit</MenuItem>
        <MenuItem onClick={handleDeletePrompt} sx={{ color: "error.main" }}>
          Delete
        </MenuItem>
      </Popover>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDeleteOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {selectedUser?.username}?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
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

      {deleteError && (
        <Typography color="error" sx={{ mt: 2 }}>
          {deleteError}
        </Typography>
      )}

      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          open={editModalOpen}
          setOpen={setEditModalOpen}
          onUserUpdated={onUserUpdated}
        />
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
        <Button
          variant="contained"
          onClick={() => onPageChange(prevPageUrl)}
          disabled={!prevPageUrl || loading}
        >
          Previous
        </Button>
        <Button
          variant="contained"
          onClick={() => onPageChange(nextPageUrl)}
          disabled={!nextPageUrl || loading}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
}