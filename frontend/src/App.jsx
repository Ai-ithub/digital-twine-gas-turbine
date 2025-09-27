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
  setConnectionStatus // اکشن جدید برای وضعیت اتصال
} from './features/rtm/rtmSlice';

function App() {
  const dispatch = useDispatch();

  // Callbacks are now defined in the top-level component
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
      timestamp: new Date(alertData.timestamp).toLocaleTimeString(),
      message: alertData.details,
    };
    dispatch(addAlert(newAlert));

    if (alertData.time_id && alertData.causes) {
      dispatch(markAsAnomaly({ time_id: alertData.time_id, causes: alertData.causes }));
    }
  }, [dispatch]);

  // The WebSocket hook is now called here and lives for the entire app session
  const { isConnected } = useWebSocket({
    'new_data': handleNewData,
    'new_alert': handleNewAlert,
  });

  // This effect syncs the connection status from the hook to the global Redux store
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