// src/pages/Monitoring.jsx

import React, { useCallback, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Chip, ButtonGroup, Button, Typography, Grid, Paper } from '@mui/material';
// 💡 Dot را از recharts اضافه می‌کنیم
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Dot } from 'recharts';

import {
  addDataPoint,
  addAlert,
  markAsAnomaly,
} from '../features/rtm/rtmSlice';

import useWebSocket from '../hooks/useWebSocket';
import PageHeader from '../components/common/PageHeader';
import AnomalyAlerts from '../features/rtm/components/AnomalyAlerts';

// ثابت‌ها برای بازه‌های زمانی
const TIME_RANGES = {
  LIVE: 'Live',
  LAST_10M: '10m',
  LAST_1H: '1h',
  LAST_24H: '24h',
};

const Monitoring = () => {
  const { liveData, alerts } = useSelector((state) => state.rtm);
  const dispatch = useDispatch();
  const [selectedRange, setSelectedRange] = useState(TIME_RANGES.LIVE);

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
      isAnomaly: false,
    };
    dispatch(addDataPoint(newPointForChart));
  }, [dispatch]);

  // --- شروع تغییرات ---
  // منطق دریافت هشدار جدید با ساخت ID واقعاً منحصربه‌فرد
  const handleNewAlert = useCallback((alertData) => {
    // برای تضمین منحصربه‌فرد بودن، از ترکیب timestamp، یک عدد تصادفی و جزئیات هشدار استفاده می‌کنیم.
    const uniqueId = `${Date.now()}-${Math.random()}-${alertData.details}`;

    const newAlert = {
      id: uniqueId, // از ID جدید و تضمین‌شده استفاده می‌کنیم
      timestamp: new Date(alertData.timestamp).toLocaleTimeString(),
      message: alertData.details,
    };
    
    dispatch(addAlert(newAlert));

    if (alertData.time_id) {
      dispatch(markAsAnomaly(alertData.time_id));
    }
  }, [dispatch]);
  // --- پایان تغییرات ---
  
  const { isConnected } = useWebSocket({
    'new_data': handleNewData,
    'new_alert': handleNewAlert,
  });
  
  const filteredChartData = useMemo(() => {
    const now = Date.now();
    switch (selectedRange) {
      case TIME_RANGES.LAST_10M:
        return liveData.filter(d => new Date(d.timestamp).getTime() >= (now - 10 * 60 * 1000));
      case TIME_RANGES.LAST_1H:
        return liveData.filter(d => new Date(d.timestamp).getTime() >= (now - 60 * 60 * 1000));
      case TIME_RANGES.LAST_24H:
        return liveData.filter(d => new Date(d.timestamp).getTime() >= (now - 24 * 60 * 60 * 1000));
      case TIME_RANGES.LIVE:
      default:
        return liveData.slice(-50);
    }
  }, [liveData, selectedRange]);

  const histogramData = useMemo(() => {
    const bins = {};
    filteredChartData.forEach(d => {
      const bin = Math.floor(d.Vibration || 0);
      bins[bin] = (bins[bin] || 0) + 1;
    });
    return Object.keys(bins).map(key => ({ range: key, frequency: bins[key] }));
  }, [filteredChartData]);

  // --- ✅ شروع تغییر ---
  // این تابع را برای رندر کردن نقاط ناهنجاری اضافه می‌کنیم
  const renderCustomDot = (props) => {
    const { cx, cy, payload } = props;

    // اگر نقطه داده ناهنجاری بود، یک دایره قرمز بزرگتر نمایش بده
    if (payload.isAnomaly) {
      return (
        <circle
          key={payload.time_id}
          cx={cx}
          cy={cy}
          r={6}
          fill="red"
          stroke="white"
          strokeWidth={2}
        />
      );
    }
    
    // اگر نمی‌خواهید برای نقاط عادی دایره‌ای نمایش داده شود، null برگردانید
    return null;
  };
  // --- ✅ پایان تغییر ---

  return (
    <Box>
      {/* هدر صفحه و کنترل‌ها */}
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
                <Button onClick={() => setSelectedRange(TIME_RANGES.LAST_24H)} variant={selectedRange === TIME_RANGES.LAST_24H ? 'contained' : 'outlined'}>24h</Button>
            </ButtonGroup>
            <Chip 
              label={isConnected ? 'Connected' : 'Disconnected'}
              color={isConnected ? 'success' : 'error'}
              variant="filled"
            />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* نمودار ۱: فشار و دما */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 2, height: '350px' }}>
            <Typography variant="h6" gutterBottom>Pressure & Temperature</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={filteredChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                {/* ✅ تغییر: dot را به renderCustomDot متصل می‌کنیم */}
                <Line yAxisId="left" type="monotone" dataKey="Pressure_In" stroke="#8884d8" name="Pressure (bar)" dot={renderCustomDot} isAnimationActive={false} />
                <Line yAxisId="right" type="monotone" dataKey="Temperature_In" stroke="#82ca9d" name="Temp (°C)" dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* نمودار ۲: معیارهای عملکردی */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 2, height: '350px' }}>
            <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={filteredChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" stroke="#ffc658" domain={[0, 110]} label={{ value: 'Percent / Flow', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#e91e63" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="Efficiency" stroke="#ff7300" name="Efficiency (%)" dot={false} isAnimationActive={false} />
                <Line yAxisId="left" type="monotone" dataKey="Flow_Rate" stroke="#ffc658" name="Flow Rate" dot={false} isAnimationActive={false} />
                <Line yAxisId="right" type="monotone" dataKey="Power_Consumption" stroke="#e91e63" name="Power (kW)" dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* نمودار سیگنال نویز (لرزش) */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 2, height: '300px' }}>
            <Typography variant="h6" gutterBottom>Noise Signal (Vibration)</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={filteredChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[-2, 2]} />
                <Tooltip />
                {/* ✅ تغییر: dot را به renderCustomDot متصل می‌کنیم */}
                <Line type="monotone" dataKey="Vibration" stroke="#8884d8" dot={renderCustomDot} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* هیستوگرام لرزش */}
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
        
        {/* بخش هشدارها */}
        <Grid size={{ xs: 12 }}>
           <Paper sx={{ p: 2, height: '450px', overflow: 'auto' }}>
            <AnomalyAlerts alerts={alerts} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Monitoring;