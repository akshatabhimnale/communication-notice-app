"use client";

import React, { useEffect, useState, useCallback } from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
  Button,
  Container,
  Skeleton,
  Box,
  Typography,
  Autocomplete,
  TextField,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import Link from "next/link";
import { Trash2, Edit, Download, Search } from "lucide-react";
import jsPDF from "jspdf";
import noticeApiClient from "@/services/apiClients/noticeApiClient";
import { getTokenFromCookie, clearTokenCookie } from "@/services/userService";
import { AxiosError } from "axios";
import { fetchAllUsers } from "@/services/userService";
import { fetchNoticeTypesWithTransformedSchemas } from "@/services/noticeService";
import { SchemaField, PaginatedNoticeResponse } from "@/types/noticeTypesInterface";
import { usePathname } from "next/navigation";

interface Recipient {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface Notice {
  id?: string;
  notice_type?: string;
  dynamic_data?: {
    recipients?: Recipient[] | string[];
    templateContent?: string;
    schema?: unknown;
    [key: string]: unknown;
  };
  created_by?: string;
  status?: string;
  priority?: string;
  created_at?: string;
  updated_at?: string;
}

interface ApiResponse {
  success: boolean;
  data: Notice;
  errors: Record<string, string[]>;
  meta: Record<string, string | number | boolean>;
}

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

export default function NoticePage() {
  const pathname = usePathname();

  const [notices, setNotices] = useState<Notice[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [totalRows, setTotalRows] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [inputUserValue, setInputUserValue] = useState<string>("");
  const [selectedNoticeType, setSelectedNoticeType] = useState<string | null>(null);
  const [inputNoticeTypeValue, setInputNoticeTypeValue] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [noticeTypes, setNoticeTypes] = useState<NoticeType[]>([]);
  const [filteredNoticeTypes, setFilteredNoticeTypes] = useState<NoticeType[]>([]);

  const loadNotices = useCallback(async (page: number) => {
    setInitialLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = { page: page + 1 }; // API page is 1-based
      if (selectedUserId) params.user_id = selectedUserId;
      if (selectedNoticeType) params.notice_type = selectedNoticeType;

      const response = await noticeApiClient.get<PaginatedNoticeResponse>("/notices/", { params });
      console.log('data is here',response.data);
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
  }, [selectedUserId, selectedNoticeType]);

  // Reset page to 0 when filters change
  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, [selectedUserId, selectedNoticeType]);

  // Fetch notices when page or filters change (after page reset)
  useEffect(() => {
    loadNotices(paginationModel.page);
  }, [loadNotices, paginationModel.page]);

  // Fetch all users (only needed for admin)
  useEffect(() => {
    if (pathname?.startsWith("/admin")) {
      const fetchInitialData = async () => {
        try {
          const usersData = await fetchAllUsers();
          setUsers(usersData);
        } catch (err) {
          console.error("Error fetching users:", err);
        }
      };
      fetchInitialData();
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
        setFilteredNoticeTypes(allNoticeTypes); // Initially, show all notice types
      } catch (err) {
        console.error("Error fetching notice types:", err);
      }
    };
    fetchAllNoticeTypes();
  }, []);

  // Filter notice types based on selected user
  useEffect(() => {
    if (selectedUserId && pathname?.startsWith("/admin")) {
      const filtered = noticeTypes.filter(
        (type) => type.assigned_to === selectedUserId 
      );
      setFilteredNoticeTypes(filtered);
      setSelectedNoticeType(null); // Reset notice type selection when user changes
    } else {
      setFilteredNoticeTypes(noticeTypes); // Show all notice types if no user selected or not admin
      setSelectedNoticeType(null);
    }
  }, [selectedUserId, noticeTypes, pathname]);

  const handleDelete = async (id: string) => {
    try {
      await noticeApiClient.delete(`/notices/${id}/`);
      // Refetch current page after delete
      loadNotices(paginationModel.page);
    } catch (err) {
      console.error("Error deleting notice:", err);
    }
  };

  const handleDownload = async (notice: Notice) => {
    try {
      if (!notice.id) {
        throw new Error("Invalid notice ID");
      }

      const token = getTokenFromCookie();
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      console.log(`Fetching notice with ID: ${notice.id}`);
      const response = await noticeApiClient.get<ApiResponse>(`/notices/${notice.id}/`);
      const fullNotice = response.data.data;
      console.log("Fetched notice data:", fullNotice);

      if (!fullNotice || !fullNotice.id) {
        throw new Error("Invalid notice data received from API");
      }


      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Qodeways Finance Pvt. Ltd.", 50, 50);
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Notice ID: ${fullNotice.id || "-"}`, 400, 50);
      doc.text(
        `Date: ${fullNotice.created_at ? new Date(fullNotice.created_at).toLocaleDateString("en-GB") : "-"}`,
        400,
        65
      );

      let recipients = "-";
      if (Array.isArray(fullNotice.dynamic_data?.recipients)) {
        recipients = fullNotice.dynamic_data.recipients
          .map((r: Recipient | string) => {
            if (typeof r === "string") return r;
            const parts = [r.name || "", r.email || "", r.phone || "", r.address || ""].filter(Boolean);
            return parts.join(", ");
          })
          .filter(Boolean)
          .join("\n");
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("To:", 50, 100);
      doc.setFont("helvetica", "normal");
      doc.text(recipients, 50, 110);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(`Subject: ${fullNotice.notice_type || "Notice"}`, 50, 140);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text("Dear Sir/Madam,", 50, 160);
      doc.text(
        "This notice is issued by Qodeways Finance Pvt. Ltd., a non-banking financial company registered with the Reserve Bank of India, having its registered office at Level 4, Mock Tower, Sector 99, Mumbai - 400001.",
        50,
        180,
        { maxWidth: 500 }
      );

      doc.setFont("helvetica", "bold");
      doc.text("Notice Details:", 50, 220);
      doc.setFont("helvetica", "normal");
      doc.text(`Notice Type: ${fullNotice.notice_type || "-"}`, 50, 235);
      doc.text(`Status: ${fullNotice.status || "-"}`, 50, 250);
      doc.text(`Priority: ${fullNotice.priority || "-"}`, 50, 265);
      doc.text(
        `Created At: ${fullNotice.created_at ? new Date(fullNotice.created_at).toLocaleString() : "-"}`,
        50,
        280
      );
      doc.text(
        `Updated At: ${fullNotice.updated_at ? new Date(fullNotice.updated_at).toLocaleString() : "-"}`,
        50,
        295
      );

      let yPos = 315;
      if (fullNotice.dynamic_data && Object.keys(fullNotice.dynamic_data).length) {
        doc.setFont("helvetica", "bold");
        doc.text("Dynamic Data:", 50, yPos);
        yPos += 15;
        doc.setFont("helvetica", "normal");
        for (const [key, value] of Object.entries(fullNotice.dynamic_data)) {
          if (key !== "recipients" && key !== "templateContent" && key !== "schema") {
            const valueStr = String(value);
            doc.text(`${key}: ${valueStr}`, 50, yPos, { maxWidth: 400 });
            yPos += 15 + (valueStr.split("\n").length * 10);
          }
        }
      }

      const templateContent = String(fullNotice.dynamic_data?.templateContent || fullNotice.dynamic_data?.content || "-");
      doc.setFont("helvetica", "bold");
      doc.text("Template Content:", 50, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(templateContent, 50, yPos + 15, { maxWidth: 400 });
      yPos += 30 + (templateContent.split("\n").length * 10);

      const schema = fullNotice.dynamic_data?.schema
        ? JSON.stringify(fullNotice.dynamic_data.schema, null, 2)
        : "-";
      doc.setFont("helvetica", "bold");
      doc.text("Schema:", 50, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(schema, 50, yPos + 15, { maxWidth: 400 });
      yPos += 30 + (schema.split("\n").length * 10);

      doc.setFont("helvetica", "bold");
      doc.text("Contact:", 50, yPos);
      doc.setFont("helvetica", "normal");
      doc.text("Email: support@qodeways.com", 50, yPos + 15);
      doc.text("Phone: +91-9999999999", 50, yPos + 30);
      yPos += 45;

      doc.text("Sincerely,", 50, yPos);
      doc.text("Legal Department", 50, yPos + 15);
      doc.text("Qodeways Finance Pvt. Ltd.", 50, yPos + 30);

      doc.save(`notice-${fullNotice.id}.pdf`);
    } catch (err: unknown) {
      const error = err as AxiosError<{ detail?: string }>;
      console.error("Error generating PDF:", error.message, error.stack);
      if (error.response?.status === 401) {
        clearTokenCookie();
        alert("Authentication failed. Your session may have expired. Please log in again.");
      } else {
        alert(`Failed to generate PDF: ${error.message || "Unknown error"}. Response: ${JSON.stringify(error.response?.data || {})}`);
      }
    }
  };

  const columns: GridColDef[] = [
    {
      field: "srNo",
      headerName: "Sr No",
      width: 80,
      renderCell: (params) => {
        // Since server pagination, srNo = (page * pageSize) + index + 1
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
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", gap: "8px" }}>
          {pathname?.startsWith("/admin") && (
            <>
              <Button
                component={Link}
                href={`/admin/notices/edit/${params.row.id}`}
                color="primary"
                variant="contained"
                size="small"
                startIcon={<Edit size={16} />}
              >
                Edit
              </Button>
              <Button
                color="error"
                variant="text"
                size="small"
                onClick={() => handleDelete(params.row.id)}
              >
                <Trash2 size={16} />
              </Button>
            </>
          )}
          <Button
            color="inherit"
            variant="text"
            size="small"
            onClick={() => handleDownload(params.row as Notice)}
            disabled={!params.row.id}
          >
            <Download size={16} />
          </Button>
        </Box>
      ),
      width: 200,
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

  if (error) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography color="error">{error}</Typography>
        <Button variant="contained" onClick={() => loadNotices(paginationModel.page)} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Container>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {pathname?.startsWith("/admin") && (
            <Autocomplete
              options={users}
              getOptionLabel={(option) => `${option.first_name} ${option.last_name} (${option.email})`}
              value={users.find((u) => u.id === selectedUserId) || null}
              onChange={(_, newValue) => setSelectedUserId(newValue?.id || null)}
              inputValue={inputUserValue}
              onInputChange={(_, newInputValue) => setInputUserValue(newInputValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Filter by User"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search size={16} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: 200 }}
                />
              )}
            />
          )}
          <Autocomplete
            options={filteredNoticeTypes}
            getOptionLabel={(option) => option.name}
            value={filteredNoticeTypes.find((nt) => nt.id === selectedNoticeType) || null}
            onChange={(_, newValue) => setSelectedNoticeType(newValue?.id || null)}
            inputValue={inputNoticeTypeValue}
            onInputChange={(_, newInputValue) => setInputNoticeTypeValue(newInputValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Filter by Notice Type"
                size="small"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={16} />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 200 }}
              />
            )}
            disabled={pathname?.startsWith("/admin") && !selectedUserId}
          />
        </Box>
        <Button
          component={Link}
          href={pathname?.startsWith("/admin") ? "/admin/notices/create" : "/user/notices/create"}
          variant="contained"
          color="primary"
          size="medium"
        >
          Create Notice
        </Button>
      </Box>

      <Box sx={{ width: "100%", position: "relative" }}>
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
    </Container>
  );
}