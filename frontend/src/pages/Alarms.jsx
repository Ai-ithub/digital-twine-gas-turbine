// src/pages/Alarms.jsx

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Box, Paper, Grid, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import PageHeader from '../components/common/PageHeader';
import AnomalyAlerts from '../features/rtm/components/AnomalyAlerts';

// Final version with improved wrapping and vertical alignment
const CustomYAxisTick = (props) => {
  const { x, y, payload } = props;
  const text = String(payload.value || '');
  const maxCharsPerLine = 18; // You can adjust this for wider or narrower lines

  // A more robust way to wrap words
  const words = text.split('_');
  const lines = words.reduce((acc, word) => {
    const lastLine = acc[acc.length - 1];

    if (lastLine && (lastLine + ' ' + word).length <= maxCharsPerLine) {
      // Add word to the last line if it fits
      acc[acc.length - 1] = lastLine + ' ' + word;
    } else {
      // Otherwise, start a new line
      acc.push(word);
    }
    return acc;
  }, []);


  // This part vertically centers the text block against the bar's center
  const verticalOffset = -((lines.length - 1) * 0.5) * 12 + 4;

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={verticalOffset} textAnchor="end" fill="#666">
        {lines.map((line, i) => (
          <tspan key={i} x={0} dy={i === 0 ? 0 : '1.2em'}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
};

const Alarms = () => {
  const { alerts, anomalyCauseCounts } = useSelector((state) => state.rtm);

  const chartData = useMemo(() => {
    return Object.entries(anomalyCauseCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [anomalyCauseCounts]);

  // Filter alerts to show only those from the last 8 hours
  const filteredAlerts = useMemo(() => {
    const eightHoursAgo = Date.now() - (8 * 60 * 60 * 1000);
    return alerts.filter(alert => 
      new Date(alert.iso_timestamp).getTime() >= eightHoursAgo
    );
  }, [alerts]);


  return (
    <Box>
      <PageHeader
        title="Alarms & Anomaly Analysis"
        subtitle="Live feed of alerts and frequency analysis of anomaly causes."
      />
      <Grid container spacing={3}>
        {/* Anomaly Cause Frequency Chart */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6" gutterBottom>Anomaly Cause Frequency</Typography>
          <Paper sx={{ p: 2, height: '130vh', overflow: 'auto' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={150}
                  tick={<CustomYAxisTick />}
                  interval={0}
                />
                <Tooltip cursor={{ fill: '#f5f5f5' }} />
                <Legend />
                <Bar dataKey="count" name="Frequency of Cause" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Live Alerts List */}
        <Grid size={{ xs: 12 }}>
          {/* Use the new filtered list's length in the title */}
          <Typography variant="h6" gutterBottom>Real-Time Alerts (Last 8 Hours: {filteredAlerts.length})</Typography>
          <Paper sx={{ p: 2, height: '60vh', overflow: 'auto' }}>
            {/* Pass the new filtered list to the component */}
            <AnomalyAlerts alerts={filteredAlerts} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Alarms;