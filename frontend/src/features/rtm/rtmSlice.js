import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  liveData: [],
  alerts: [],
  maxDataPoints: 20, // Max points to show on the chart
};

export const rtmSlice = createSlice({
  name: 'rtm',
  initialState,
  reducers: {
    // Action to add a new data point to the chart
    addDataPoint: (state, action) => {
      state.liveData.push(action.payload);
      // Keep the array size manageable
      if (state.liveData.length > state.maxDataPoints) {
        state.liveData.shift();
      }
    },
    // Action to add a new alert
    addAlert: (state, action) => {
      // Add new alerts to the top of the list
      state.alerts.unshift(action.payload);
    },
  },
});

// Export the actions so components can use them
export const { addDataPoint, addAlert } = rtmSlice.actions;

// Export the reducer to be added to the store
export default rtmSlice.reducer;