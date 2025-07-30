import { configureStore } from "@reduxjs/toolkit";
import sensorReducer from "./sensorSlice";

export const store = configureStore({
  reducer: {
    sensor: sensorReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
