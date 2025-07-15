import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ScannerState {
  ipAddress: string;
}

const initialState: ScannerState = {
  ipAddress: "192.168.1.1", // Default or blank
};

export const scannerSlice = createSlice({
  name: "scanner",
  initialState,
  reducers: {
    setIpAddress: (state, action: PayloadAction<string>) => {
      state.ipAddress = action.payload;
    },
  },
});

export const { setIpAddress } = scannerSlice.actions;
export default scannerSlice.reducer;
