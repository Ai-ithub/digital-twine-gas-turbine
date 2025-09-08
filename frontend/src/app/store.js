// src/app/store.js

import { configureStore } from '@reduxjs/toolkit';
import rtmReducer from '../features/rtm/rtmSlice';
import pdmReducer from '../features/pdm/pdmSlice';
import rtoReducer from '../features/rto/rtoSlice';
import uiReducer from '../features/ui/uiSlice';

export const store = configureStore({
  reducer: {
    rtm: rtmReducer,
    pdm: pdmReducer,
    rto: rtoReducer,
    ui: uiReducer,
  },
});