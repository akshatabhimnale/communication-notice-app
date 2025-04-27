"use client" 
import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { RootState } from "@/store";
import {  fetchTemplatesThunk } from "@/store/slices/templatesSlice";


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

  useEffect(() => {
    if (isInitialLoad) {
      dispatch(fetchTemplatesThunk(undefined));
      setIsInitialLoad(false);
    }
  }, [dispatch, isInitialLoad]);

  // const handleDelete = (id: string) => {
  //   dispatch(removeTemplate(id));
  //   dispatch(fetchTemplatesThunk(undefined));
  // };

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
    </div>
  );
}