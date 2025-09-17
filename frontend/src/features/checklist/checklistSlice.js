// src/features/checklist/checklistSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [
    { id: 1, text: "Pre-startup inspection completed", checked: true, category: "Startup" },
    { id: 2, text: "Oil levels verified", checked: true, category: "Lubrication" },
    { id: 3, text: "Pressure sensors calibrated", checked: false, category: "Sensors" },
    { id: 4, text: "Temperature probes tested", checked: true, category: "Sensors" },
    { id: 5, text: "Vibration monitoring active", checked: false, category: "Monitoring" },
    { id: 6, text: "Emergency shutdown tested", checked: true, category: "Safety" },
    { id: 7, text: "Inlet filters inspected", checked: false, category: "Maintenance" },
    { id: 8, text: "Outlet valves operational", checked: true, category: "Operations" },
  ],
};

const checklistSlice = createSlice({
  name: 'checklist',
  initialState,
  reducers: {
    toggleChecklistItem: (state, action) => {
      const item = state.items.find(item => item.id === action.payload);
      if (item) {
        item.checked = !item.checked;
      }
    },
  },
});

export const { toggleChecklistItem } = checklistSlice.actions;
export default checklistSlice.reducer;