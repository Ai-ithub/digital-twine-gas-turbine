/**
 * Linear/Vertical Gauge Component
 * Thermometer-style gauge for temperature and pressure
 */

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const LinearGauge = ({
  value = 0,
  min = 0,
  max = 100,
  label = '',
  unit = '',
  height = 200,
  width = 60,
  warningThreshold = 70,
  criticalThreshold = 90,
}) => {
  const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);

  const getColor = () => {
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
        minWidth: width + 40,
      }}
    >
      {/* Label */}
      <Typography
        variant="caption"
        sx={{
          color: '#8BC34A',
          fontWeight: 600,
          textAlign: 'center',
          mb: 1,
          fontSize: '0.75rem',
        }}
      >
        {label}
      </Typography>

      {/* Max value */}
      <Typography variant="caption" sx={{ color: '#B0BEC5', fontSize: '0.7rem' }}>
        {max}
      </Typography>

      {/* Gauge Bar */}
      <Box
        sx={{
          width: width,
          height: height,
          backgroundColor: '#333333',
          border: '2px solid #666666',
          borderRadius: '8px',
          position: 'relative',
          overflow: 'hidden',
          my: 1,
        }}
      >
        {/* Fill */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: `${percentage}%`,
            backgroundColor: getColor(),
            transition: 'height 0.5s ease, background-color 0.3s ease',
            borderRadius: '6px 6px 0 0',
          }}
        />
        
        {/* Scale marks */}
        {[0, 25, 50, 75, 100].map((mark) => (
          <Box
            key={mark}
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: `${mark}%`,
              height: '1px',
              backgroundColor: '#666666',
            }}
          />
        ))}
      </Box>

      {/* Min value */}
      <Typography variant="caption" sx={{ color: '#B0BEC5', fontSize: '0.7rem' }}>
        {min}
      </Typography>

      {/* Current Value */}
      <Box
        sx={{
          mt: 1,
          px: 1,
          py: 0.5,
          backgroundColor: '#000000',
          border: '1px solid #4CAF50',
          borderRadius: '4px',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '1rem',
            textAlign: 'center',
          }}
        >
          {typeof value === 'number' ? value.toFixed(0) : value}
        </Typography>
      </Box>

      {/* Unit */}
      {unit && (
        <Typography
          variant="caption"
          sx={{
            color: '#B0BEC5',
            fontSize: '0.65rem',
            mt: 0.5,
          }}
        >
          {unit}
        </Typography>
      )}
    </Paper>
  );
};

export default LinearGauge;

