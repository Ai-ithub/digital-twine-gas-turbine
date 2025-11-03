/**
 * Circular Gauge Component
 * Industrial-style gauge similar to the dashboard images
 */

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Gauge } from '@mui/x-charts/Gauge';

const CircularGauge = ({
  value = 0,
  min = 0,
  max = 100,
  label = '',
  unit = '',
  width = 150,
  height = 150,
  warningThreshold = 70,
  criticalThreshold = 90,
}) => {
  // Determine color based on value
  const getColor = () => {
    const percentage = ((value - min) / (max - min)) * 100;
    if (percentage >= criticalThreshold) return '#F44336'; // Red
    if (percentage >= warningThreshold) return '#FF9800'; // Orange
    return '#8BC34A'; // Green
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        border: '1px solid #4CAF50',
        borderRadius: '8px',
        minWidth: width,
      }}
    >
      {/* Label */}
      <Typography
        variant="h6"
        sx={{
          color: '#8BC34A',
          fontWeight: 600,
          textAlign: 'center',
          mb: 1,
          fontSize: '0.875rem',
        }}
      >
        {label}
      </Typography>

      {/* Gauge */}
      <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
        <Gauge
          width={width}
          height={height}
          value={value}
          valueMin={min}
          valueMax={max}
          sx={{
            '& .MuiGauge-valueArc': {
              fill: getColor(),
            },
            '& .MuiGauge-referenceArc': {
              fill: '#333333',
            },
          }}
        />
      </Box>

      {/* Value Display */}
      <Box
        sx={{
          mt: -5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '1.5rem',
          }}
        >
          {typeof value === 'number' ? value.toFixed(1) : value}
        </Typography>
        {unit && (
          <Typography
            variant="caption"
            sx={{
              color: '#B0BEC5',
              fontSize: '0.75rem',
            }}
          >
            {unit}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default CircularGauge;

