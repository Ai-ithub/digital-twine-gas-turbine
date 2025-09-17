// src/app/store.js

import { configureStore } from '@reduxjs/toolkit';
import rtmReducer from '../features/rtm/rtmSlice';
import pdmReducer from '../features/pdm/pdmSlice';
import rtoReducer from '../features/rto/rtoSlice';
import uiReducer from '../features/ui/uiSlice';
import alarmsReducer from '../features/alarms/alarmsSlice';
import controlReducer from '../features/control/controlSlice';
import threeDReducer from '../features/threeD/threeDSlice';
import checklistReducer from '../features/checklist/checklistSlice';

export const store = configureStore({
  reducer: {
    rtm: rtmReducer,
    pdm: pdmReducer,
    rto: rtoReducer,
    ui: uiReducer,
    alarms: alarmsReducer,
    control: controlReducer,
    threeD: threeDReducer,
    checklist: checklistReducer,
  },
});