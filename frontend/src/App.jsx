// src/App.jsx

import React, { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import AppRouter from './routes/AppRouter';
import Notifier from './components/common/Notifier';
import useWebSocket from './hooks/useWebSocket'; 
import { 
  addDataPoint, 
  addAlert, 
  markAsAnomaly,
  setConnectionStatus
} from './features/rtm/rtmSlice';
// Import the new action
import { updateRtoSuggestion } from './features/rto/rtoSlice';

function App() {
  const dispatch = useDispatch();

  // Callbacks for RTM data
  const handleNewData = useCallback((dataPoint) => {
    const newPointForChart = {
      time_id: dataPoint.Time,
      timestamp: dataPoint.Timestamp,
      time: new Date(dataPoint.Timestamp).toLocaleTimeString(),
      Pressure_In: dataPoint.Pressure_In,
      Temperature_In: dataPoint.Temperature_In,
      Power_Consumption: dataPoint.Power_Consumption,
      Efficiency: dataPoint.Efficiency * 100,
      Flow_Rate: dataPoint.Flow_Rate,
      Vibration: dataPoint.Vibration,
    };
    dispatch(addDataPoint(newPointForChart));
  }, [dispatch]);

  const handleNewAlert = useCallback((alertData) => {
    const newAlert = {
      id: `${Date.now()}-${Math.random()}`,
      iso_timestamp: alertData.timestamp,
      display_timestamp: new Date(alertData.timestamp).toLocaleString(),
      message: alertData.details,
    };
    dispatch(addAlert(newAlert));

    if (alertData.time_id && alertData.causes) {
      dispatch(markAsAnomaly({ time_id: alertData.time_id, causes: alertData.causes }));
    }
  }, [dispatch]);

  // Callback for RTO suggestions
  const handleNewRtoSuggestion = useCallback((suggestionData) => {
    dispatch(updateRtoSuggestion(suggestionData));
  }, [dispatch]);

  // Central WebSocket hook
  const { isConnected } = useWebSocket({
    'new_data': handleNewData,
    'new_alert': handleNewAlert,
    'new_rto_suggestion': handleNewRtoSuggestion, // Add this event handler
  });

  // Syncs connection status to the Redux store
  useEffect(() => {
    dispatch(setConnectionStatus(isConnected));
  }, [isConnected, dispatch]);

  return (
    <>
      <AppRouter />
      <Notifier /> 
    </>
  );
}

export default App;