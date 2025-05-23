"use client";

import { AppDispatch, RootState } from "@/store";
import {
  deleteNoticeThunk,
  fetchNoticesThunk,
} from "@/store/slices/noticeSlice";
import {
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import Link from "next/link";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function NoticePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { notices, loading, error } = useSelector(
    (state: RootState) => state.notice
  );

  useEffect(() => {
    dispatch(fetchNoticesThunk());
  }, [dispatch]);

  const handleDelete = (id: string) => {
    dispatch(deleteNoticeThunk(id));
  };

  return (
    <Container>
      <Button
        component={Link}
        href="/dashboard/admin/notices/create"
        variant="outlined"
        color="secondary"
        size="small"
        sx={{ mb: 2 }}
      >
        Create Notice
      </Button>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Title</strong>
                </TableCell>
                <TableCell>
                  <strong>Description</strong>
                </TableCell>
                <TableCell>
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notices.map((notice) => (
                <TableRow key={notice.id}>
                  <TableCell>{notice.title}</TableCell>
                  <TableCell>{notice.description}</TableCell>
                  <TableCell>
                    <Button
                      component={Link}
                      href={`/dashboard/admin/notices/edit/${notice.id}`}
                      variant="contained"
                      color="primary"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(notice.id!)}
                      variant="contained"
                      color="error"
                      sx={{ ml: 1 }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}
