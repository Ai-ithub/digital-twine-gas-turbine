// src/components/RTMDashboard.js (Updated Version)
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addDataPoint, addAlert } from '../features/rtm/rtmSlice';
import LiveChart from './LiveChart';
import AlertsList from './AlertsList';

const RTMDashboard = () => {
  // Use useSelector to get data from the Redux store
  const liveData = useSelector((state) => state.rtm.liveData);
  const alerts = useSelector((state) => state.rtm.alerts);
  
  // Use useDispatch to be able to send actions to the store
  const dispatch = useDispatch();

  // useEffect to simulate a live data stream
  useEffect(() => {
    const interval = setInterval(() => {
      // --- Data Simulation Logic (same as before) ---
      const now = new Date();
      const newTime = now.toLocaleTimeString();
      const newPoint = {
        time: newTime,
        Pressure_In: (3.5 + Math.random() * 0.2).toFixed(2),
        Temperature_In: (20 + Math.random() * 5).toFixed(2),
        isAnomaly: false,
      };

      if (Math.random() < 0.1) {
        newPoint.isAnomaly = true;
        newPoint.Pressure_In = (3.8 + Math.random() * 0.2).toFixed(2);
        const newAlert = {
          id: now.getTime(),
          timestamp: newTime,
          message: `High pressure spike detected: ${newPoint.Pressure_In} bar`,
        };
        // Instead of setState, we dispatch an action to Redux
        dispatch(addAlert(newAlert));
      }
      // Dispatch an action to add the new point to the Redux store
      dispatch(addDataPoint(newPoint));

    }, 2000);

    return () => clearInterval(interval);
  }, [dispatch]); // Add dispatch to the dependency array

  return (
    <div style={{ display: 'flex', padding: '20px', gap: '20px' }}>
      <div style={{ flex: 3 }}>
        <LiveChart data={liveData} />
      </div>
      <div style={{ flex: 1 }}>
        <AlertsList alerts={alerts} />
      </div>
    </div>
  );
};

export default RTMDashboard;