import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SensorData } from "../lib/api";

interface SensorState {
  latest: SensorData | null;
  loading: boolean;
  error: string | null;
}

const initialState: SensorState = {
  latest: null,
  loading: true,
  error: null,
};

const sensorSlice = createSlice({
  name: "sensor",
  initialState,
  reducers: {
    setLatestSensor: (state, action: PayloadAction<SensorData>) => {
      state.latest = action.payload;
      state.loading = false;
      state.error = null;
    },
    setSensorError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setLatestSensor, setSensorError } = sensorSlice.actions;
export default sensorSlice.reducer;
