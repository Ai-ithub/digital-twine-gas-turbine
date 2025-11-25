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

// Generate sample live data for DVR/Monitoring
const generateSampleLiveData = () => {
  const now = Date.now();
  const data = [];
  for (let i = 0; i < 100; i++) {
    const timestamp = new Date(now - (100 - i) * 2000); // 2 second intervals
    data.push({
      time_id: `T${i + 1}`,
      timestamp: timestamp.toISOString(),
      time: timestamp.toLocaleTimeString(),
      Pressure_In: 1.2 + Math.sin(i * 0.1) * 0.2 + Math.random() * 0.1,
      Pressure_Out: 8.5 + Math.sin(i * 0.08) * 0.5 + Math.random() * 0.2,
      Flow_Rate: 45 + Math.sin(i * 0.12) * 5 + Math.random() * 2,
      Temperature_In: 420 + Math.sin(i * 0.15) * 20 + Math.random() * 5,
      Temperature_Out: 720 + Math.sin(i * 0.1) * 30 + Math.random() * 10,
      Efficiency: 0.85 + Math.sin(i * 0.05) * 0.05 + Math.random() * 0.02,
      Power_Consumption: 850 + Math.sin(i * 0.1) * 50 + Math.random() * 20,
      Load_Factor: 0.75 + Math.sin(i * 0.08) * 0.1 + Math.random() * 0.05,
      Vibration: 12 + Math.sin(i * 0.2) * 3 + Math.random() * 1,
      Frequency: 50 + Math.sin(i * 0.1) * 2 + Math.random() * 0.5,
      Amplitude: 0.5 + Math.sin(i * 0.15) * 0.2 + Math.random() * 0.1,
      Phase_Angle: 45 + Math.sin(i * 0.12) * 10 + Math.random() * 5,
      vib_std: 2.5 + Math.sin(i * 0.1) * 0.5 + Math.random() * 0.2,
      vib_max: 18 + Math.sin(i * 0.15) * 4 + Math.random() * 1,
      vib_mean: 12 + Math.sin(i * 0.1) * 2 + Math.random() * 0.5,
      vib_rms: 14 + Math.sin(i * 0.12) * 3 + Math.random() * 1,
      Ambient_Temperature: 25 + Math.sin(i * 0.05) * 3 + Math.random() * 1,
      Humidity: 45 + Math.sin(i * 0.08) * 10 + Math.random() * 3,
      Air_Pollution: 0.05 + Math.sin(i * 0.1) * 0.02 + Math.random() * 0.01,
      Density: 1.2 + Math.sin(i * 0.1) * 0.1 + Math.random() * 0.05,
      Viscosity: 0.018 + Math.sin(i * 0.12) * 0.003 + Math.random() * 0.001,
      Fuel_Quality: 0.92 + Math.sin(i * 0.05) * 0.03 + Math.random() * 0.01,
      Velocity: 120 + Math.sin(i * 0.1) * 15 + Math.random() * 5,
      Mass: 1500 + Math.sin(i * 0.05) * 50 + Math.random() * 10,
      Stiffness: 50000 + Math.sin(i * 0.08) * 5000 + Math.random() * 1000,
      Damping: 0.15 + Math.sin(i * 0.1) * 0.02 + Math.random() * 0.01,
      Maintenance_Quality: 0.88 + Math.sin(i * 0.06) * 0.05 + Math.random() * 0.02,
    });
  }
  return data;
};

const initialState = {
  liveData: generateSampleLiveData(),
  alerts: [
    {
      id: 'alert-1',
      iso_timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      display_timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString(),
      message: 'High vibration detected in compressor stage 2',
    },
    {
      id: 'alert-2',
      iso_timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      display_timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toLocaleString(),
      message: 'Temperature exceeding normal range in turbine inlet',
    },
    {
      id: 'alert-3',
      iso_timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      display_timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toLocaleString(),
      message: 'Pressure drop detected in filter system',
    },
  ],
  historicalData: [],
  // Holds anomalies that arrive before their corresponding data point
  unmatchedAnomalies: {},
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  maxDataPoints: 500,
  isConnected: false,
  anomalyCauseCounts: {
    'High_Vibration': 12,
    'Temperature_Anomaly': 8,
    'Pressure_Drop': 5,
    'Flow_Rate_Deviation': 7,
    'Efficiency_Loss': 3,
    'Bearing_Wear': 4,
    'Fuel_Quality_Issue': 2,
  },
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
    // New reducer to clear live data for performance (KEEP ONLY THE LATEST 75 POINTS)
    clearLiveData: (state) => {
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
  clearLiveData
} = rtmSlice.actions;

export default rtmSlice.reducer;