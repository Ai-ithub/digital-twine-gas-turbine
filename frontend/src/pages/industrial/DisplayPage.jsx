/**
 * Display Page - Main Dashboard
 * Shows gauges for Frequency, Pressure, Temperature, and Viscosity
 */

import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Paper, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import CircularGauge from '../../components/gauges/CircularGauge';
import LinearGauge from '../../components/gauges/LinearGauge';
import apiClient from '../../api/apiClient';

const DisplayPage = () => {
  const [sensorData, setSensorData] = useState({
    frequency: { amplitude: 45, frequence: 520 },
    pressure: {
      absolute: 680,
      static: 720,
      dynamic: 420,
      psi_compers: 0,
      psi_compers_s: 0,
      psi_compers_2: 0,
      psi_turbin: 0,
      P_C: 0,
      P_T: 0,
    },
    temperature: {
      relative: 75,
      surface: 82,
      internal: 78,
      point: 65,
      fluctuating: 71,
      freezing: 0,
      dew_point: 15,
      temp_vis: 80,
      flash_point: 150,
      TBN: 8,
    },
  });

  const [selectedSystem, setSelectedSystem] = useState('System 1');
  const [selectedGauge, setSelectedGauge] = useState('All Sensors');
  const [selectedSensor, setSelectedSensor] = useState('All Parameters');

  // Fetch real-time data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get('/data/real-time');
        if (response.data) {
          // Update with real data
          // setSensorData(response.data);
        }
      } catch (error) {
        console.error('Error fetching sensor data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      {/* Top Controls */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel sx={{ color: '#8BC34A' }}>System</InputLabel>
          <Select
            value={selectedSystem}
            label="System"
            onChange={(e) => setSelectedSystem(e.target.value)}
            sx={{
              color: '#FFFFFF',
              '.MuiOutlinedInput-notchedOutline': { borderColor: '#4CAF50' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#8BC34A' },
            }}
          >
            <MenuItem value="System 1">System 1</MenuItem>
            <MenuItem value="System 2">System 2</MenuItem>
            <MenuItem value="System 3">System 3</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel sx={{ color: '#8BC34A' }}>Gauge_parameter</InputLabel>
          <Select
            value={selectedGauge}
            label="Gauge_parameter"
            onChange={(e) => setSelectedGauge(e.target.value)}
            sx={{
              color: '#FFFFFF',
              '.MuiOutlinedInput-notchedOutline': { borderColor: '#4CAF50' },
            }}
          >
            <MenuItem value="All Sensors">All Sensors</MenuItem>
            <MenuItem value="Pressure">Pressure</MenuItem>
            <MenuItem value="Temperature">Temperature</MenuItem>
            <MenuItem value="Frequency">Frequency</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel sx={{ color: '#8BC34A' }}>sensor_prameter</InputLabel>
          <Select
            value={selectedSensor}
            label="sensor_prameter"
            onChange={(e) => setSelectedSensor(e.target.value)}
            sx={{
              color: '#FFFFFF',
              '.MuiOutlinedInput-notchedOutline': { borderColor: '#4CAF50' },
            }}
          >
            <MenuItem value="All Parameters">All Parameters</MenuItem>
            <MenuItem value="Primary">Primary Sensors</MenuItem>
            <MenuItem value="Secondary">Secondary Sensors</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Main Dashboard Grid */}
      <Grid container spacing={3}>
        {/* Frequency Section */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: '#0a0a0a',
              border: '2px solid #8BC34A',
            }}
          >
            <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2, fontWeight: 600 }}>
              Frequency
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <CircularGauge
                  value={sensorData.frequency.amplitude}
                  min={0}
                  max={100}
                  label="amplitude"
                  unit=""
                  width={140}
                  height={140}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <CircularGauge
                  value={sensorData.frequency.frequence}
                  min={0}
                  max={1000}
                  label="frequence"
                  unit="Hz"
                  width={140}
                  height={140}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Absolute Pressure Section */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: '#0a0a0a',
              border: '2px solid #8BC34A',
              height: '100%',
            }}
          >
            <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2, fontWeight: 600 }}>
              Absolute Pressure
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <CircularGauge
                  value={sensorData.pressure.absolute}
                  min={0}
                  max={1000}
                  label="psi-compers"
                  unit="psi"
                  width={140}
                  height={140}
                />
              </Grid>
              <Grid item>
                <CircularGauge
                  value={sensorData.pressure.psi_turbin}
                  min={0}
                  max={1000}
                  label="psi-turbin"
                  unit="psi"
                  width={140}
                  height={140}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Static Pressure Section */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: '#0a0a0a',
              border: '2px solid #8BC34A',
              height: '100%',
            }}
          >
            <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2, fontWeight: 600 }}>
              Static Pressure
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <CircularGauge
                  value={sensorData.pressure.static}
                  min={0}
                  max={1000}
                  label="psi-compers_s"
                  unit="psi"
                  width={140}
                  height={140}
                />
              </Grid>
              <Grid item>
                <CircularGauge
                  value={sensorData.pressure.psi_compers_2}
                  min={0}
                  max={1000}
                  label="psi-turbin_2"
                  unit="psi"
                  width={140}
                  height={140}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Dynamic Pressure Section */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: '#0a0a0a',
              border: '2px solid #8BC34A',
              height: '100%',
            }}
          >
            <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2, fontWeight: 600 }}>
              Dynamic Pressure
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <CircularGauge
                  value={sensorData.pressure.dynamic}
                  min={0}
                  max={1000}
                  label="psi-compers_s"
                  unit="psi"
                  width={140}
                  height={140}
                />
              </Grid>
              <Grid item>
                <CircularGauge
                  value={sensorData.pressure.psi_turbin}
                  min={0}
                  max={1000}
                  label="psi-turbin"
                  unit="psi"
                  width={140}
                  height={140}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Pressure Indicators */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: '#0a0a0a',
              border: '2px solid #8BC34A',
              height: '100%',
            }}
          >
            <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2, fontWeight: 600 }}>
              Pressure
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <LinearGauge
                  value={sensorData.pressure.P_C}
                  min={-100}
                  max={100}
                  label="P_C"
                  unit=""
                  height={150}
                  width={50}
                />
              </Grid>
              <Grid item>
                <LinearGauge
                  value={sensorData.pressure.P_T}
                  min={-100}
                  max={100}
                  label="P_T"
                  unit=""
                  height={150}
                  width={50}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Temperature Section */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: '#0a0a0a',
              border: '2px solid #8BC34A',
            }}
          >
            <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2, fontWeight: 600 }}>
              TEMP
            </Typography>
            <Grid container spacing={2}>
              {[
                { key: 'relative', label: 'Relative Temp' },
                { key: 'surface', label: 'Surface Temp' },
                { key: 'internal', label: 'Internal Temp' },
                { key: 'point', label: 'Point Temp' },
                { key: 'fluctuating', label: 'Fluctuating Temp' },
                { key: 'freezing', label: 'Freezing Point' },
                { key: 'dew_point', label: 'Dew Point' },
              ].map((temp) => (
                <Grid item xs={6} sm={4} md={3} lg={2} key={temp.key}>
                  <LinearGauge
                    value={sensorData.temperature[temp.key]}
                    min={0}
                    max={100}
                    label={temp.label}
                    unit="°C"
                    height={120}
                    width={40}
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Viscosity Section */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: '#0a0a0a',
              border: '2px solid #8BC34A',
            }}
          >
            <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2, fontWeight: 600 }}>
              Viscosity
            </Typography>
            <Grid container spacing={2}>
              {[
                { key: 'temp_vis', label: 'Temp_vis' },
                { key: 'flash_point', label: 'Flash Point' },
                { key: 'TBN', label: 'TBN' },
              ].map((visc) => (
                <Grid item xs={6} sm={4} md={2} key={visc.key}>
                  <LinearGauge
                    value={sensorData.temperature[visc.key]}
                    min={0}
                    max={visc.key === 'TBN' ? 20 : 200}
                    label={visc.label}
                    unit={visc.key === 'TBN' ? '' : '°C'}
                    height={120}
                    width={40}
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DisplayPage;

