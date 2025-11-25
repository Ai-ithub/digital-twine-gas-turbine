// src/pages/DataLogger.jsx

import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Card, CardContent, Button, IconButton, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const DataLogger = () => {
  const [loggers, setLoggers] = useState([
    {
      id: 1,
      name: 'Pressure Logger',
      type: 'Pressure Sensors',
      status: 'Active',
      samplingRate: '10 Hz',
      dataPoints: 125000,
      fileSize: '2.5 MB',
      lastRecord: new Date().toLocaleString(),
      location: 'Compressor Stage 1',
      format: 'CSV',
    },
    {
      id: 2,
      name: 'Temperature Logger',
      type: 'Temperature Sensors',
      status: 'Active',
      samplingRate: '5 Hz',
      dataPoints: 62500,
      fileSize: '1.2 MB',
      lastRecord: new Date(Date.now() - 2000).toLocaleString(),
      location: 'Turbine Inlet',
      format: 'CSV',
    },
    {
      id: 3,
      name: 'Vibration Logger',
      type: 'Vibration Sensors',
      status: 'Active',
      samplingRate: '100 Hz',
      dataPoints: 1250000,
      fileSize: '15.8 MB',
      lastRecord: new Date(Date.now() - 1000).toLocaleString(),
      location: 'Bearing Assembly',
      format: 'Binary',
    },
    {
      id: 4,
      name: 'Flow Logger',
      type: 'Flow Meters',
      status: 'Active',
      samplingRate: '1 Hz',
      dataPoints: 12500,
      fileSize: '0.3 MB',
      lastRecord: new Date(Date.now() - 3000).toLocaleString(),
      location: 'Inlet Duct',
      format: 'CSV',
    },
    {
      id: 5,
      name: 'Power Logger',
      type: 'Power Meters',
      status: 'Active',
      samplingRate: '2 Hz',
      dataPoints: 25000,
      fileSize: '0.6 MB',
      lastRecord: new Date(Date.now() - 2000).toLocaleString(),
      location: 'Control Panel',
      format: 'CSV',
    },
    {
      id: 6,
      name: 'Efficiency Logger',
      type: 'Calculated',
      status: 'Paused',
      samplingRate: '0.5 Hz',
      dataPoints: 6250,
      fileSize: '0.15 MB',
      lastRecord: new Date(Date.now() - 60000).toLocaleString(),
      location: 'System Level',
      format: 'JSON',
    },
    {
      id: 7,
      name: 'Emissions Logger',
      type: 'Gas Analyzers',
      status: 'Active',
      samplingRate: '0.1 Hz',
      dataPoints: 1250,
      fileSize: '0.08 MB',
      lastRecord: new Date(Date.now() - 10000).toLocaleString(),
      location: 'Exhaust Stack',
      format: 'CSV',
    },
    {
      id: 8,
      name: 'Control Logger',
      type: 'Control Signals',
      status: 'Active',
      samplingRate: '20 Hz',
      dataPoints: 250000,
      fileSize: '5.2 MB',
      lastRecord: new Date().toLocaleString(),
      location: 'Control System',
      format: 'Binary',
    },
  ]);

  const [selectedLogger, setSelectedLogger] = useState(null);
  const [loggingStats, setLoggingStats] = useState({
    totalDataPoints: 1750000,
    totalFileSize: '25.7 MB',
    activeLoggers: 7,
    dataRate: '2.5 MB/hour',
    storageUsed: '45%',
    storageAvailable: '55%',
  });

  // Sample logged data for visualization
  const loggedData = Array.from({ length: 50 }, (_, i) => ({
    timestamp: new Date(Date.now() - (50 - i) * 60000).toLocaleTimeString(),
    pressure: 1.2 + Math.sin(i * 0.2) * 0.2 + Math.random() * 0.1,
    temperature: 720 + Math.sin(i * 0.15) * 30 + Math.random() * 10,
    vibration: 12 + Math.sin(i * 0.25) * 3 + Math.random() * 1,
    flow: 45 + Math.sin(i * 0.18) * 5 + Math.random() * 2,
  }));

  const dataRateHistory = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    rate: 2.0 + Math.sin(i * 0.3) * 0.5 + Math.random() * 0.2,
    points: 100000 + Math.sin(i * 0.25) * 20000 + Math.random() * 10000,
  }));

  const handleToggleLogger = (loggerId) => {
    setLoggers((prev) =>
      prev.map((logger) =>
        logger.id === loggerId
          ? { ...logger, status: logger.status === 'Active' ? 'Paused' : 'Active' }
          : logger
      )
    );
  };

  const handleDownload = (loggerId) => {
    const logger = loggers.find((l) => l.id === loggerId);
    console.log(`Downloading data from ${logger?.name}`);
    // TODO: Implement download functionality
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLoggers((prev) =>
        prev.map((logger) => {
          if (logger.status === 'Active') {
            return {
              ...logger,
              dataPoints: logger.dataPoints + Math.floor(Math.random() * 10),
              lastRecord: new Date().toLocaleString(),
            };
          }
          return logger;
        })
      );
      setLoggingStats((prev) => ({
        ...prev,
        totalDataPoints: prev.totalDataPoints + Math.floor(Math.random() * 50),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box>
      <PageHeader
        title="Data Loggers"
        subtitle="Monitor and manage data logging systems"
      />

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#8BC34A', mb: 1 }}>
                Active Loggers
              </Typography>
              <Typography variant="h4" sx={{ color: '#FFFFFF' }}>
                {loggingStats.activeLoggers}/{loggers.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#8BC34A', mb: 1 }}>
                Total Data Points
              </Typography>
              <Typography variant="h4" sx={{ color: '#FFFFFF' }}>
                {(loggingStats.totalDataPoints / 1000).toFixed(0)}K
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#8BC34A', mb: 1 }}>
                Total File Size
              </Typography>
              <Typography variant="h4" sx={{ color: '#FFFFFF' }}>
                {loggingStats.totalFileSize}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#8BC34A', mb: 1 }}>
                Data Rate
              </Typography>
              <Typography variant="h4" sx={{ color: '#FFFFFF' }}>
                {loggingStats.dataRate}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Loggers Table */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#8BC34A' }}>
                Data Loggers
              </Typography>
              <IconButton sx={{ color: '#8BC34A' }}>
                <RefreshIcon />
              </IconButton>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#8BC34A' }}>Name</TableCell>
                    <TableCell sx={{ color: '#8BC34A' }}>Type</TableCell>
                    <TableCell sx={{ color: '#8BC34A' }}>Status</TableCell>
                    <TableCell sx={{ color: '#8BC34A' }}>Rate</TableCell>
                    <TableCell sx={{ color: '#8BC34A' }}>Data Points</TableCell>
                    <TableCell sx={{ color: '#8BC34A' }}>File Size</TableCell>
                    <TableCell sx={{ color: '#8BC34A' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loggers.map((logger) => (
                    <TableRow key={logger.id}>
                      <TableCell sx={{ color: '#FFFFFF' }}>{logger.name}</TableCell>
                      <TableCell sx={{ color: '#B0BEC5' }}>{logger.type}</TableCell>
                      <TableCell>
                        <Chip
                          icon={logger.status === 'Active' ? <CheckCircleIcon /> : <ErrorIcon />}
                          label={logger.status}
                          size="small"
                          color={logger.status === 'Active' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#FFFFFF' }}>{logger.samplingRate}</TableCell>
                      <TableCell sx={{ color: '#B0BEC5' }}>{logger.dataPoints.toLocaleString()}</TableCell>
                      <TableCell sx={{ color: '#B0BEC5' }}>{logger.fileSize}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleLogger(logger.id)}
                            sx={{ color: logger.status === 'Active' ? '#FF9800' : '#4CAF50' }}
                          >
                            {logger.status === 'Active' ? <StopIcon /> : <PlayArrowIcon />}
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDownload(logger.id)}
                            sx={{ color: '#8BC34A' }}
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Logger Details & Controls */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A', mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>
              Logger Configuration
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel sx={{ color: '#8BC34A' }}>Select Logger</InputLabel>
              <Select
                value={selectedLogger || ''}
                onChange={(e) => setSelectedLogger(e.target.value)}
                label="Select Logger"
                sx={{ color: '#FFFFFF' }}
              >
                {loggers.map((logger) => (
                  <MenuItem key={logger.id} value={logger.id}>
                    {logger.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {selectedLogger && (
              <Box>
                {(() => {
                  const logger = loggers.find((l) => l.id === selectedLogger);
                  return logger ? (
                    <Box>
                      <Typography variant="body2" sx={{ color: '#B0BEC5', mb: 1 }}>
                        Location: {logger.location}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#B0BEC5', mb: 1 }}>
                        Format: {logger.format}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#B0BEC5', mb: 1 }}>
                        Last Record: {logger.lastRecord}
                      </Typography>
                    </Box>
                  ) : null;
                })()}
              </Box>
            )}
          </Paper>

          {/* Storage Information */}
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>
              Storage Information
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#B0BEC5' }}>Used</Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                  {loggingStats.storageUsed}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: '100%',
                  height: 20,
                  backgroundColor: '#333',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    width: loggingStats.storageUsed,
                    height: '100%',
                    backgroundColor: '#8BC34A',
                  }}
                />
              </Box>
            </Box>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#B0BEC5' }}>Available</Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                  {loggingStats.storageAvailable}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Logged Data Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>
              Recent Logged Data (Last 50 Minutes)
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={loggedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="timestamp" stroke="#8BC34A" angle={-45} textAnchor="end" height={80} />
                <YAxis yAxisId="left" stroke="#8BC34A" />
                <YAxis yAxisId="right" orientation="right" stroke="#FF9800" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #8BC34A' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="pressure" stroke="#2196F3" name="Pressure (bar)" />
                <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#FF5722" name="Temperature (°C)" />
                <Line yAxisId="right" type="monotone" dataKey="vibration" stroke="#4CAF50" name="Vibration (mm/s)" />
                <Line yAxisId="right" type="monotone" dataKey="flow" stroke="#FF9800" name="Flow (kg/s)" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Data Rate Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>
              Data Logging Rate (Last 24 Hours)
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={dataRateHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="hour" stroke="#8BC34A" label={{ value: 'Hour', position: 'insideBottom', fill: '#8BC34A' }} />
                <YAxis yAxisId="left" stroke="#8BC34A" label={{ value: 'Rate (MB/h)', angle: -90, position: 'insideLeft', fill: '#8BC34A' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#FF9800" label={{ value: 'Data Points', angle: 90, position: 'insideRight', fill: '#FF9800' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #8BC34A' }} />
                <Legend />
                <Bar yAxisId="left" dataKey="rate" fill="#8BC34A" name="Data Rate (MB/h)" />
                <Line yAxisId="right" type="monotone" dataKey="points" stroke="#FF9800" name="Data Points" strokeWidth={2} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DataLogger;

