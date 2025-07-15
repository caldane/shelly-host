import { configureStore } from "@reduxjs/toolkit";
import scannerReducer from "./scannerSlice"; // adjust path as needed

export const store = configureStore({
  reducer: {
    scanner: scannerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
