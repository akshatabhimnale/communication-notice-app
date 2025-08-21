"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Container,
  Typography,
  Skeleton,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import noticeApiClient from "@/services/apiClients/noticeApiClient";
import { getTokenFromCookie, clearTokenCookie } from "@/services/userService";
import { AxiosError } from "axios";
import { fetchNoticeTypesWithTransformedSchemas } from "@/services/noticeService";
import { fetchAllUsers } from "@/services/userService";
import { SchemaField, PaginatedNoticeResponse } from "@/types/noticeTypesInterface";
import { usePathname } from "next/navigation";
import { useSnackbar } from "notistack";
import { Notice } from "@/types/noticeTypesInterface";

interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  organization: {
    id: string;
    name: string;
    address: string;
    phone: string;
    created_at: string;
  };
  organization_id: string;
}

interface NoticeType {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  dynamic_schema?: Record<string, SchemaField>;
  created_at: string;
  assigned_to: string | null;
}

const BulkSend: React.FC = () => {
  const pathname = usePathname();
  const { enqueueSnackbar } = useSnackbar();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedNoticeType, setSelectedNoticeType] = useState<string>("");
  const [selectedBatchName, setSelectedBatchName] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [noticeTypes, setNoticeTypes] = useState<NoticeType[]>([]);
  const [filteredNoticeTypes, setFilteredNoticeTypes] = useState<NoticeType[]>([]);
  const [batchNames, setBatchNames] = useState<string[]>([]);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [totalRows, setTotalRows] = useState(0);
  const [scheduleDate, setScheduleDate] = useState<string>("");

  // Fetch current user ID for non-admin users
  useEffect(() => {
    if (!pathname?.startsWith("/admin")) {
      const fetchCurrentUser = async () => {
        try {
          const token = getTokenFromCookie();
          if (!token) {
            throw new Error("No authentication token found. Please log in.");
          }
          const response = await noticeApiClient.get<{ data: User }>("/users/me/", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setSelectedUserId(response.data.data.id);
        } catch (err) {
          console.error("Error fetching current user:", err);
          if (err instanceof AxiosError && err.response?.status === 401) {
            clearTokenCookie();
            enqueueSnackbar("Authentication failed. Please log in again.", { variant: "error" });
          }
        }
      };
      fetchCurrentUser();
    }
  }, [pathname, enqueueSnackbar]);

  // Fetch all users (only for admin)
  useEffect(() => {
    if (pathname?.startsWith("/admin")) {
      const fetchUsersData = async () => {
        try {
          const usersData = await fetchAllUsers();
          setUsers(usersData);
        } catch (err) {
          console.error("Error fetching users:", err);
        }
      };
      fetchUsersData();
    }
  }, [pathname]);

  // Fetch all notice types
  useEffect(() => {
    const fetchAllNoticeTypes = async () => {
      try {
        let allNoticeTypes: NoticeType[] = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const response = await fetchNoticeTypesWithTransformedSchemas(page);
          allNoticeTypes = [...allNoticeTypes, ...response.results];
          hasMore = !!response.next;
          page++;
        }
        setNoticeTypes(allNoticeTypes);
        setFilteredNoticeTypes(allNoticeTypes);
      } catch (err) {
        console.error("Error fetching notice types:", err);
      }
    };
    fetchAllNoticeTypes();
  }, []);

  // Filter notice types based on selected user
  useEffect(() => {
    if (selectedUserId) {
      const filtered = noticeTypes.filter((type) => type.assigned_to === selectedUserId);
      setFilteredNoticeTypes(filtered);
      setSelectedNoticeType("");
      setBatchNames([]);
      setSelectedBatchName("");
    } else {
      setFilteredNoticeTypes(noticeTypes);
      setSelectedNoticeType("");
      setBatchNames([]);
      setSelectedBatchName("");
    }
  }, [selectedUserId, noticeTypes]);

  // Fetch batch names based on selected notice type
  useEffect(() => {
    const fetchBatchNames = async () => {
      if (!selectedNoticeType) {
        setBatchNames([]);
        setSelectedBatchName("");
        return;
      }
      const token = getTokenFromCookie();
      if (!token) {
        enqueueSnackbar("No authentication token found. Please log in.", { variant: "error" });
        return;
      }
      try {
        const params = { notice_type: selectedNoticeType };
        const queryString = new URLSearchParams(params).toString();
        console.log(`Fetching batch names with URL: /bulk-notices/batch-names/?${queryString}`);
        const response = await noticeApiClient.get<{
          success: boolean;
          data: { batch_names: string[] };
          errors: object;
          meta: object;
        }>(`/bulk-notices/batch-names/?${queryString}`);
        const batchNamesData = response.data.data?.batch_names || [];
        if (batchNamesData.length === 0) {
          console.warn("No batch names found for the selected notice type.");
        }
        setBatchNames(batchNamesData);
        setSelectedBatchName("");
      } catch (err: unknown) {
        console.error("Error fetching batch names:", err);
        if (err instanceof AxiosError && err.response?.status === 401) {
          clearTokenCookie();
          enqueueSnackbar("Authentication failed. Please log in again.", { variant: "error" });
        }
        setBatchNames([]);
      }
    };
    fetchBatchNames();
  }, [selectedNoticeType, enqueueSnackbar]);

  // Fetch notices with filters and pagination
  const loadNotices = useCallback(
    async (page: number) => {
      setInitialLoading(true);
      setError(null);
      try {
        const params: Record<string, unknown> = { page: page + 1 }; // API page is 1-based
        if (selectedUserId) params.user_id = selectedUserId;
        if (selectedNoticeType) params.notice_type = selectedNoticeType;
        if (selectedBatchName) params.batch_name = selectedBatchName;

        const response = await noticeApiClient.get<PaginatedNoticeResponse>("/notices/", { params });
        if (!Array.isArray(response.data.results)) {
          throw new Error("Invalid data format. Expected an array in results.");
        }
        setNotices(response.data.results);
        setTotalRows(response.data.count);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load notices");
      } finally {
        setInitialLoading(false);
      }
    },
    [selectedUserId, selectedNoticeType, selectedBatchName]
  );

  // Reset page to 0 when filters change
  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, [selectedUserId, selectedNoticeType, selectedBatchName]);

  // Fetch notices when page or filters change
  useEffect(() => {
    loadNotices(paginationModel.page);
  }, [loadNotices, paginationModel.page]);

  const handleSubmit = async () => {
    const token = getTokenFromCookie();
    if (!token) {
      enqueueSnackbar("No authentication token found. Please log in.", { variant: "error" });
      return;
    }

    const payload = {
      created_by: selectedUserId,
      notice_type: selectedNoticeType,
      batch_name: selectedBatchName || null,
    };

    console.log("Submitting data to bulk-send API:", payload);

    try {
      const response = await noticeApiClient.post("/bulk-notices/bulk-send/", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      enqueueSnackbar(response.data.message || "Bulk send initiated successfully.", { variant: "success" });
      console.log("API Response:", response.data);
      // Refetch notices to reflect any changes
      loadNotices(paginationModel.page);
    } catch (err) {
      console.error("Error submitting bulk send:", err);
      if (err instanceof AxiosError) {
        enqueueSnackbar(
          err.response?.data?.errors
            ? `Error: ${JSON.stringify(err.response.data.errors)}`
            : "Failed to submit bulk send. Please try again.",
          { variant: "error" }
        );
      } else {
        enqueueSnackbar("An unexpected error occurred.", { variant: "error" });
      }
    }
  };

  const columns: GridColDef[] = [
    {
      field: "srNo",
      headerName: "Sr No",
      width: 80,
      renderCell: (params) => {
        const index = notices.findIndex((notice) => notice.id === params.row.id);
        return <span>{paginationModel.page * paginationModel.pageSize + index + 1}</span>;
      },
    },
    {
      field: "id",
      headerName: "ID",
      flex: 1,
      renderCell: (params) => <span>{params.value || "-"}</span>,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.8,
      renderCell: (params) => <span>{params.value || "-"}</span>,
    },
    {
      field: "priority",
      headerName: "Priority",
      flex: 0.8,
      renderCell: (params) => <span>{params.value || "-"}</span>,
    },
    {
      field: "created_at",
      headerName: "Created At",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => {
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
      },
    },
  ];

  const DataGridSkeleton = () => (
    <Box sx={{ height: 400, width: "100%" }}>
      <Skeleton
        variant="rectangular"
        sx={{ width: "100%", height: 45, mb: 2, borderRadius: 1 }}
        animation="wave"
      />
      {[...Array(paginationModel.pageSize)].map((_, rowIndex) => (
        <Box key={rowIndex} sx={{ display: "flex", gap: 1, mb: 1 }}>
          {[...Array(5)].map((_, colIndex) => (
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

  if (error) {
    return (
      <Container>
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography color="error">{error}</Typography>
          <Button variant="contained" onClick={() => loadNotices(paginationModel.page)} sx={{ mt: 2 }}>
            Retry
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ padding: "40px", display: "flex", flexDirection: "column", gap: "30px", width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
        <Box sx={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          {pathname?.startsWith("/admin") && (
            <FormControl sx={{ flex: 1, minWidth: "200px" }}>
              <InputLabel>Select User*</InputLabel>
              <Select
                label="Select User*"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value as string)}
              >
                <MenuItem value="" disabled>
                  Select User
                </MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {`${user.first_name} ${user.last_name} (${user.email})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <FormControl sx={{ flex: 1, minWidth: "200px" }}>
            <InputLabel>Select Notice Type*</InputLabel>
            <Select
              label="Select Notice Type*"
              value={selectedNoticeType}
              onChange={(e) => setSelectedNoticeType(e.target.value as string)}
              disabled={pathname?.startsWith("/admin") && !selectedUserId}
            >
              <MenuItem value="" disabled>
                Select Notice Type
              </MenuItem>
              {filteredNoticeTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ flex: 1, minWidth: "200px" }}>
            <InputLabel>Select Batch Name</InputLabel>
            <Select
              label="Select Batch Name"
              value={selectedBatchName}
              onChange={(e) => setSelectedBatchName(e.target.value as string)}
              disabled={!selectedNoticeType}
            >
              <MenuItem value="" disabled>
                Select Batch Name
              </MenuItem>
              {batchNames.length === 0 && selectedNoticeType && (
                <MenuItem value="" disabled>
                  No batch names available
                </MenuItem>
              )}
              {batchNames.map((batch) => (
                <MenuItem key={batch} value={batch}>
                  {batch}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <TextField
            label="From Notice Id"
            variant="filled"
            InputProps={{ disableUnderline: true }}
            sx={{ flex: 1, minWidth: "150px" }}
          />
          <TextField
            label="To Notice Id"
            variant="filled"
            InputProps={{ disableUnderline: true }}
            sx={{ flex: 1, minWidth: "150px" }}
          />
          <TextField
            label="Except Notice Id"
            variant="filled"
            InputProps={{ disableUnderline: true }}
            sx={{ flex: 1, minWidth: "150px" }}
          />
          <FormControl sx={{ flex: 1, minWidth: "150px" }}>
            <TextField
              type="date"
              variant="filled"
              label="Schedule Date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              InputProps={{ disableUnderline: true }}
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiInputBase-input": {
                  paddingTop: "20px",
                },
              }}
            />
          </FormControl>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="contained" sx={{ width: "200px" }} onClick={handleSubmit}>
            Submit
          </Button>
        </Box>
        <Box sx={{ width: "100%", mt: 4 }}>
          {initialLoading ? (
            <DataGridSkeleton />
          ) : notices.length === 0 ? (
            <Typography textAlign="center" color="text.secondary">
              No notices available
            </Typography>
          ) : (
            <DataGrid
              rows={notices}
              columns={columns}
              getRowId={(row) => row.id}
              paginationMode="server"
              rowCount={totalRows}
              disableRowSelectionOnClick
              autoHeight
              hideFooterSelectedRowCount
              pageSizeOptions={[10]}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
            />
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default BulkSend;