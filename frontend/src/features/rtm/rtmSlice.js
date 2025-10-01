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
  isConnected: false,
  // State to count the frequency of each anomaly cause
  anomalyCauseCounts: {},
};

export const rtmSlice = createSlice({
  name: 'rtm',
  initialState,
  reducers: {
    // Updates the WebSocket connection status
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload;
    },
    addDataPoint: (state, action) => {
      const newPoint = { ...action.payload };
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
    },
    markAsAnomaly: (state, action) => {
      const { time_id, causes } = action.payload;
      
      // Iterate over the causes and increment their count
      if (causes && causes.length > 0) {
        causes.forEach(cause => {
          if (state.anomalyCauseCounts[cause]) {
            state.anomalyCauseCounts[cause] += 1;
          } else {
            state.anomalyCauseCounts[cause] = 1;
          }
        });
      }
      
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
    },
    // New reducer to clear live data for performance
    clearLiveData: (state) => {
        // Keep only the last 75 items to clear memory
        if (state.liveData.length > 75) {
          state.liveData = state.liveData.slice(-75);
        }
    },
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

export const { 
  addDataPoint, 
  addAlert, 
  markAsAnomaly, 
  clearHistoricalData, 
  setConnectionStatus,
  clearLiveData // Export the new action
} = rtmSlice.actions;

export default rtmSlice.reducer;