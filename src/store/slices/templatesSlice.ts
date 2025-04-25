import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { fetchTemplates, PaginatedTemplateResponse, template } from "@/services/TemplateService";
import { AxiosError } from "axios";

interface TemplatesState {
  templates: template[];
  loading: boolean;
  error: string | null;
  count: number;
  nextPageUrl: string | null;
  prevPageUrl: string | null;
}

const initialState: TemplatesState = {
  templates: [],
  loading: false,
  error: null,
  count: 0,
  nextPageUrl: null,
  prevPageUrl: null,
};

// Async thunk for fetching templates
export const fetchTemplatesThunk = createAsyncThunk(
  "templates/fetchAll",
  async (url: string | undefined, { rejectWithValue }) => {
    try {
      const response = await fetchTemplates(url);
      return response;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;
      const message =
        (axiosError.response?.data as { message?: string })?.message ||
        "Failed to fetch templates";
      return rejectWithValue({ status, message });
    }
  }
);

const templatesSlice = createSlice({
  name: "templates",
  initialState,
  reducers: {
    updateTemplate: (state, action: PayloadAction<template>) => {
      state.templates = state.templates.map((tpl) =>
        // @ts-ignore: Assume template has id
        tpl.id === action.payload.id ? { ...action.payload } : tpl
      );
    },
    removeTemplate: (state, action: PayloadAction<string>) => {
      // @ts-ignore: Assume template has id
      state.templates = state.templates.filter((tpl) => tpl.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTemplatesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchTemplatesThunk.fulfilled,
        (state, action: PayloadAction<PaginatedTemplateResponse>) => {
          state.loading = false;
          state.templates = action.payload.results;
          state.count = action.payload.count;
          state.nextPageUrl = action.payload.next;
          state.prevPageUrl = action.payload.previous;
        }
      )
      .addCase(fetchTemplatesThunk.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as { status?: number; message?: string };
        state.error = payload?.message || "Unknown error";
      });
  },
});

export const { updateTemplate, removeTemplate } = templatesSlice.actions;
export default templatesSlice.reducer;