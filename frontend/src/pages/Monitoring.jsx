// src/pages/Monitoring.jsx (With Time Filter)

import React, { useCallback, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Chip, ButtonGroup, Button, CircularProgress, Typography } from '@mui/material';

// --- Import the new thunk and reducer ---
import { 
  addDataPoint, 
  addAlert, 
  markAsAnomaly,
  fetchHistoricalData,
  clearHistoricalData
} from '../features/rtm/rtmSlice';

import useWebSocket from '../hooks/useWebSocket';
import PageHeader from '../components/common/PageHeader';
import LiveChart from '../features/rtm/components/LiveChart';
import AnomalyAlerts from '../features/rtm/components/AnomalyAlerts';

const TIME_RANGES = {
  LIVE: 'Live',
  LAST_10M: '-10m',
  LAST_1H: '-1h',
  LAST_24H: '-24h',
};

const Monitoring = () => {
  const { liveData, alerts, historicalData, status } = useSelector((state) => state.rtm);
  const dispatch = useDispatch();
  const [selectedRange, setSelectedRange] = useState(TIME_RANGES.LIVE);

  // --- WebSocket Handlers (same as before) ---
  const handleNewData = useCallback((dataPoint) => {
    const newPointForChart = {
      time_id: dataPoint.Time,
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
  
  // --- Effect to fetch data when time range changes ---
  useEffect(() => {
    if (selectedRange === TIME_RANGES.LIVE) {
      dispatch(clearHistoricalData());
    } else {
      dispatch(fetchHistoricalData(selectedRange));
    }
  }, [selectedRange, dispatch]);

  const chartData = selectedRange === TIME_RANGES.LIVE ? liveData : historicalData;
  const isLoading = status === 'loading';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <PageHeader 
            title="Real-Time Monitoring"
            subtitle="Live and historical sensor data stream"
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
          {isLoading ? <CircularProgress /> : <LiveChart data={chartData} />}
          {status === 'failed' && <Typography color="error">Could not load historical data.</Typography>}
        </Box>
        <Box sx={{ flex: 1 }}>
          <AnomalyAlerts alerts={alerts} />
        </Box>
      </Box>
    </Box>
  );
};

export default Monitoring;