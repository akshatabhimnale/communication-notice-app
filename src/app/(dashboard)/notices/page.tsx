"use client";

import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { AppDispatch, RootState } from "@/store";
import {
  deleteNoticeThunk,
  fetchNoticesThunk,
} from "@/store/slices/noticeSlice";
import {
  Button,
  Container,
  Skeleton,
  Box,
} from "@mui/material";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { Trash2, Edit } from "lucide-react";

export default function NoticePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { notices, loading, error } = useSelector(
    (state: RootState) => state.notice
  );

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  useEffect(() => {
    dispatch(fetchNoticesThunk());
  }, [dispatch]);

  const handleDelete = (id: string) => {
    dispatch(deleteNoticeThunk(id))
      .then((res) => {
        console.log("Notice deleted successfully:", res);
      })
      .catch((err) => {
        console.error("Error deleting notice:", err);
      });
  };
  const columns: GridColDef[] = [
    { 
      field: "srNo", 
      headerName: "Sr No", 
      width: 80,
      renderCell: (params) => {
        const index = notices.findIndex(notice => notice.id === params.row.id);
        return <span>{index + 1}</span>;
      }
    },
    { 
      field: "id", 
      headerName: "ID", 
      flex: 1,
      renderCell: (params) => {
        return <span>{params.value || "-"}</span>;
      }
    },
    { 
      field: "status", 
      headerName: "Status", 
      flex: 0.8,
      renderCell: (params) => {
        return <span>{params.value || "-"}</span>;
      }
    },
    { 
      field: "priority", 
      headerName: "Priority", 
      flex: 0.8,
      renderCell: (params) => {
        return <span>{params.value || "-"}</span>;
      }
    },
    {
      field: "created_at",
      headerName: "Created At",
      flex: 1,
      renderCell: (params) => {
        if (params.row.created_at || params.row.createdAt) {
          try {
            const date = new Date(params.row.created_at || params.row.createdAt);
            if (!isNaN(date.getTime())) {
              return <span>{date.toLocaleString()}</span>;
            }
          } catch (error) {
            console.error("Error formatting date:", error);
          }
        }
        return <span>-</span>;
      }
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            component={Link}
            href={`/dashboard/admin/notices/edit/${params.row.id}`}
            color="primary"
            variant="contained"
            size="small"
            startIcon={<Edit size={16} />}
            style={{ cursor: "pointer" }}
          >
            Edit
          </Button>
          <Button
            color="error"
            variant="text"
            size="small"
            onClick={() => handleDelete(params.row.id)}
            style={{ cursor: "pointer" }}
          >
            <Trash2 />
          </Button>
        </div>
      ),
      width: 150,
    },
  ];

  // Skeleton Loader Component
  const DataGridSkeleton = () => (
    <Box sx={{ height: 400, width: '100%' }}>
      <Skeleton
        variant="rectangular"
        sx={{ width: '100%', height: 45, mb: 2, borderRadius: 1 }}
        animation="wave"
      />      {[...Array(paginationModel.pageSize)].map((_, rowIndex) => (
        <Box key={rowIndex} sx={{ display: 'flex', gap: 1, mb: 1 }}>
          {[...Array(6)].map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              variant="rectangular"
              sx={{ flex: 1, height: 45, borderRadius: 1 }}
              animation="wave"
            />
          ))}
        </Box>
      ))}
    </Box>
  );

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

      <div style={{ width: "100%" }}>
        {error && <p style={{ color: "red" }}>Error: {error}</p>}
        {loading ? (
          <DataGridSkeleton />
        ) : (
          <DataGrid
            rows={notices}
            columns={columns}
            getRowId={(row) => row.id}
            pagination={true}
            disableRowSelectionOnClick
            autoHeight
            hideFooterSelectedRowCount
            pageSizeOptions={[10, 25, 50]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
          />
        )}
      </div>
    </Container>
  );
}
