// src/features/rtm/rtmSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// --- Import the new API function ---
import { getHistoricalData } from '../../api/rtmApi';

// --- NEW: Create an async thunk for fetching historical data ---
export const fetchHistoricalData = createAsyncThunk(
  'rtm/fetchHistoricalData',
  async (timeRange, { rejectWithValue }) => {
    try {
      const response = await getHistoricalData(timeRange);
      // The backend returns a flat list, we need to pivot it for the chart
      const pivotedData = response.data.reduce((acc, point) => {
        let entry = acc.find(item => item.time === point.time);
        if (!entry) {
          entry = { time: point.time, time_id: point.time }; // Use time as a unique key
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
  historicalData: [], // --- NEW: State for historical data ---
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  maxDataPoints: 50,
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
    markAsAnomaly: (state, action) => {
      const anomalyTimeId = action.payload;
      const pointToMark = state.liveData.find(p => p.time_id === anomalyTimeId);
      if (pointToMark) {
        pointToMark.isAnomaly = true;
      }
    },
    // --- NEW: A reducer to clear historical data when switching back to live ---
    clearHistoricalData: (state) => {
        state.historicalData = [];
        state.status = 'idle';
    }
  },
  // --- NEW: Handle the async thunk actions ---
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

export const { addDataPoint, addAlert, markAsAnomaly, clearHistoricalData } = rtmSlice.actions;

export default rtmSlice.reducer;