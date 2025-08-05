import {
  createNotice,
  deleteNotice,
  fetchNotices,
  updateNotice,
} from "@/services/noticeService";
import { Notice } from "@/types/noticeTypesInterface";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface NoticeState {
  notices: Notice[];
  loading: boolean;
  error: string | null;
}

const initialState: NoticeState = {
  notices: [],
  loading: false,
  error: null,
};

export const fetchNoticesThunk = createAsyncThunk(
  "notice/fetchAll",
  async (params: { user_id?: string; notice_type?: string }, { rejectWithValue }) => {
    try {
      return await fetchNotices(params);
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || "Failed to fetch notices");
    }
  }
);

export const createNoticeThunk = createAsyncThunk(
  "notice/create",
  async (data: Notice, { rejectWithValue }) => {
    try {
      return await createNotice(data);
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || "Failed to create notice");
    }
  }
);

export const updateNoticeThunk = createAsyncThunk(
  "notice/update",
  async ({ id, data }: { id: string; data: Notice }, { rejectWithValue }) => {
    try {
      return await updateNotice(id, data);
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || "Failed to update notice");
    }
  }
);

export const deleteNoticeThunk = createAsyncThunk(
  "notice/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteNotice(id);
      return id;
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || "Failed to delete notice");
    }
  }
);

const noticeSlice = createSlice({
  name: "notice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNoticesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchNoticesThunk.fulfilled,
        (state, action: PayloadAction<Notice[]>) => {
          state.loading = false;
          state.notices = action.payload;
        }
      )
      .addCase(fetchNoticesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createNoticeThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        createNoticeThunk.fulfilled,
        (state, action: PayloadAction<Notice>) => {
          state.loading = false;
          state.notices.push(action.payload);
        }
      )
      .addCase(createNoticeThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateNoticeThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        updateNoticeThunk.fulfilled,
        (state, action: PayloadAction<Notice>) => {
          state.loading = false;
          const index = state.notices.findIndex(
            (n) => n.id === action.payload.id
          );
          if (index !== -1) {
            state.notices[index] = action.payload;
          }
        }
      )
      .addCase(updateNoticeThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteNoticeThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        deleteNoticeThunk.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.notices = state.notices.filter((n) => n.id !== action.payload);
        }
      )
      .addCase(deleteNoticeThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default noticeSlice.reducer;