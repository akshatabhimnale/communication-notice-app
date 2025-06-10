"use client";
import React, { useState, useEffect } from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { RootState } from "@/store";
import { fetchTemplatesThunk, deleteTemplateThunk } from "@/store/slices/templatesSlice";
import { Button, Skeleton, Box, Typography } from "@mui/material";
import { Trash2 } from "lucide-react";
import TemplatePreview from "./TemplatePreview";

interface Template {
  id: string;
  notice_type?: string;
  channel: string[];
  updated_at?: string;
  template_content?: string;
}

export default function TemplateTable() {
  const dispatch = useAppDispatch();
  const {
    templates,
    loading,
    nextPageUrl,
    prevPageUrl,
    error,
    count,
  } = useAppSelector((state: RootState) => state.templates);

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  useEffect(() => {
    if (isInitialLoad) {
      dispatch(fetchTemplatesThunk(undefined));
      setIsInitialLoad(false);
    }
  }, [dispatch, isInitialLoad]);

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteTemplateThunk(id)).unwrap();
      console.log("Template deleted successfully: id=", id);
    } catch (err) {
      console.error("Error deleting template:", err);
    }
  };

  const handleEditPreview = (template: Template) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  const handlePreviewClose = () => {
    setPreviewOpen(false);
    setSelectedTemplate(null);
  };

  const handleTemplateUpdated = () => {
    dispatch(fetchTemplatesThunk(undefined));
  };

  const handlePageChange = (url: string | null) => {
    if (url && !loading) {
      dispatch(fetchTemplatesThunk(url));
    }
  };

  const columns: GridColDef[] = [
    {
      field: "notice_type",
      headerName: "Notice Type",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <span>{params.row.notice_type || "-"}</span>
      ),
    },
    {
      field: "channel",
      headerName: "Channel",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <span>{params.row.channel?.length ? params.row.channel.join(", ") : "-"}</span>
      ),
    },
    {
      field: "updated_at",
      headerName: "Updated Date",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => {
        if (params.row.updated_at) {
          try {
            const date = new Date(params.row.updated_at);
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
      field: "edit_and_preview",
      headerName: "Edit and Preview",
      sortable: false,
      filterable: false,
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Button
          variant="contained"
          color="inherit"
          size="small"
          onClick={() => handleEditPreview(params.row as Template)}
          sx={{ textTransform: "none" }}
        >
          Edit and Preview
        </Button>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      filterable: false,
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Button
          variant="text"
          color="error"
          size="small"
          onClick={() => handleDelete(params.row.id)}
          sx={{ minWidth: "unset" }}
        >
          <Trash2 size={20} />
        </Button>
      ),
    },
  ];

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

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

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          Error: {error}
        </Typography>
      )}
      {loading ? (
        <DataGridSkeleton />
      ) : templates.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: "center", py: 4 }}>
          No templates available.
        </Typography>
      ) : (
        <DataGrid
          rows={templates}
          columns={columns}
          getRowId={(row) => row.id}
          pagination
          paginationMode="server"
          disableRowSelectionOnClick
          autoHeight
          hideFooterSelectedRowCount
          rowCount={count ?? 0}
          pageSizeOptions={[10]}
          paginationModel={paginationModel}
          onPaginationModelChange={(newModel) => {
            setPaginationModel(newModel);
            if (newModel.page > paginationModel.page && nextPageUrl) {
              handlePageChange(nextPageUrl);
            } else if (newModel.page < paginationModel.page && prevPageUrl) {
              handlePageChange(prevPageUrl);
            }
          }}
          sx={{ "& .MuiDataGrid-root": { borderRadius: 1 } }}
        />
      )}
      <TemplatePreview
        open={previewOpen}
        onClose={handlePreviewClose}
        template={
          selectedTemplate
            ? {
                id: selectedTemplate.id,
                channel: selectedTemplate.channel,
                template_content: selectedTemplate.template_content || "",
                notice_type: selectedTemplate.notice_type || "",
              }
            : null
        }
        onUpdated={handleTemplateUpdated}
      />
    </Box>
  );
}