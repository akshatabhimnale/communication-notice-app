"use client";
import React, { useEffect, useState } from "react";
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
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { fetchNoticesThunk } from "@/store/slices/noticeSlice";
import noticeApiClient from "@/services/apiClients/noticeApiClient";
import { getTokenFromCookie, clearTokenCookie } from "@/services/userService";
import { AxiosError } from "axios";
import { fetchNoticeTypesWithTransformedSchemas } from "@/services/noticeService";
import { fetchAllUsers } from "@/services/userService";
import { SchemaField } from "@/types/noticeTypesInterface";
import { usePathname } from "next/navigation";

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
  dynamic_schema: Record<string, SchemaField>;
  created_at: string;
  assigned_to: string | null;
}

const BulkSend: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { notices, loading, error } = useSelector((state: RootState) => state.notice);
  const pathname = usePathname();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedNoticeType, setSelectedNoticeType] = useState<string>("");
  const [selectedBatchName, setSelectedBatchName] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [noticeTypes, setNoticeTypes] = useState<NoticeType[]>([]);
  const [filteredNoticeTypes, setFilteredNoticeTypes] = useState<NoticeType[]>([]);
  const [batchNames, setBatchNames] = useState<string[]>([]);
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });

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
            throw new Error("Authentication failed. Please log in again.");
          }
        }
      };
      fetchCurrentUser();
    }
  }, [pathname]);

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
      const filtered = noticeTypes.filter(
        (type) => type.assigned_to === selectedUserId
      );
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
        throw new Error("No authentication token found. Please log in.");
      }
      try {
        const params = { notice_type: selectedNoticeType };
        const queryString = new URLSearchParams(params).toString();
        console.log(`Fetching batch names with URL: /bulk-notices/batch-names/?${queryString}`);
        const response = await noticeApiClient.get<{ data: { batch_names: string[] } }>(`/bulk-notices/batch-names/?${queryString}`);
        console.log("Batch names response:", response.data); // Debug the full response
        const batchNamesData = response.data.data?.batch_names || [];
        setBatchNames(batchNamesData);
        setSelectedBatchName("");
      } catch (err: unknown) {
        console.error("Error fetching batch names:", err);
        if (err instanceof AxiosError) {
          if (err.response?.status === 401) {
            clearTokenCookie();
            throw new Error("Authentication failed. Please log in again.");
          }
          console.error("API Error:", err.response?.data);
          setBatchNames([]); // Fallback to empty array on error
        }
        setBatchNames([]); // Fallback to empty array on unexpected error
      }
    };
    fetchBatchNames();
  }, [selectedNoticeType]);

  // Fetch notices with filters
  useEffect(() => {
    const params: Record<string, string> = {};
    if (selectedUserId) params["user_id"] = selectedUserId;
    if (selectedNoticeType) params["notice_type"] = selectedNoticeType;
    if (selectedBatchName) params["batch_name"] = selectedBatchName;

    dispatch(fetchNoticesThunk(params))
      .then((res) => {
        console.log("Fetched notices:", res.payload);
      })
      .catch((err) => {
        console.error("Error fetching notices:", err);
      });
  }, [dispatch, selectedUserId, selectedNoticeType, selectedBatchName]);

  const columns: GridColDef[] = [
    {
      field: "srNo",
      headerName: "Sr No",
      width: 80,
      renderCell: (params) => {
        const index = notices.findIndex((notice) => notice.id === params.row.id);
        return <span>{index + 1}</span>;
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
      <Box sx={{ padding: "40px", display: "flex", flexDirection: "column", gap: "30px", width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
        {pathname?.startsWith("/admin") && (
          <FormControl fullWidth>
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
        <Box sx={{ display: "flex", gap: "30px" }}>
          <FormControl fullWidth sx={{ flex: 1 }}>
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
          <FormControl fullWidth sx={{ flex: 1 }}>
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
              {batchNames.map((batch) => (
                <MenuItem key={batch} value={batch}>
                  {batch}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: "flex", gap: "30px" }}>
          <TextField
            label="From Notice Id *"
            variant="filled"
            value="From ex. IN12-1234"
            InputProps={{ disableUnderline: true }}
            sx={{ flex: 1 }}
          />
          <TextField
            label="To Notice Id *"
            variant="filled"
            value="To ex. IN12-2345"
            InputProps={{ disableUnderline: true }}
            sx={{ flex: "1" }}
          />
          <TextField
            label="Except Notice Id"
            variant="filled"
            value="Except ex. IN12-23,IN12-34,IN12-45"
            InputProps={{ disableUnderline: true }}
            sx={{ flex: 1 }}
          />
        </Box>
        <Box sx={{ display: "flex", gap: "30px" }}>
          <FormControl fullWidth sx={{ flex: 1 }}>
            <InputLabel>Schedule Date :</InputLabel>
            <TextField
              type="date"
              variant="filled"
              defaultValue="2025-07-23"
              InputProps={{ disableUnderline: true }}
            />
          </FormControl>
        </Box>
        <Button variant="contained" sx={{ width: "200px" }}>
          Submit
        </Button>
        <Box sx={{ width: "100%", mt: 4 }}>
          {error && <Typography color="error">Error: {error}</Typography>}
          {loading ? (
            <DataGridSkeleton />
          ) : (
            <>
              <Typography variant="body2" color="textSecondary">
                Debug: Notices count: {notices.length}
              </Typography>
              <DataGrid
                rows={notices}
                columns={columns}
                getRowId={(row) => row.id}
                pagination
                disableRowSelectionOnClick
                autoHeight
                hideFooterSelectedRowCount
                pageSizeOptions={[10, 25, 50]}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
              />
            </>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default BulkSend;