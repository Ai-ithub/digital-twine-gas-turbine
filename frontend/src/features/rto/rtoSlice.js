import { createSlice } from '@reduxjs/toolkit';

// Mock data for initial UI design
const mockRtoData = {
  suggestion_text: "Reduce inlet valve to 72% for a 4.5% efficiency gain.",
  generated_at: new Date().toISOString(),
};

const initialState = {
  suggestion: mockRtoData,
  status: 'succeeded',
};

export const rtoSlice = createSlice({
  name: 'rto',
  initialState,
  reducers: {
    // Async thunks for real data will be added later
  },
});

export default rtoSlice.reducer;