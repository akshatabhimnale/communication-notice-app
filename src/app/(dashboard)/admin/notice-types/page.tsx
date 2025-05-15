"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DataGrid, GridRenderCellParams } from "@mui/x-data-grid";
import { fetchNoticeTypes, deleteNoticeType } from "@/services/noticeService";
import { NoticeType, PaginatedResponse, DynamicSchema } from "@/types/noticeTypesInterface";
import { NoticeTypeSkeleton } from "@/components/NoticeType/NoticeTypeSkeleton";
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export default function NoticeTypesList() {
  const router = useRouter();
  const [noticeTypes, setNoticeTypes] = useState<NoticeType[]>([]);
  const [allNoticeTypes, setAllNoticeTypes] = useState<NoticeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0, // DataGrid page is 0-based, API page is 1-based
    pageSize: 10, // API returns 10 items per page
  });
  const [totalRows, setTotalRows] = useState(0);
  const [hasFetchedAll, setHasFetchedAll] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState<NoticeType | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedNotice, setSelectedNotice] = useState<NoticeType | null>(null);

  const loadNotices = useCallback(async () => {
    setLoading(true);
    try {
      const data: PaginatedResponse = await fetchNoticeTypes(paginationModel.page + 1); // API page is 1-based
      if (!Array.isArray(data.results)) {
        throw new Error("Invalid data format. Expected an array in results.");
      }
      setNoticeTypes(data.results);
      setAllNoticeTypes((prev) => {
        const existingIds = new Set(prev.map((n) => n.id));
        const newNotices = data.results.filter((n) => !existingIds.has(n.id));
        return [...prev, ...newNotices];
      });
      setTotalRows(data.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notice types");
    } finally {
      setLoading(false);
    }
  }, [paginationModel.page]);

  const loadAllNotices = useCallback(async () => {
    setLoading(true);
    try {
      let allNotices: NoticeType[] = [];
      let page = 1;
      let hasNext = true;

      while (hasNext) {
        const data: PaginatedResponse = await fetchNoticeTypes(page);
        if (!Array.isArray(data.results)) {
          throw new Error(`Invalid data format on page ${page}. Expected an array.`);
        }
        allNotices = [...allNotices, ...data.results];
        console.log(
          `Loaded page ${page}: ${data.results.length} notice types, total: ${allNotices.length}`
        );
        hasNext = data.next !== null;
        page += 1;
      }

      setAllNoticeTypes(allNotices);
      setHasFetchedAll(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load all notice types: An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!search) {
      loadNotices();
    }
  }, [loadNotices, search]);

  useEffect(() => {
    if (search && !hasFetchedAll) {
      loadAllNotices();
    }
  }, [search, hasFetchedAll, loadAllNotices]);

  const filteredNoticeTypes = (search ? allNoticeTypes : noticeTypes).filter((notice) => {
    const name = (notice.name || "").trim().toLowerCase();
    const searchTerm = search.trim().toLowerCase();
    return name.includes(searchTerm);
  });

  const handlePaginationModelChange = (newModel: { page: number; pageSize: number }) => {
    setPaginationModel(newModel);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPaginationModel((prev) => ({ ...prev, page: 0 })); // Reset to first page for search results
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, notice: NoticeType) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotice(notice);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotice(null);
  };

  const handleDeleteClick = (notice: NoticeType) => {
    setNoticeToDelete(notice);
    setDeleteDialogOpen(true);
    setDeleteError(null);
    handleMenuClose();
  };

  const handleDeleteClose = () => {
    setDeleteDialogOpen(false);
    setNoticeToDelete(null);
    setDeleteError(null);
    setDeleting(false);
  };

  const handleConfirmDelete = async () => {
    if (!noticeToDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteNoticeType(noticeToDelete.id);
      setNoticeTypes((prev) => prev.filter((n) => n.id !== noticeToDelete.id));
      setAllNoticeTypes((prev) => prev.filter((n) => n.id !== noticeToDelete.id));
      setTotalRows((prev) => prev - 1);
      handleDeleteClose();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete notice type");
      setDeleting(false);
    }
  };

  if (loading) {
    return <NoticeTypeSkeleton />;
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography color="error">{error}</Typography>
        <Button variant="contained" onClick={search ? loadAllNotices : loadNotices} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <TextField
          label="Search by Name"
          size="small"
          variant="outlined"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
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
      {noticeTypes.length === 0 && !search ? (
        <Typography textAlign="center" color="text.secondary">
          No notice types available
        </Typography>
      ) : (
        <>
          <DataGrid
            rows={search ? filteredNoticeTypes : noticeTypes}
            columns={[
              { field: "name", headerName: "Display Name", width: 200 },
              { field: "id", headerName: "System Name", width: 250 },
              {
                field: "description",
                headerName: "Description",
                width: 300,
                valueGetter: (params) => {
                  const description = params as string | null | undefined;
                  return description
                    ? description.slice(0, 50) + (description.length > 50 ? "..." : "")
                    : "No description available";
                },
              },
              {
                field: "dynamic_schema",
                headerName: "Fields Count",
                width: 150,
                valueGetter: (params: DynamicSchema) => {
                  const fieldKeys = Object.keys(params.fields || {});
                  return fieldKeys.length;
                },
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
                    <Box>
                      <IconButton
                        onClick={(event) => handleMenuOpen(event, params.row)}
                        aria-label="more"
                        aria-controls={anchorEl ? "actions-menu" : undefined}
                        aria-haspopup="true"
                      >
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        id="actions-menu"
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl) && selectedNotice?.id === params.row.id}
                        onClose={handleMenuClose}
                        MenuListProps={{
                          "aria-labelledby": "actions-button",
                        }}
                      >
                        <MenuItem
                          onClick={() => {
                            router.push(`/admin/notice-types/${params.row.id}/view`);
                            handleMenuClose();
                          }}
                        >
                          View
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            router.push(`/admin/notice-types/${params.row.id}/edit`);
                            handleMenuClose();
                          }}
                        >
                          Edit
                        </MenuItem>
                        <MenuItem
                          onClick={() => handleDeleteClick(params.row)}
                          sx={{ color: "error.main" }}
                        >
                          Delete
                        </MenuItem>
                      </Menu>
                    </Box>
                  );
                },
              },
            ]}
            rowCount={search ? filteredNoticeTypes.length : totalRows}
            paginationMode={search ? "client" : "server"}
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            pageSizeOptions={[10]} // API fixed at 10 items per page
            disableRowSelectionOnClick
            autoHeight
            getRowId={(row) => row.id}
            sx={{
              "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f5f5f5" },
              "& .MuiDataGrid-cell": { py: 1 },
            }}
          />
          <Dialog
            open={deleteDialogOpen}
            onClose={handleDeleteClose}
            disableEscapeKeyDown
            aria-labelledby="delete-dialog-title"
          >
            <DialogTitle id="delete-dialog-title">Confirm Deletion</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete the notice type &quot;{noticeToDelete?.name}&quot;?
                This action cannot be undone.
              </DialogContentText>
              {deleteError && (
                <Typography color="error" sx={{ mt: 2 }}>
                  {deleteError}
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDeleteClose} disabled={deleting}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                color="error"
                disabled={deleting}
                startIcon={deleting ? <CircularProgress size={20} /> : null}
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
}