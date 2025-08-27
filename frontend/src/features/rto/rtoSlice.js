// src/features/rto/rtoSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// Import from the new rtoApi.js file
import { getLatestRtoSuggestion, getEfficiencyHistory } from '../../api/rtoApi'; 

export const fetchLatestRtoSuggestion = createAsyncThunk(
  'rto/fetchLatestRtoSuggestion',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getLatestRtoSuggestion();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// --- This is the missing export ---
export const fetchEfficiencyHistory = createAsyncThunk(
  'rto/fetchEfficiencyHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getEfficiencyHistory();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const initialState = {
  suggestion: null,
  history: [], // For chart data
  status: 'idle',
  historyStatus: 'idle',
  error: null,
};

export const rtoSlice = createSlice({
  name: 'rto',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Cases for suggestion
      .addCase(fetchLatestRtoSuggestion.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLatestRtoSuggestion.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.suggestion = action.payload;
      })
      .addCase(fetchLatestRtoSuggestion.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Cases for chart history
      .addCase(fetchEfficiencyHistory.pending, (state) => {
        state.historyStatus = 'loading';
      })
      .addCase(fetchEfficiencyHistory.fulfilled, (state, action) => {
        state.historyStatus = 'succeeded';
        state.history = action.payload;
      })
      .addCase(fetchEfficiencyHistory.rejected, (state) => {
        state.historyStatus = 'failed';
      });
  },
});

export default rtoSlice.reducer;