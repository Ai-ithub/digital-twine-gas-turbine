// src/components/RTMDashboard.jsx (Final Corrected Version)
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
// Import the new action
import { addDataPoint, addAlert, markAsAnomaly } from '../features/rtm/rtmSlice';
import LiveChart from './LiveChart';
import AlertsList from './AlertsList';
import io from 'socket.io-client';

const RTMDashboard = () => {
  const { liveData, alerts } = useSelector((state) => state.rtm);
  const dispatch = useDispatch();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io('http://localhost:5000');

    socket.on('connect', () => {
      console.log('✅ WebSocket Connected!');
      setIsConnected(true);
    });

    // Listener for ALL live data points
    socket.on('new_data', (dataPoint) => {
      const newPointForChart = {
        // --- CHANGE: Add the unique ID to the data point ---
        time_id: dataPoint.Time, 
        time: new Date(dataPoint.Timestamp).toLocaleTimeString(),
        Pressure_In: dataPoint.Pressure_In,
        Temperature_In: dataPoint.Temperature_In,
        isAnomaly: false, // Always default to false
      };
      dispatch(addDataPoint(newPointForChart));
    });

    // Listener for ONLY anomaly alerts
    socket.on('new_alert', (alertData) => {
      console.log('Received new alert:', alertData);
      
      const newAlert = {
          id: alertData.time_id,
          timestamp: new Date(alertData.timestamp).toLocaleTimeString(),
          message: alertData.details,
      };
      
      dispatch(addAlert(newAlert));
      
      // --- NEW: Dispatch the action to mark the point on the chart ---
      if (alertData.time_id) {
        dispatch(markAsAnomaly(alertData.time_id));
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSocket Disconnected!');
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  return (
    // ... JSX remains the same ...
    <div style={{ display: 'flex', padding: '20px', gap: '20px' }}>
      <div style={{ flex: 3 }}>
        <LiveChart data={liveData} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: '10px', padding: '5px', borderRadius: '4px', backgroundColor: isConnected ? '#28a745' : '#dc3545', color: 'white', textAlign: 'center' }}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
        <AlertsList alerts={alerts} />
      </div>
    </div>
  );
};

export default RTMDashboard;