import { configureStore } from "@reduxjs/toolkit";
import noticeReducer from "./slices/noticeSlice";
import authReducer from "./slices/authSlice";
import usersReducer from "./slices/usersSlice";
import templatesReducer from "./slices/templatesSlice";
import { setStoreAccessor as setUsersStoreAccessor } from "@/services/apiClients/usersApiClient";
import { setStoreAccessor as setTemplateStoreAccessor } from "@/services/apiClients/templateApiClient";

export const store = configureStore({
  reducer: {
    notice: noticeReducer,
    auth: authReducer,
    users: usersReducer,
    templates: templatesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Set the store accessor after store creation
setUsersStoreAccessor(() => store.getState());
setTemplateStoreAccessor(() => store.getState());

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;