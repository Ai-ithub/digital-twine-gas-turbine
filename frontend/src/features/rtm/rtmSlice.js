// src/features/rtm/rtmSlice.js (Corrected Version)
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  liveData: [],
  alerts: [],
  maxDataPoints: 30, // Increased for better visualization
};

export const rtmSlice = createSlice({
  name: 'rtm',
  initialState,
  reducers: {
    addDataPoint: (state, action) => {
      state.liveData.push(action.payload);
      if (state.liveData.length > state.maxDataPoints) {
        state.liveData.shift();
      }
    },
    addAlert: (state, action) => {
      state.alerts.unshift(action.payload);
    },
    // --- NEW ACTION ---
    // Finds a data point by its unique time_id and marks it as an anomaly
    markAsAnomaly: (state, action) => {
      const anomalyTimeId = action.payload;
      const pointToMark = state.liveData.find(p => p.time_id === anomalyTimeId);
      if (pointToMark) {
        pointToMark.isAnomaly = true;
      }
    },
  },
});

// Export the new action
export const { addDataPoint, addAlert, markAsAnomaly } = rtmSlice.actions;

export default rtmSlice.reducer;