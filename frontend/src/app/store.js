// src/app/store.js

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Import all your reducers
import rtmReducer from '../features/rtm/rtmSlice';
import pdmReducer from '../features/pdm/pdmSlice';
import rtoReducer from '../features/rto/rtoSlice';
import uiReducer from '../features/ui/uiSlice';
import controlReducer from '../features/control/controlSlice';
import checklistReducer from '../features/checklist/checklistSlice';
import analysisReducer from '../features/analysis/analysisSlice';
import threeDReducer from '../features/threeD/threeDSlice';


// FIX: Create a custom persist configuration for the 'rtm' slice
const rtmPersistConfig = {
  key: 'rtm',
  storage,
  // Blacklist large arrays that cause Local Storage overflow
  blacklist: ['dataPoints', 'chartData'],
  // Whitelist small metadata keys (assuming these exist and are safe to persist)
  // Example small keys:
  // whitelist: ['alerts', 'connectionStatus', 'selectedSensor'],
};

// Apply persist to the RTM reducer with the custom configuration
const persistedRTMReducer = persistReducer(rtmPersistConfig, rtmReducer);


// Configuration for global redux-persist (for the root reducer)
const rootPersistConfig = {
  key: 'root',
  storage,
  // RTM is now persisted selectively, so remove it from the global blacklist
  blacklist: [],
};


// Combine all reducers into a single root reducer
const rootReducer = combineReducers({
  // FIX: Use the customized persisted RTM reducer
  rtm: persistedRTMReducer,
  pdm: pdmReducer,
  rto: rtoReducer,
  ui: uiReducer,
  control: controlReducer,
  checklist: checklistReducer,
  analysis: analysisReducer,
  threeD: threeDReducer,
});

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PURGE',
          'rtm/addDataPoint',
          'rtm/addAlert',
          'alarms/markAsAnomaly',
          'analysis/setLargeDataSet',
        ],
      },
    }),
});

export const persistor = persistStore(store);