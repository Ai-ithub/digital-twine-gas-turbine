import { configureStore } from '@reduxjs/toolkit';
import rtmReducer from '../features/rtm/rtmSlice';

export const store = configureStore({
  reducer: {
    rtm: rtmReducer,
    // We can add other reducers (e.g., for pdm, rto) here later
  },
});