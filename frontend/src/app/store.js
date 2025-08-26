import { configureStore } from '@reduxjs/toolkit';
import rtmReducer from '../features/rtm/rtmSlice';
import pdmReducer from '../features/pdm/pdmSlice';
import rtoReducer from '../features/rto/rtoSlice';

export const store = configureStore({
  reducer: {
    rtm: rtmReducer,
    pdm: pdmReducer,
    rto: rtoReducer,
  },
});