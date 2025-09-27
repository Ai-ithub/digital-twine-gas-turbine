// src/features/rtm/rtmSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getHistoricalData } from '../../api/rtmApi';

// Async thunk to fetch historical data
export const fetchHistoricalData = createAsyncThunk(
  'rtm/fetchHistoricalData',
  async (timeRange, { rejectWithValue }) => {
    try {
      const response = await getHistoricalData(timeRange);
      // Convert the flat API data structure to a suitable format for Recharts
      const pivotedData = response.data.reduce((acc, point) => {
        let entry = acc.find(item => item.time === point.time);
        if (!entry) {
          entry = { time: point.time, time_id: point.time };
          acc.push(entry);
        }
        entry[point.field] = point.value;
        return acc;
      }, []);
      return pivotedData;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch data');
    }
  }
);

const initialState = {
  liveData: [],
  alerts: [],
  historicalData: [],
  // Holds anomalies that arrive before their corresponding data point
  unmatchedAnomalies: {},
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  maxDataPoints: 10000,
  isConnected: false, // ADDED: To track WebSocket connection status globally
};

export const rtmSlice = createSlice({
  name: 'rtm',
  initialState,
  reducers: {
    // ADDED: New reducer to update the connection status
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload;
    },
    addDataPoint: (state, action) => {
      const newPoint = { ...action.payload }; // Create a mutable copy
      const isExisting = state.liveData.some(point => point.time_id === newPoint.time_id);

      if (!isExisting) {
        // Check if an anomaly alert for this point arrived early
        if (state.unmatchedAnomalies && state.unmatchedAnomalies[newPoint.time_id]) {
          newPoint.anomalyCauses = state.unmatchedAnomalies[newPoint.time_id];
          // Clean up the matched anomaly
          delete state.unmatchedAnomalies[newPoint.time_id];
        }

        let updatedLiveData = [...state.liveData, newPoint];
        
        // If the array exceeds the max length, trim the oldest points
        if (updatedLiveData.length > state.maxDataPoints) {
          updatedLiveData = updatedLiveData.slice(-state.maxDataPoints);
        }
        
        state.liveData = updatedLiveData;
      }
    },
    addAlert: (state, action) => {
      const lastAlert = state.alerts[0];
      if (lastAlert && lastAlert.message === action.payload.message) {
        return;
      }
      state.alerts.unshift(action.payload);
      if (state.alerts.length > 20) {
        state.alerts.pop();
      }
    },
    markAsAnomaly: (state, action) => {
      const { time_id, causes } = action.payload;
      
      // Find the index of the data point to mark
      const pointIndex = state.liveData.findIndex(p => p.time_id === time_id);

      if (pointIndex !== -1) {
        // If the data point already exists, mark it as an anomaly
        state.liveData[pointIndex].anomalyCauses = causes;
      } else {
        // If the data point hasn't arrived yet, store the anomaly to match it later
        state.unmatchedAnomalies[time_id] = causes;
      }
    },
    clearHistoricalData: (state) => {
        state.historicalData = [];
        state.status = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHistoricalData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchHistoricalData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.historicalData = action.payload;
      })
      .addCase(fetchHistoricalData.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

// ADDED: Export the new action
export const { 
  addDataPoint, 
  addAlert, 
  markAsAnomaly, 
  clearHistoricalData, 
  setConnectionStatus 
} = rtmSlice.actions;

export default rtmSlice.reducer;