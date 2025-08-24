import { configureStore } from '@reduxjs/toolkit';
import rtmReducer from '../features/rtm/rtmSlice';
import pdmReducer from '../features/pdm/pdmSlice';

export const store = configureStore({
  reducer: {
    rtm: rtmReducer,
    pdm: pdmReducer,
    // We can add other reducers (e.g., for rto) here later
  },
});