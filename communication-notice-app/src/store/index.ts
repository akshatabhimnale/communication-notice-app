import { configureStore } from "@reduxjs/toolkit";
import noticeReducer from "./noticeSlice";

export const store = configureStore({
  reducer: {
    notice: noticeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
