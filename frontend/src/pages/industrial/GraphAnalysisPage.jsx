/**
 * Graph Analysis Page
 * Shows Noise Signal chart and Histogram
 */

import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Paper, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const GraphAnalysisPage = () => {
  const [selectedGauge, setSelectedGauge] = useState('Gauge');
  const [selectedSensor, setSelectedSensor] = useState('SENSOR');
  const [selectedRealTime, setSelectedRealTime] = useState('REAL_TIME_M');

  // Generate sample noise signal data
  const [noiseData, setNoiseData] = useState([]);
  const [histogramData, setHistogramData] = useState([]);

  useEffect(() => {
    // Generate noise signal data (simulating real-time data)
    const generateNoiseData = () => {
      const data = [];
      for (let i = 0; i <= 100; i++) {
        data.push({
          time: i / 100,
          amplitude: Math.random() * 4 - 2 + Math.sin(i / 5) * 1.5,
        });
      }
      return data;
    };

    // Generate histogram data (normal distribution)
    const generateHistogramData = () => {
      const data = [];
      const bins = 50;
      const mean = 0;
      const stdDev = 1.5;

      for (let i = -6; i <= 6; i += 12 / bins) {
        const count = Math.exp(-Math.pow(i - mean, 2) / (2 * stdDev * stdDev)) * 100;
        data.push({
          bin: i.toFixed(1),
          count: count + Math.random() * 10,
        });
      }
      return data;
    };

    setNoiseData(generateNoiseData());
    setHistogramData(generateHistogramData());

    // Update data periodically
    const interval = setInterval(() => {
      setNoiseData(generateNoiseData());
    }, 3000);

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
          <InputLabel sx={{ color: '#8BC34A' }}>Gauge</InputLabel>
          <Select
            value={selectedGauge}
            label="Gauge"
            onChange={(e) => setSelectedGauge(e.target.value)}
            sx={{
              color: '#FFFFFF',
              '.MuiOutlinedInput-notchedOutline': { borderColor: '#4CAF50' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#8BC34A' },
            }}
          >
            <MenuItem value="Gauge">Gauge</MenuItem>
            <MenuItem value="Gauge_1">Gauge_1</MenuItem>
            <MenuItem value="Gauge_2">Gauge_2</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel sx={{ color: '#8BC34A' }}>SENSOR</InputLabel>
          <Select
            value={selectedSensor}
            label="SENSOR"
            onChange={(e) => setSelectedSensor(e.target.value)}
            sx={{
              color: '#FFFFFF',
              '.MuiOutlinedInput-notchedOutline': { borderColor: '#4CAF50' },
            }}
          >
            <MenuItem value="SENSOR">SENSOR</MenuItem>
            <MenuItem value="SENSOR_1">SENSOR_1</MenuItem>
            <MenuItem value="SENSOR_2">SENSOR_2</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel sx={{ color: '#8BC34A' }}>REAL_TIME_M</InputLabel>
          <Select
            value={selectedRealTime}
            label="REAL_TIME_M"
            onChange={(e) => setSelectedRealTime(e.target.value)}
            sx={{
              color: '#FFFFFF',
              '.MuiOutlinedInput-notchedOutline': { borderColor: '#4CAF50' },
            }}
          >
            <MenuItem value="REAL_TIME_M">REAL_TIME_M</MenuItem>
            <MenuItem value="REAL_TIME_H">REAL_TIME_H</MenuItem>
            <MenuItem value="REAL_TIME_D">REAL_TIME_D</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Title */}
      <Paper
        sx={{
          p: 1,
          mb: 2,
          backgroundColor: '#D3D3D3',
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" sx={{ color: '#000000', fontWeight: 600, fontStyle: 'italic' }}>
          Geaph
        </Typography>
      </Paper>

      {/* Charts */}
      <Grid container spacing={2}>
        {/* Noise Signal Chart */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: '#1a1a1a',
              border: '2px solid #8BC34A',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: '#FFFFFF',
                mb: 2,
                fontWeight: 600,
                fontStyle: 'italic',
              }}
            >
              Noise Signal
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={noiseData}
                margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                <XAxis
                  dataKey="time"
                  stroke="#8BC34A"
                  label={{
                    value: 'Time',
                    position: 'insideBottom',
                    offset: -10,
                    fill: '#8BC34A',
                  }}
                  tickFormatter={(value) => value.toFixed(2)}
                />
                <YAxis
                  stroke="#8BC34A"
                  label={{
                    value: 'Amplitude',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#8BC34A',
                  }}
                  domain={[-20, 20]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #8BC34A',
                    color: '#FFFFFF',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amplitude"
                  stroke="#8BC34A"
                  strokeWidth={2}
                  dot={false}
                  animationDuration={500}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Histogram of Noise */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: '#1a1a1a',
              border: '2px solid #8BC34A',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: '#FFFFFF',
                mb: 2,
                fontWeight: 600,
                fontStyle: 'italic',
              }}
            >
              Histogram of Noise
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={histogramData}
                margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                <XAxis
                  dataKey="bin"
                  stroke="#8BC34A"
                  label={{
                    value: 'Amplitude Bins',
                    position: 'insideBottom',
                    offset: -10,
                    fill: '#8BC34A',
                  }}
                />
                <YAxis
                  stroke="#8BC34A"
                  label={{
                    value: 'Histogram',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#8BC34A',
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #8BC34A',
                    color: '#FFFFFF',
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#8B0000"
                  stroke="#8B0000"
                  strokeWidth={0}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GraphAnalysisPage;

