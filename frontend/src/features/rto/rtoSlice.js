// src/features/rto/rtoSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getLatestRtoSuggestion } from '../../api/predictionApi';

export const fetchLatestRtoSuggestion = createAsyncThunk(
  'rto/fetchLatestRtoSuggestion',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getLatestRtoSuggestion();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { suggestion_text: 'Could not fetch suggestion.' });
    }
  }
);

const initialState = {
  suggestion: null,
  status: 'idle',
  error: null,
};

export const rtoSlice = createSlice({
  name: 'rto',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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
      });
  },
});

export default rtoSlice.reducer;