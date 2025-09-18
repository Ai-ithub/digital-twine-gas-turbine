// src/features/rtm/rtmSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getHistoricalData } from '../../api/rtmApi';

// Async thunk برای دریافت داده‌های تاریخی (بدون تغییر)
export const fetchHistoricalData = createAsyncThunk(
  'rtm/fetchHistoricalData',
  async (timeRange, { rejectWithValue }) => {
    try {
      const response = await getHistoricalData(timeRange);
      // تبدیل ساختار داده تخت API به فرمت مناسب برای Recharts
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
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  maxDataPoints: 43200,
};

export const rtmSlice = createSlice({
  name: 'rtm',
  initialState,
  reducers: {
    addDataPoint: (state, action) => {
      const isExisting = state.liveData.some(point => point.time_id === action.payload.time_id);
      
      if (!isExisting) {
        // --- ✅ شروع تغییر ---
        // به جای push، یک آرایه جدید با داده جدید می‌سازیم
        let updatedLiveData = [...state.liveData, action.payload];
        
        // اگر طول آرایه از حد مجاز بیشتر شد، قدیمی‌ترین داده را با slice حذف می‌کنیم
        if (updatedLiveData.length > state.maxDataPoints) {
          updatedLiveData = updatedLiveData.slice(1); // یک آرایه جدید بدون اولین عنصر برمی‌گرداند
        }
        
        // state را با آرایه جدید جایگزین می‌کنیم
        state.liveData = updatedLiveData;
        // --- ✅ پایان تغییر ---
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
      const anomalyTimeId = action.payload;
      
      // --- ✅ شروع تغییر ---
      // از map برای ساختن یک آرایه جدید استفاده می‌کنیم
      // و فقط آیتمی که time_id منطبق دارد را با یک کپی جدید و تغییریافته جایگزین می‌کنیم
      state.liveData = state.liveData.map(point => {
        if (point.time_id === anomalyTimeId) {
          // یک کپی از نقطه داده با isAnomaly: true برمی‌گردانیم
          return { ...point, isAnomaly: true };
        }
        // بقیه نقاط داده را بدون تغییر برمی‌گردانیم
        return point;
      });
      // --- ✅ پایان تغییر ---
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

export const { addDataPoint, addAlert, markAsAnomaly, clearHistoricalData } = rtmSlice.actions;

export default rtmSlice.reducer;