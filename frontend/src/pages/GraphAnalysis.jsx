// src/pages/GraphAnalysis.jsx

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Paper, Typography, Grid, Select, MenuItem, FormControl, InputLabel, Button, CircularProgress } from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import { LineChart, Line, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchAnalysisData } from '../features/analysis/analysisSlice';

const GraphAnalysis = () => {
    const dispatch = useDispatch();
    // We take data and state from the Redux store
    const { trendData, correlationData, distributionData, status } = useSelector((state) => state.analysis);
    
    // State for the user's selections
    const [sensor1, setSensor1] = useState('Vibration');
    const [sensor2, setSensor2] = useState('Efficiency');
    const [timeRange, setTimeRange] = useState('-24h');
    const [analysisType, setAnalysisType] = useState('trend');

    const handleGenerateAnalysis = () => {
        dispatch(fetchAnalysisData({ analysis_type: analysisType, time_range: timeRange, sensor1, sensor2 }));
    };
    
    const sensorOptions = ["Pressure_In", "Temperature_In", "Flow_Rate", "Vibration", "Efficiency", "Power_Consumption"];
    const timeRangeOptions = { "Last Hour": "-1h", "Last 6 Hours": "-6h", "Last 24 Hours": "-24h", "Last 7 Days": "-7d" };

    // This function renders the appropriate chart based on the analysis type
    const renderChart = () => {
        if (status === 'loading') return <CircularProgress />;
        
        switch (analysisType) {
          case 'correlation':
            return (
              <>
                <Typography variant="h6" align="center" gutterBottom>
                  Correlation Coefficient: {correlationData.correlation_coefficient?.toFixed(4) || 'N/A'}
                </Typography>
                <ResponsiveContainer width="100%" height="90%">
                  <ScatterChart>
                    <CartesianGrid />
                    <XAxis type="number" dataKey={sensor1} name={sensor1} />
                    <YAxis type="number" dataKey={sensor2} name={sensor2} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter data={correlationData.plot_data} fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </>
            );
          case 'distribution':
            return (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            );
          case 'trend':
          default:
            return (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" tickFormatter={(timeStr) => new Date(timeStr).toLocaleTimeString()} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey={sensor1} name={sensor1} stroke="#8884d8" dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            );
        }
    };

    // **The main change is here**
    // We define a variable to check for the existence of data in each possible state
    const isDataAvailable = 
        (analysisType === 'trend' && trendData.length > 0) ||
        (analysisType === 'distribution' && distributionData.length > 0) ||
        (analysisType === 'correlation' && correlationData.plot_data && correlationData.plot_data.length > 0);

    return (
        <Box>
            <PageHeader
                title="Graph Analysis"
                subtitle="Perform detailed historical analysis on sensor data."
            />
            <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
                <Grid container spacing={2} alignItems="flex-end">
                    <Grid><FormControl sx={{ minWidth: 200 }}><InputLabel>Parameter 1</InputLabel><Select value={sensor1} label="Parameter 1" onChange={(e) => setSensor1(e.target.value)}>{sensorOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}</Select></FormControl></Grid>
                    {analysisType === 'correlation' && (
                      <Grid><FormControl sx={{ minWidth: 200 }}><InputLabel>Parameter 2</InputLabel><Select value={sensor2} label="Parameter 2" onChange={(e) => setSensor2(e.target.value)}>{sensorOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}</Select></FormControl></Grid>
                    )}
                    <Grid><FormControl sx={{ minWidth: 180 }}><InputLabel>Time Range</InputLabel><Select value={timeRange} label="Time Range" onChange={(e) => setTimeRange(e.target.value)}>{Object.entries(timeRangeOptions).map(([label, value]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}</Select></FormControl></Grid>
                    <Grid><FormControl sx={{ minWidth: 180 }}><InputLabel>Analysis Type</InputLabel><Select value={analysisType} label="Analysis Type" onChange={(e) => setAnalysisType(e.target.value)}><MenuItem value="trend">Trend</MenuItem><MenuItem value="correlation">Correlation</MenuItem><MenuItem value="distribution">Distribution</MenuItem></Select></FormControl></Grid>
                    <Grid><Button variant="contained" onClick={handleGenerateAnalysis}>Generate Analysis</Button></Grid>
                </Grid>
            </Paper>
            <Paper elevation={3} sx={{ p: 2, height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                {/* **Corrected line** */}
                {/* Instead of `data` we use the `isDataAvailable` variable */}
                {!isDataAvailable && status !== 'loading' ? 
                    <Typography color="text.secondary">No data to display. Please generate an analysis.</Typography> 
                    : renderChart()
                }
            </Paper>
        </Box>
    );
};

export default GraphAnalysis;