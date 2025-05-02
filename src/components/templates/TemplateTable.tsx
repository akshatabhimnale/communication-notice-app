"use client" 
import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { RootState } from "@/store";
import { fetchTemplatesThunk, deleteTemplateThunk } from "@/store/slices/templatesSlice";
import { Button } from "@mui/material";
import { Trash2 } from "lucide-react";
import TemplatePreview from "./TemplatePreview";

type Template = {
  id: string;
  notice_type?: string;
  channel?: string;
  updated_at?: string;
  template_content: string;
};

export default function TemplateTable() {
  const dispatch = useAppDispatch();

  const {
    templates,
    loading,
    nextPageUrl,
    prevPageUrl,
    error,
    count
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

  const handleDelete = (id: string) => {
    dispatch(deleteTemplateThunk(id))
      .then((res) => {
        console.log("Template deleted successfully:", res);
      })
      .catch((err) => {
        console.error("Error deleting template:", err);
      });
  };

  const handleEditPreview = (template: unknown) => {
    setSelectedTemplate(template as Template);
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
    if (url) {
      dispatch(fetchTemplatesThunk(url));
    }
  };

  const columns: GridColDef[] = [
    { field: "notice_type", headerName: "Notice Type", flex: 1 },
    { field: "channel", headerName: "Channel", flex: 1 },
    {
      field: "updated_at",
      headerName: "Updated Date",
      flex: 1,
      renderCell: (params) => {
        
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
      }
    },
    {
      field:"edit and preview",
      headerName: "Edit and Preview",
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Button
          color="inherit"
          variant="contained"
          size="small"
          onClick={() => handleEditPreview(params.row)}
          style={{ cursor: "pointer" }}
        >
          Edit and Preview
        </Button>
      ),
      width: 180,
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Button
          color="error"
          variant="text"
          size="small"
          onClick={() => handleDelete(params.row.id)}
          style={{ cursor: "pointer" }}
        >
          <Trash2 />
        </Button>
      ),
      width: 120,
    },
  ];

  const [paginationModel, setPaginationModel] = React.useState({
    pageSize: 10,
    page: 0,
  });

  return (
    <div style={{ width: "100%" }}>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <DataGrid
        rows={templates}
        columns={columns}
        getRowId={(row) => row.id}
        loading={loading}
        pagination={true}
        paginationMode="server"
        disableRowSelectionOnClick
        autoHeight
        hideFooterSelectedRowCount
        rowCount={count || 0} //total count from your API response
        pageSizeOptions={[10]}
        paginationModel={paginationModel}
        onPaginationModelChange={(newModel) => {
          setPaginationModel(newModel);
          if (newModel.page > paginationModel.page && nextPageUrl && !loading) {
            handlePageChange(nextPageUrl);
          } else if (newModel.page < paginationModel.page && prevPageUrl && !loading) {
            handlePageChange(prevPageUrl);
          }
        }}
      />
      <TemplatePreview
        open={previewOpen}
        onClose={handlePreviewClose}
        template={
          selectedTemplate
            ? {
                ...selectedTemplate,
                channel: selectedTemplate.channel || "",
                notice_type: selectedTemplate.notice_type || "",
              }
            : null
        }
        onUpdated={handleTemplateUpdated}
      />
    </div>
  );
}