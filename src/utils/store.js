import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../features/auth/authApi";
import authReducer from "../features/auth/authSlice";

const apis = [authApi];

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ...Object.fromEntries(apis.map((api) => [api.reducerPath, api.reducer])),
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apis.map((api) => api.middleware)),
});
