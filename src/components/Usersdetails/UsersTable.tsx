"use client";
import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import './UsersTable.css'

interface Organization {
  id: number;
  name: string;
  address: string;
  phone: string;
  created_at: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  organization: Organization;
  organization_id: number;
}

interface UsersTableProps {
  users: User[];
  loading: boolean;
  error: string | null;
  nextPageUrl: string | null;
  prevPageUrl: string | null;
  onPageChange: (url: string | null) => void;
}

export default function UsersTable({
  users,
  loading,
  error,
  nextPageUrl,
  prevPageUrl,
  onPageChange,
}: UsersTableProps) {
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
            <TableHead className="users-table-head">
              <TableRow className="users-table-header-row">
                <TableCell className="users-table-header-cell">
                  Username
                </TableCell>
                <TableCell className="users-table-header-cell" align="left">
                  Email
                </TableCell>
                <TableCell className="users-table-header-cell" align="left">
                  Phone
                </TableCell>
                <TableCell className="users-table-header-cell" align="left">
                  Role
                </TableCell>
                <TableCell className="users-table-header-cell" align="left">
                  Organization
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.id}
                  className="users-table-row"
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {user.username}
                  </TableCell>
                  <TableCell align="left">{user.email}</TableCell>
                  <TableCell align="left">{user.phone}</TableCell>
                  <TableCell align="left">{user.role}</TableCell>
                  <TableCell align="left">{user.organization?.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

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
