import {
  createNotice,
  deleteNotice,
  fetchNotices,
  Notice,
  updateNotice,
} from "@/services/noticeService";
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
  async (_, { rejectWithValue }) => {
    try {
      return await fetchNotices();
    } catch (error: unknown) {
      const err = error as { response?: { data?: string } };
      return rejectWithValue(
        err.response?.data || "Failed to fetch notice-types"
      );
    }
  }
);

export const createNoticeThunk = createAsyncThunk(
  "notice/create",
  async (data: Notice, { rejectWithValue }) => {
    try {
      return await createNotice(data);
    } catch (error: unknown) {
      const err = error as { response?: { data?: string } };
      return rejectWithValue(
        err.response?.data || "Failed to create notice-type"
      );
    }
  }
);

export const updateNoticeThunk = createAsyncThunk(
  "notice/update",
  async ({ id, data }: { id: string; data: Notice }, { rejectWithValue }) => {
    try {
      return await updateNotice(id, data);
    } catch (error: unknown) {
      const err = error as { response?: { data?: string } };
      return rejectWithValue(
        err.response?.data || "Failed to update notice-type"
      );
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
      const err = error as { response?: { data?: string } };
      return rejectWithValue(
        err.response?.data || "Failed to delete notice-type"
      );
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
