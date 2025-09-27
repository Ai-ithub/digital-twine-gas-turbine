// src/pages/Monitoring.jsx

import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Box, Chip, ButtonGroup, Button, Typography, Grid, Paper } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import PageHeader from '../components/common/PageHeader';

// Constants for time ranges
const TIME_RANGES = {
  LIVE: 'Live',
  LAST_10M: '10m',
  LAST_1H: '1h',
  LAST_8H: '8h',
};

const Monitoring = () => {
  // We now get isConnected directly from the Redux store
  const { liveData, alerts, isConnected } = useSelector((state) => state.rtm);
  const [selectedRange, setSelectedRange] = useState(TIME_RANGES.LIVE);

  // All WebSocket related logic (useCallback, useDispatch, useWebSocket) is removed from here.
  
  const displayData = useMemo(() => {
    const now = Date.now();
    switch (selectedRange) {
      case TIME_RANGES.LAST_10M:
        return liveData.filter(d => new Date(d.timestamp).getTime() >= (now - 10 * 60 * 1000));
      case TIME_RANGES.LAST_1H:
        return liveData.filter(d => new Date(d.timestamp).getTime() >= (now - 60 * 60 * 1000));
      case TIME_RANGES.LAST_8H:
        return liveData.filter(d => new Date(d.timestamp).getTime() >= (now - 8 * 60 * 60 * 1000));
      case TIME_RANGES.LIVE:
      default:
        return liveData.slice(-75);
    }
  }, [liveData, selectedRange]);

  const histogramData = useMemo(() => {
    const bins = {};
    displayData.forEach(d => {
      const bin = Math.floor(d.Vibration || 0);
      bins[bin] = (bins[bin] || 0) + 1;
    });
    return Object.keys(bins).map(key => ({ range: key, frequency: bins[key] }));
  }, [displayData]);

  const createAnomalyDotRenderer = (dataKey) => (props) => {
    const { cx, cy, payload, index } = props;
    if (payload.anomalyCauses && payload.anomalyCauses.includes(dataKey)) {
      return <circle key={`anomaly-dot-${index}`} cx={cx} cy={cy} r={6} fill="red" stroke="white" strokeWidth={2} />;
    }
    return null;
  };

  return (
    <Box>
      {/* Page Header and Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <PageHeader 
            title="Real-Time Monitoring"
            subtitle="Live sensor data stream with selectable time windows"
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <ButtonGroup variant="outlined" aria-label="Time range filter">
                <Button onClick={() => setSelectedRange(TIME_RANGES.LIVE)} variant={selectedRange === TIME_RANGES.LIVE ? 'contained' : 'outlined'}>Live</Button>
                <Button onClick={() => setSelectedRange(TIME_RANGES.LAST_10M)} variant={selectedRange === TIME_RANGES.LAST_10M ? 'contained' : 'outlined'}>10m</Button>
                <Button onClick={() => setSelectedRange(TIME_RANGES.LAST_1H)} variant={selectedRange === TIME_RANGES.LAST_1H ? 'contained' : 'outlined'}>1h</Button>
                <Button onClick={() => setSelectedRange(TIME_RANGES.LAST_8H)} variant={selectedRange === TIME_RANGES.LAST_8H ? 'contained' : 'outlined'}>8h</Button>
            </ButtonGroup>
            <Chip 
              label={isConnected ? 'Connected' : 'Disconnected'}
              color={isConnected ? 'success' : 'error'}
              variant="filled"
            />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Chart 1: Pressure & Temperature */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 2, height: '350px' }}>
            <Typography variant="h6" gutterBottom>Pressure & Temperature</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="Pressure_In" stroke="#8884d8" name="Pressure (bar)" dot={createAnomalyDotRenderer('Pressure_In')} isAnimationActive={false} />
                {/* CHANGE HERE 1 */}
                <Line yAxisId="right" type="monotone" dataKey="Temperature_In" stroke="#82ca9d" name="Temp (°C)" dot={createAnomalyDotRenderer('Temperature_In')} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Chart 2: Performance Metrics */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 2, height: '350px' }}>
            <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" stroke="#ffc658" domain={[0, 110]} label={{ value: 'Percent / Flow', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#e91e63" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="Efficiency" stroke="#ff7300" name="Efficiency (%)" dot={false} isAnimationActive={false} />
                {/* CHANGE HERE 2 */}
                <Line yAxisId="left" type="monotone" dataKey="Flow_Rate" stroke="#ffc658" name="Flow Rate" dot={createAnomalyDotRenderer('Flow_Rate')} isAnimationActive={false} />
                {/* CHANGE HERE 3 */}
                <Line yAxisId="right" type="monotone" dataKey="Power_Consumption" stroke="#e91e63" name="Power (kW)" dot={createAnomalyDotRenderer('Power_Consumption')} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Noise Signal Chart (Vibration) */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 2, height: '300px' }}>
            <Typography variant="h6" gutterBottom>Noise Signal (Vibration)</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[-2, 2]} />
                <Tooltip />
                <Line type="monotone" dataKey="Vibration" stroke="#8884d8" dot={createAnomalyDotRenderer('Vibration')} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Vibration Histogram */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 2, height: '300px' }}>
            <Typography variant="h6" gutterBottom>Vibration Histogram</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={histogramData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" label={{ value: 'Vibration Range', position: 'insideBottom', offset: -5 }}/>
                <YAxis label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="frequency" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>      
      </Grid>
    </Box>
  );
};

export default Monitoring;