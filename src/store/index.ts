import { configureStore } from "@reduxjs/toolkit";
import noticeReducer from "./slices/noticeSlice";
import authReducer from "./slices/authSlice";
import usersReducer from "./slices/usersSlice";

export const store = configureStore({
  reducer: {
    notice: noticeReducer,
    auth: authReducer,
    users: usersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;