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
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { Trash2, Edit, Download } from "lucide-react";
import jsPDF from "jspdf";
import noticeApiClient from "@/services/apiClients/noticeApiClient";
import { getTokenFromCookie, clearTokenCookie } from "@/services/userService";
import { AxiosError } from "axios";

interface Recipient {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface Notice {
  id: string;
  notice_type?: string;
  dynamic_data?: {
    recipients?: Recipient[] | string[];
    templateContent?: string;
    schema?: unknown; // Replaced any with unknown
    [key: string]: unknown; // Replaced any with unknown
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
  errors: Record<string, string[]>; // Replaced any with string[]
  meta: Record<string, string | number | boolean>; // Replaced any with specific types
}

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
    dispatch(fetchNoticesThunk())
      .then((res) => {
        console.log("Fetched notices:", res.payload);
      })
      .catch((err) => {
        console.error("Error fetching notices:", err);
      });
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

  const handleDownload = async (notice: Notice) => {
    try {
      if (!notice.id) {
        throw new Error("Invalid notice ID");
      }

      const token = getTokenFromCookie();
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      // Fetch notice details
      console.log(`Fetching notice with ID: ${notice.id}`);
      const response = await noticeApiClient.get<ApiResponse>(`/notices/${notice.id}/`);
      const fullNotice = response.data.data;
      console.log("Fetched notice data:", fullNotice);

      if (!fullNotice || !fullNotice.id) {
        throw new Error("Invalid notice data received from API");
      }

      // Initialize jsPDF
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      // Header
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

      // Recipients
      let recipients = "-";
      if (Array.isArray(fullNotice.dynamic_data?.recipients)) {
        recipients = fullNotice.dynamic_data.recipients
          .map((r: Recipient | string) => {
            if (typeof r === "string") {
              return r;
            }
            const parts = [
              r.name || "",
              r.email || "",
              r.phone || "",
              r.address || "",
            ].filter(Boolean);
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

      // Subject
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(`Subject: ${fullNotice.notice_type || "Notice"}`, 50, 140);

      // Body
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text("Dear Sir/Madam,", 50, 160);
      doc.text(
        "This notice is issued by Qodeways Finance Pvt. Ltd., a non-banking financial company registered with the Reserve Bank of India, having its registered office at Level 4, Mock Tower, Sector 99, Mumbai - 400001.",
        50,
        180,
        { maxWidth: 500 }
      );

      // Notice Details
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

      // Dynamic Data
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

      // Template Content
      const templateContent = String(fullNotice.dynamic_data?.templateContent || fullNotice.dynamic_data?.content || "-");
      doc.setFont("helvetica", "bold");
      doc.text("Template Content:", 50, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(templateContent, 50, yPos + 15, { maxWidth: 400 });
      yPos += 30 + (templateContent.split("\n").length * 10);

      // Schema
      const schema = fullNotice.dynamic_data?.schema
        ? JSON.stringify(fullNotice.dynamic_data.schema, null, 2)
        : "-";
      doc.setFont("helvetica", "bold");
      doc.text("Schema:", 50, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(schema, 50, yPos + 15, { maxWidth: 400 });
      yPos += 30 + (schema.split("\n").length * 10);

      // Contact
      doc.setFont("helvetica", "bold");
      doc.text("Contact:", 50, yPos);
      doc.setFont("helvetica", "normal");
      doc.text("Email: support@qodeways.com", 50, yPos + 15);
      doc.text("Phone: +91-9999999999", 50, yPos + 30);
      yPos += 45;

      // Signature
      doc.text("Sincerely,", 50, yPos);
      doc.text("Legal Department", 50, yPos + 15);
      doc.text("Qodeways Finance Pvt. Ltd.", 50, yPos + 30);

      // Save PDF
      doc.save(`notice-${fullNotice.id}.pdf`);
    } catch (err: unknown) { // Replaced any with unknown
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
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            component={Link}
            href="/dashboard/admin/notices/edit/${params.row.id}"
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
            <Trash2 size={16} />
          </Button>
          <Button
            color="inherit"
            variant="text"
            size="small"
            onClick={() => handleDownload(params.row as Notice)}
            style={{ cursor: "pointer" }}
            disabled={!params.row.id}
          >
            <Download size={16} />
          </Button>
        </div>
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

  return (
    <Container>
      <Button
        component={Link}
        href="/admin/notices/create"
        variant="outlined"
        color="secondary"
        size="small"
        sx={{ mb: 2 }}
      >
        Create Notice
      </Button>

      <div style={{ width: "100%" }}>
        {error && <Typography style={{ color: "red" }}>Error: {error}</Typography>}
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
              pagination={true}
              disableRowSelectionOnClick
              autoHeight
              hideFooterSelectedRowCount
              pageSizeOptions={[10, 25, 50]}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
            />
          </>
        )}
      </div>
    </Container>
  );
}