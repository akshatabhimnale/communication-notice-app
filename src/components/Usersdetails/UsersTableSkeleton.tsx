import React from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Skeleton
} from "@mui/material";

const columns = [
  { width: 120 },
  { width: 200 },
  { width: 100 },
  { width: 100 },
  { width: 120 },
];

function UsersTableSkeleton() {
  return (
    <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
      <Table aria-label="users table loading">
        <TableHead>
          <TableRow>
            <TableCell><Skeleton variant="text" width={80} /></TableCell>
            <TableCell><Skeleton variant="text" width={120} /></TableCell>
            <TableCell><Skeleton variant="text" width={60} /></TableCell>
            <TableCell><Skeleton variant="text" width={70} /></TableCell>
            <TableCell><Skeleton variant="text" width={90} /></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {[...Array(8)].map((_, rowIdx) => (
            <TableRow key={rowIdx}>
              {columns.map((col, colIdx) => (
                <TableCell key={colIdx}>
                  <Skeleton variant="rectangular" width={col.width} height={30} animation="wave" sx={{ borderRadius: 1 }} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default UsersTableSkeleton;
