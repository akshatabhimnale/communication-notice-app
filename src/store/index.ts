import { configureStore } from "@reduxjs/toolkit";
import noticeReducer from "./slices/noticeSlice";
import authReducer from "./slices/authSlice";
import usersReducer from "./slices/usersSlice";
import { setStoreAccessor } from "@/services/apiClients/usersApiClient";

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

// Set the store accessor after store creation
setStoreAccessor(() => store.getState());

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;