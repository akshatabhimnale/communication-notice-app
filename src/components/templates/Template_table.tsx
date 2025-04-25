"use client"
import React, { useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
// import { GridRenderCellParams } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { RootState } from "@/store";
import {  fetchTemplatesThunk } from "@/store/slices/templatesSlice";


export default function Template_table() {
  const dispatch = useAppDispatch();

  const {
    templates,
    loading,
    nextPageUrl,
    prevPageUrl,
    error,
  } = useAppSelector((state: RootState) => state.templates);

  useEffect(() => {
    if (templates.length === 0) {
      dispatch(fetchTemplatesThunk(undefined));
    }
  }, [dispatch, templates.length]);

  // const handleDelete = (id: string) => {
  //   dispatch(removeTemplate(id));
  //   dispatch(fetchTemplatesThunk(undefined));
  // };

  const handlePageChange = (url: string | null) => {
    if (url && !loading) {
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
        console.log("Cell params:", params);
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
    // {
    //   field: "actions",
    //   headerName: "Actions",
    //   sortable: false,
    //   filterable: false,
    //   renderCell: (params: GridRenderCellParams) => (
    //     <Button
    //       color="error"
    //       variant="contained"
    //       size="small"
    //       onClick={() => handleDelete(params.row.id)}
    //     >
    //       Delete
    //     </Button>
    //   ),
    //   width: 120,
    // },
  ];

  return (
    <div style={{ width: "100%" }}>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <DataGrid
        rows={templates}
        columns={columns}
        getRowId={(row) => row.id}
        loading={loading}
        pagination={true}
        disableRowSelectionOnClick
        autoHeight
      />
      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <Button
          disabled={!prevPageUrl || loading}
          onClick={() => handlePageChange(prevPageUrl)}
        >
          Previous
        </Button>
        <Button
          disabled={!nextPageUrl || loading}
          onClick={() => handlePageChange(nextPageUrl)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}