// src/pages/Monitoring.jsx

import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Box, Chip, ButtonGroup, Button, Typography, Grid, Paper } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import PageHeader from '../components/common/PageHeader';
// 1. کامپوننت DynamicChart ایمپورت شد
import DynamicChart from '../features/rtm/components/DynamicChart'; 

// Constants for time ranges
const TIME_RANGES = {
  LIVE: 'Live',
  LAST_10M: '10m',
  LAST_1H: '1h',
  LAST_8H: '8h',
};

const Monitoring = () => {
  const { liveData, isConnected } = useSelector((state) => state.rtm);
  const [selectedRange, setSelectedRange] = useState(TIME_RANGES.LIVE);

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
        // Show the latest 75 points for live view performance
        return liveData.slice(-75);
    }
  }, [liveData, selectedRange]);

  const histogramData = useMemo(() => {
    const bins = {};
    displayData.forEach(d => {
      // Create bins based on rounded vibration value
      const bin = Math.floor(d.Vibration || 0);
      bins[bin] = (bins[bin] || 0) + 1;
    });
    return Object.keys(bins).map(key => ({ range: key, frequency: bins[key] }));
  }, [displayData]);
  
  // 2. کامپوننت DynamicChart و createAnomalyDotRenderer حذف شدند

  return (
    <Box>
      {/* Page Header and Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <PageHeader 
            title="Real-Time Monitoring (Gas Turbine Compressor)"
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
        
        {/* Chart 1: Compressor Core: Pressure & Flow */}
        <DynamicChart 
            title="Compressor Core: Pressure & Flow (Air/Gas)"
            dataKeys={[
                { key: "Pressure_In", name: "Inlet Pressure (bar)", color: "#8884d8", yAxisId: "pressure" },
                { key: "Pressure_Out", name: "Outlet Pressure (bar)", color: "#4C4CA8", yAxisId: "pressure" },
                { key: "Flow_Rate", name: "Flow Rate (kg/s)", color: "#ffc658", yAxisId: "flow", orientation: "right" },
            ]}
            yAxisLabel="Pressure (bar)"
            yAxisId="pressure"
            orientation="left"
            data={displayData} // 3. ارسال داده
        />

        {/* Chart 2: Compressor Core: Temperature */}
        <DynamicChart 
            title="Compressor Core: Temperature (Air/Gas)"
            dataKeys={[
                { key: "Temperature_In", name: "Inlet Temp (°C)", color: "#ff7300" },
                { key: "Temperature_Out", name: "Outlet Temp (°C)", color: "#82ca9d" },
            ]}
            yAxisLabel="Temperature (°C)"
            data={displayData} // 3. ارسال داده
        />

        {/* Chart 3: Key Performance Indicators (KPIs) */}
        <DynamicChart 
            title="Key Performance Indicators (KPIs)"
            dataKeys={[
                { key: "Efficiency", name: "Efficiency (%)", color: "#e91e63" },
                { key: "Power_Consumption", name: "Power Consumption (kW)", color: "#00bcd4", yAxisId: "power", orientation: "right" },
                { key: "Load_Factor", name: "Load Factor (%)", color: "#4caf50", yAxisId: "kpi" },
            ]}
            yAxisLabel="Efficiency (%)"
            yAxisId="kpi"
            orientation="left"
            data={displayData} // 3. ارسال داده
        />
        
        {/* Chart 4: Vibration - Time Domain (Raw) */}
        <DynamicChart 
            title="Vibration - Time Domain (Raw Signal)"
            dataKeys={[
                { key: "Vibration", name: "Vibration (mm/s)", color: "#8884d8" },
            ]}
            yAxisLabel="Vibration Amplitude (mm/s)"
            data={displayData} // 3. ارسال داده
        />

        {/* Chart 5: Vibration - Frequency Domain */}
        <DynamicChart 
            title="Vibration - Frequency Domain"
            dataKeys={[
                { key: "Frequency", name: "Frequency (Hz)", color: "#03a9f4" },
                { key: "Amplitude", name: "Amplitude", color: "#9c27b0" },
                { key: "Phase_Angle", name: "Phase Angle (Deg)", color: "#ff9800" },
            ]}
            yAxisLabel="Value"
            data={displayData} // 3. ارسال داده
        />
        
        {/* Chart 6: Vibration - Statistical Metrics */}
        <DynamicChart 
            title="Vibration - Statistical Metrics (Advanced)"
            dataKeys={[
                { key: "vib_std", name: "Std. Dev.", color: "#00bcd4" },
                { key: "vib_max", name: "Max", color: "#ff5722" },
                { key: "vib_mean", name: "Mean", color: "#4caf50" },
                { key: "vib_rms", name: "RMS", color: "#673ab7" },
            ]}
            yAxisLabel="Vibration Metric (mm/s)"
            data={displayData} // 3. ارسال داده
        />
        
        {/* Chart 7: Ambient Conditions */}
        <DynamicChart 
            title="Ambient Conditions"
            dataKeys={[
                { key: "Ambient_Temperature", name: "Ambient Temp (°C)", color: "#e91e63" },
                { key: "Humidity", name: "Humidity (%)", color: "#03a9f4" },
                { key: "Air_Pollution", name: "Air Pollution", color: "#ff9800" },
            ]}
            yAxisLabel="Value"
            data={displayData} // 3. ارسال داده
        />

        {/* Chart 8: Fluid Characteristics */}
        <DynamicChart 
            title="Fluid Characteristics"
            dataKeys={[
                { key: "Density", name: "Density (kg/m³)", color: "#9c27b0" },
                { key: "Viscosity", name: "Viscosity (Pa·s)", color: "#009688" },
                { key: "Fuel_Quality", name: "Fuel Quality (%)", color: "#795548" },
                { key: "Velocity", name: "Velocity (m/s)", color: "#f44336" },
            ]}
            yAxisLabel="Value"
            data={displayData} // 3. ارسال داده
        />

        {/* Chart 9: Mechanical State & Quality Factors */}
        <DynamicChart 
            title="Mechanical State & Quality Factors"
            dataKeys={[
                { key: "Mass", name: "Mass (kg)", color: "#607d8b" },
                { key: "Stiffness", name: "Stiffness (N/m)", color: "#ffeb3b" },
                { key: "Damping", name: "Damping", color: "#42a5f5" },
                { key: "Maintenance_Quality", name: "Maintenance Quality (%)", color: "#26a69a" },
            ]}
            yAxisLabel="Value"
            data={displayData} // 3. ارسال داده
        />
        
        {/* Chart 10: Vibration Histogram - Bar Chart (Kept as the last item) */}
        {/* توجه: چون این نمودار از نوع BarChart است و DynamicChart از نوع LineChart، این قسمت دست نخورده باقی می‌ماند. */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 2, height: '350px' }}>
            <Typography variant="h6" gutterBottom>Vibration Histogram</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={histogramData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" label={{ value: 'Vibration Range (mm/s)', position: 'insideBottom', offset: -5 }}/>
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