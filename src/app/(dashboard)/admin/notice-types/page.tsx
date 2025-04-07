"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { fetchNoticeTypes } from "@/services/noticeService";
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import { NoticeType } from "@/services/noticeService";


export default function NoticeTypesList() {
  const router = useRouter();
  const [noticeTypes, setNoticeTypes] = useState<NoticeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadNotice = async () => {
      try {
        const data = await fetchNoticeTypes();
        // console.log("Fetched notice types:", data);
        if (!Array.isArray(data)) {
          throw new Error("Invalid data format. Expected an array.");
        }
        setNoticeTypes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load notice types");
      } finally {
        setLoading(false);
      }
    };
    loadNotice();
  }, []);

  const columns: GridColDef<NoticeType>[] = [
    { field: "name", headerName: "Display Name", width: 200 },
    { field: "id", headerName: "System Name", width: 250 },
    {
      field: "description",
      headerName: "Description",
      width: 300,
      valueGetter: (params: GridRenderCellParams<NoticeType>) => {
        const description = params as unknown as string | null | undefined; 
        return description
          ? description.slice(0, 50) + (description.length > 50 ? "..." : "")
          : "No description available";
      },
    },
    {
      field: "dynamic_schema",
      headerName: "Fields Count",
      width: 150,
      valueGetter: (params: GridRenderCellParams<NoticeType>) =>
        Object.keys(params).length, 
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params: GridRenderCellParams<NoticeType>) => {
        if (!params.row) {
          console.error("params.row is undefined in actions renderCell", params);
          return <Box>Invalid Row</Box>;
        }
        return (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              color="primary"
            >
              Edit
            </Button>
            <Button size="small" variant="outlined" color="error">
              Delete
            </Button>
          </Box>
        );
      },
    },
  ];

  const filteredNoticeTypes = noticeTypes.filter((notice) =>
    notice.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography color="error">{error}</Typography>
        <Button variant="contained" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", my: 4 }}>
      {/* <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Notice Types
      </Typography> */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <TextField
          label="Search by Name"
          size="small"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: "300px" }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push("/admin/notice-types/create")}
        >
          Create New
        </Button>
      </Box>
      {filteredNoticeTypes.length === 0 ? (
        <Typography textAlign="center" color="text.secondary">
          No notice types available
        </Typography>
      ) : (
        <DataGrid
          rows={filteredNoticeTypes}
          columns={columns}
          pageSizeOptions={[5, 10, 20]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 5, page: 0 },
            },
          }}
          disableRowSelectionOnClick
          autoHeight
          getRowId={(row) => row.id}
          sx={{
            "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f5f5f5" },
            "& .MuiDataGrid-cell": { py: 1 },
          }}
        />
      )}
    </Box>
  );
}