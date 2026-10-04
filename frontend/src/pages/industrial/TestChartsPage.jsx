/**
 * Test Charts Page - for debugging
 * A simple page for testing charts
 */

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
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
} from 'recharts';

// Simple test data
const testData = [
  { name: 'A', value: 10 },
  { name: 'B', value: 30 },
  { name: 'C', value: 20 },
  { name: 'D', value: 40 },
  { name: 'E', value: 25 },
];

const TestChartsPage = () => {
  console.log('TestChartsPage rendered');
  console.log('Test Data:', testData);

  return (
    <Box sx={{ p: 3, backgroundColor: '#000000', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ color: '#8BC34A', mb: 3 }}>
        🧪 Test Charts Page
      </Typography>

      {/* Test 1: Simple Line Chart */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: '#1a1a1a' }}>
        <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2 }}>
          ✅ Test 1: Simple Line Chart
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={testData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#8BC34A" />
            <YAxis stroke="#8BC34A" />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#8BC34A" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* Test 2: Simple Bar Chart */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: '#1a1a1a' }}>
        <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2 }}>
          ✅ Test 2: Simple Bar Chart
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={testData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#8BC34A" />
            <YAxis stroke="#8BC34A" />
            <Tooltip />
            <Bar dataKey="value" fill="#8BC34A" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* Result */}
      <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
        <Typography variant="body1" sx={{ color: '#FFFFFF' }}>
          ✅ If you see the charts → recharts works!
        </Typography>
        <Typography variant="body1" sx={{ color: '#FFFFFF', mt: 1 }}>
          ❌ If the charts are missing → Check the Console (F12)
        </Typography>
      </Paper>
    </Box>
  );
};

export default TestChartsPage;

