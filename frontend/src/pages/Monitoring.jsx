// src/pages/Monitoring.jsx (Final version with Frontend Filtering)

import React, { useCallback, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Chip, ButtonGroup, Button, Typography } from '@mui/material';

import { 
  addDataPoint, 
  addAlert, 
  markAsAnomaly,
} from '../features/rtm/rtmSlice';

import useWebSocket from '../hooks/useWebSocket';
import PageHeader from '../components/common/PageHeader';
import LiveChart from '../features/rtm/components/LiveChart';
import AnomalyAlerts from '../features/rtm/components/AnomalyAlerts';

const TIME_RANGES = {
  LIVE: 'Live', // Shows the last 50 points
  LAST_10M: '10m',
  LAST_1H: '1h',
  LAST_24H: '24h',
};

const Monitoring = () => {
  const { liveData, alerts } = useSelector((state) => state.rtm);
  const dispatch = useDispatch();
  const [selectedRange, setSelectedRange] = useState(TIME_RANGES.LIVE);

  // WebSocket handlers remain the same
  const handleNewData = useCallback((dataPoint) => {
    const newPointForChart = {
      time_id: dataPoint.Time,
      // --- IMPORTANT CHANGE: Store the full timestamp for filtering ---
      timestamp: dataPoint.Timestamp, 
      time: new Date(dataPoint.Timestamp).toLocaleTimeString(),
      Pressure_In: dataPoint.Pressure_In,
      Temperature_In: dataPoint.Temperature_In,
      isAnomaly: false,
    };
    dispatch(addDataPoint(newPointForChart));
  }, [dispatch]);

  const handleNewAlert = useCallback((alertData) => {
    const newAlert = {
      id: alertData.time_id,
      timestamp: new Date(alertData.timestamp).toLocaleTimeString(),
      message: alertData.details,
    };
    dispatch(addAlert(newAlert));
    if (alertData.time_id) {
      dispatch(markAsAnomaly(alertData.time_id));
    }
  }, [dispatch]);
  
  const { isConnected } = useWebSocket({
    'new_data': handleNewData,
    'new_alert': handleNewAlert,
  });
  
  // --- THIS IS THE NEW FILTERING LOGIC ---
  const filteredChartData = useMemo(() => {
    const now = Date.now();
    
    switch (selectedRange) {
      case TIME_RANGES.LAST_10M:
        const tenMinutesAgo = now - 10 * 60 * 1000;
        return liveData.filter(d => new Date(d.timestamp).getTime() >= tenMinutesAgo);
        
      case TIME_RANGES.LAST_1H:
        const oneHourAgo = now - 60 * 60 * 1000;
        return liveData.filter(d => new Date(d.timestamp).getTime() >= oneHourAgo);

      case TIME_RANGES.LAST_24H:
        const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
        return liveData.filter(d => new Date(d.timestamp).getTime() >= twentyFourHoursAgo);

      case TIME_RANGES.LIVE:
      default:
        // Return only the last 50 data points for a smooth "live" view
        return liveData.slice(-50);
    }
  }, [liveData, selectedRange]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <PageHeader 
            title="Real-Time Monitoring"
            subtitle="Live sensor data stream with selectable time windows"
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ButtonGroup variant="outlined" aria-label="Time range filter">
                <Button onClick={() => setSelectedRange(TIME_RANGES.LIVE)} variant={selectedRange === TIME_RANGES.LIVE ? 'contained' : 'outlined'}>Live</Button>
                <Button onClick={() => setSelectedRange(TIME_RANGES.LAST_10M)} variant={selectedRange === TIME_RANGES.LAST_10M ? 'contained' : 'outlined'}>10m</Button>
                <Button onClick={() => setSelectedRange(TIME_RANGES.LAST_1H)} variant={selectedRange === TIME_RANGES.LAST_1H ? 'contained' : 'outlined'}>1h</Button>
                <Button onClick={() => setSelectedRange(TIME_RANGES.LAST_24H)} variant={selectedRange === TIME_RANGES.LAST_24H ? 'contained' : 'outlined'}>24h</Button>
            </ButtonGroup>
            <Chip 
              label={isConnected ? 'Connected' : 'Disconnected'}
              color={isConnected ? 'success' : 'error'}
              variant="filled"
            />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box sx={{ flex: 3 }}>
          <LiveChart data={filteredChartData} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <AnomalyAlerts alerts={alerts} />
        </Box>
      </Box>
    </Box>
  );
};

export default Monitoring;