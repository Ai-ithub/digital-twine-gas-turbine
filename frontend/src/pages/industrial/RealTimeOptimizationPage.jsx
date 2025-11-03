/**
 * Real-Time Optimization Page
 * Optimization settings and intensity graph
 */

import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
} from '@mui/material';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from 'recharts';

const RealTimeOptimizationPage = () => {
  const [settings, setSettings] = useState({
    standardFunctions: '',
    algorithms: '',
    optimizationMethod: 'Quasi-newton',
    gradientMethod: 'Polak-Ribiere',
    lineMinimization: 'With Derivatives',
    functionTolerance: '1E-03',
    parameterTolerance: '1E-10',
    gradientTolerance: '1',
    maximumIterations: '10000',
    maximumFunctionCalls: '10000',
    maximumTime: '1',
  });

  // Generate intensity graph data
  const intensityData = Array.from({ length: 200 }, () => ({
    x: Math.random() * 130 - 5,
    y: Math.random() * 130 - 5,
    z: Math.random() * 2500,
  }));

  const handleSettingChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleRun = () => {
    console.log('Running optimization with settings:', settings);
    // TODO: Implement optimization logic
  };

  return (
    <Box sx={{ width: '100%', height: '100%', p: 2 }}>
      <Grid container spacing={3}>
        {/* Left Panel - Settings */}
        <Grid item xs={12} md={5}>
          <Paper
            sx={{
              p: 3,
              backgroundColor: '#C8E6C9',
              border: '2px solid #8BC34A',
              height: '100%',
            }}
          >
            {/* Standard Functions */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel sx={{ color: '#000000' }}>standard_Functions</InputLabel>
              <Select
                value={settings.standardFunctions}
                label="standard_Functions"
                onChange={(e) => handleSettingChange('standardFunctions', e.target.value)}
                sx={{
                  backgroundColor: '#FFFFFF',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#8BC34A' },
                }}
              >
                <MenuItem value="">Select...</MenuItem>
                <MenuItem value="func1">Function 1</MenuItem>
                <MenuItem value="func2">Function 2</MenuItem>
              </Select>
            </FormControl>

            {/* Algorithms */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel sx={{ color: '#000000' }}>Algorithms</InputLabel>
              <Select
                value={settings.algorithms}
                label="Algorithms"
                onChange={(e) => handleSettingChange('algorithms', e.target.value)}
                sx={{
                  backgroundColor: '#FFFFFF',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#8BC34A' },
                }}
              >
                <MenuItem value="">Select...</MenuItem>
                <MenuItem value="algo1">Algorithm 1</MenuItem>
                <MenuItem value="algo2">Algorithm 2</MenuItem>
              </Select>
            </FormControl>

            {/* Stopping Criteria */}
            <Paper sx={{ p: 2, mb: 2, backgroundColor: '#E8F5E9' }}>
              <Typography
                variant="subtitle2"
                sx={{ color: '#2E7D32', fontWeight: 600, mb: 2 }}
              >
                Stopping Criteria
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="function tolerance"
                    value={settings.functionTolerance}
                    onChange={(e) => handleSettingChange('functionTolerance', e.target.value)}
                    sx={{ backgroundColor: '#FFFFFF' }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="parameter tolerance"
                    value={settings.parameterTolerance}
                    onChange={(e) => handleSettingChange('parameterTolerance', e.target.value)}
                    sx={{ backgroundColor: '#FFFFFF' }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="gradient tolerance"
                    value={settings.gradientTolerance}
                    onChange={(e) => handleSettingChange('gradientTolerance', e.target.value)}
                    sx={{ backgroundColor: '#FFFFFF' }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="maximum iterations"
                    value={settings.maximumIterations}
                    onChange={(e) => handleSettingChange('maximumIterations', e.target.value)}
                    sx={{ backgroundColor: '#FFFFFF' }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="maximum function calls"
                    value={settings.maximumFunctionCalls}
                    onChange={(e) => handleSettingChange('maximumFunctionCalls', e.target.value)}
                    sx={{ backgroundColor: '#FFFFFF' }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="maximum time"
                    value={settings.maximumTime}
                    onChange={(e) => handleSettingChange('maximumTime', e.target.value)}
                    sx={{ backgroundColor: '#FFFFFF' }}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Optimization Method */}
            <Paper sx={{ p: 2, mb: 2, backgroundColor: '#E8F5E9' }}>
              <Typography
                variant="subtitle2"
                sx={{ color: '#2E7D32', fontWeight: 600, mb: 1 }}
              >
                Optimization Method
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={settings.optimizationMethod}
                  onChange={(e) => handleSettingChange('optimizationMethod', e.target.value)}
                  sx={{
                    backgroundColor: '#FFFFFF',
                    fontSize: '0.9rem',
                  }}
                >
                  <MenuItem value="Quasi-newton">Quasi-newton</MenuItem>
                  <MenuItem value="Newton">Newton</MenuItem>
                  <MenuItem value="Gradient Descent">Gradient Descent</MenuItem>
                </Select>
              </FormControl>
            </Paper>

            {/* Conjugate Gradient Settings */}
            <Paper sx={{ p: 2, backgroundColor: '#E8F5E9' }}>
              <Typography
                variant="subtitle2"
                sx={{ color: '#2E7D32', fontWeight: 600, mb: 1 }}
              >
                Conjugate Gradient Settings
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: '#2E7D32' }}>
                    gradient method
                  </Typography>
                  <Select
                    fullWidth
                    size="small"
                    value={settings.gradientMethod}
                    onChange={(e) => handleSettingChange('gradientMethod', e.target.value)}
                    sx={{ backgroundColor: '#FFFFFF', fontSize: '0.9rem' }}
                  >
                    <MenuItem value="Polak-Ribiere">Polak-Ribiere</MenuItem>
                    <MenuItem value="Fletcher-Reeves">Fletcher-Reeves</MenuItem>
                  </Select>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: '#2E7D32' }}>
                    line minimization
                  </Typography>
                  <Select
                    fullWidth
                    size="small"
                    value={settings.lineMinimization}
                    onChange={(e) => handleSettingChange('lineMinimization', e.target.value)}
                    sx={{ backgroundColor: '#FFFFFF', fontSize: '0.9rem' }}
                  >
                    <MenuItem value="With Derivatives">With Derivatives</MenuItem>
                    <MenuItem value="Without Derivatives">Without Derivatives</MenuItem>
                  </Select>
                </Grid>
              </Grid>
            </Paper>
          </Paper>
        </Grid>

        {/* Right Panel - Visualization */}
        <Grid item xs={12} md={7}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: '#1a1a1a',
              border: '2px solid #8BC34A',
              height: '100%',
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: '#8BC34A', mb: 2, fontStyle: 'italic' }}
            >
              Intensity Graph_8
            </Typography>
            <ResponsiveContainer width="100%" height={500}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="x(t-1)"
                  stroke="#8BC34A"
                  domain={[-5, 130]}
                  label={{
                    value: 'x(t-1)',
                    position: 'insideBottom',
                    offset: -10,
                    fill: '#8BC34A',
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="y(t)"
                  stroke="#8BC34A"
                  domain={[-5, 130]}
                  label={{
                    value: 'x(t)',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#8BC34A',
                  }}
                />
                <ZAxis type="number" dataKey="z" range={[50, 400]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #8BC34A',
                    color: '#FFFFFF',
                  }}
                />
                <Scatter
                  name="Intensity"
                  data={intensityData}
                  fill="#8BC34A"
                  fillOpacity={0.6}
                />
              </ScatterChart>
            </ResponsiveContainer>

            {/* RUN Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                variant="contained"
                onClick={handleRun}
                sx={{
                  width: '60%',
                  height: 60,
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  backgroundColor: '#D3D3D3',
                  color: '#000000',
                  borderRadius: '30px',
                  '&:hover': {
                    backgroundColor: '#BDBDBD',
                  },
                }}
              >
                RUN
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RealTimeOptimizationPage;

