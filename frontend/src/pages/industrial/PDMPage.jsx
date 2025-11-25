/**
 * PDM (Predictive Maintenance) Page
 * Shows threshold gauges and control panel
 */

import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Card, CardContent } from '@mui/material';
import LinearGauge from '../../components/gauges/LinearGauge';
import CircularGauge from '../../components/gauges/CircularGauge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import PageHeader from '../../components/common/PageHeader';

const PDMPage = () => {
  const [thresholds, setThresholds] = useState({
    threshold1: 6.5,
    threshold2: 7.2,
    threshold3: 5.8,
    threshold4: 6.9,
  });

  // PDM Data
  const [pdmData, setPdmData] = useState({
    rul: 45, // Remaining Useful Life in days
    healthScore: 87,
    maintenanceSchedule: [
      { component: 'Compressor Blades', daysUntil: 12, priority: 'High', status: 'Warning' },
      { component: 'Bearing Assembly', daysUntil: 28, priority: 'Medium', status: 'Normal' },
      { component: 'Fuel Injectors', daysUntil: 35, priority: 'Low', status: 'Normal' },
      { component: 'Turbine Blades', daysUntil: 8, priority: 'High', status: 'Critical' },
      { component: 'Cooling System', daysUntil: 42, priority: 'Low', status: 'Normal' },
    ],
    componentHealth: [
      { name: 'Compressor', health: 82, trend: 'down' },
      { name: 'Turbine', health: 75, trend: 'down' },
      { name: 'Combustion', health: 91, trend: 'up' },
      { name: 'Bearing', health: 88, trend: 'stable' },
      { name: 'Cooling', health: 94, trend: 'up' },
    ],
    rulHistory: Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      rul: 60 - i * 0.5 + Math.sin(i * 0.2) * 3,
    })),
    failureProbability: [
      { component: 'Compressor', probability: 15, risk: 'Medium' },
      { component: 'Turbine', probability: 22, risk: 'High' },
      { component: 'Bearing', probability: 8, risk: 'Low' },
      { component: 'Fuel System', probability: 12, risk: 'Medium' },
      { component: 'Cooling', probability: 5, risk: 'Low' },
    ],
  });

  // Simulate real-time threshold updates
  useEffect(() => {
    const interval = setInterval(() => {
      setThresholds((prev) => ({
        threshold1: Math.max(4, Math.min(8, prev.threshold1 + (Math.random() - 0.5) * 0.3)),
        threshold2: Math.max(5, Math.min(9, prev.threshold2 + (Math.random() - 0.5) * 0.3)),
        threshold3: Math.max(4, Math.min(8, prev.threshold3 + (Math.random() - 0.5) * 0.3)),
        threshold4: Math.max(5, Math.min(9, prev.threshold4 + (Math.random() - 0.5) * 0.3)),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const [activeButtons, setActiveButtons] = useState({
    button1: false,
    button2: false,
    button3: false,
    button4: false,
    button5: false,
    button6: false,
    button7: false,
    button8: false,
    button9: false,
    button10: false,
    button11: false,
    button12: false,
  });

  const handleButtonClick = (button) => {
    setActiveButtons((prev) => ({
      ...prev,
      [button]: !prev[button],
    }));
  };

  return (
    <Box sx={{ width: '100%', height: '100%', p: 2 }}>
      <PageHeader
        title="Predictive Maintenance (PDM)"
        subtitle="Monitor component health and predict maintenance needs"
      />
      
      {/* RUL and Health Score Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>
                Remaining Useful Life
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularGauge
                  value={pdmData.rul}
                  min={0}
                  max={60}
                  label="RUL"
                  unit="days"
                  width={120}
                  height={120}
                />
              </Box>
              <Typography variant="h4" sx={{ color: '#FFFFFF', textAlign: 'center', mt: 2 }}>
                {pdmData.rul} days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>
                Overall Health Score
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularGauge
                  value={pdmData.healthScore}
                  min={0}
                  max={100}
                  label="Health"
                  unit="%"
                  width={120}
                  height={120}
                />
              </Box>
              <Typography variant="h4" sx={{ color: '#FFFFFF', textAlign: 'center', mt: 2 }}>
                {pdmData.healthScore}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>
                Upcoming Maintenance
              </Typography>
              <Typography variant="h4" sx={{ color: '#FF9800', textAlign: 'center', mb: 1 }}>
                {pdmData.maintenanceSchedule[0].daysUntil} days
              </Typography>
              <Typography variant="body2" sx={{ color: '#B0BEC5', textAlign: 'center' }}>
                {pdmData.maintenanceSchedule[0].component}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>
                Critical Alerts
              </Typography>
              <Typography variant="h4" sx={{ color: '#F44336', textAlign: 'center', mb: 1 }}>
                {pdmData.maintenanceSchedule.filter(m => m.status === 'Critical').length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#B0BEC5', textAlign: 'center' }}>
                Components requiring attention
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Left Panel - Thresholds */}
        <Grid item xs={12} md={3}>
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
              sx={{ color: '#8BC34A', mb: 3, textAlign: 'center', fontWeight: 600 }}
            >
              Thresholds
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <LinearGauge
                  value={thresholds.threshold1}
                  min={0}
                  max={10}
                  label="treshold1"
                  unit=""
                  height={140}
                  width={45}
                />
              </Grid>
              <Grid item>
                <LinearGauge
                  value={thresholds.threshold2}
                  min={0}
                  max={10}
                  label="treshold2"
                  unit=""
                  height={140}
                  width={45}
                />
              </Grid>
              <Grid item>
                <LinearGauge
                  value={thresholds.threshold3}
                  min={0}
                  max={10}
                  label="treshold3"
                  unit=""
                  height={140}
                  width={45}
                />
              </Grid>
              <Grid item>
                <LinearGauge
                  value={thresholds.threshold4}
                  min={0}
                  max={10}
                  label="treshold4"
                  unit=""
                  height={140}
                  width={45}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Middle Panel - Control Buttons */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              backgroundColor: '#1a1a1a',
              border: '2px solid #8BC34A',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Sensor Selector */}
            <Paper
              sx={{
                width: '80%',
                p: 1.5,
                mb: 3,
                backgroundColor: '#D3D3D3',
                borderRadius: '30px',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: '#000000',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontStyle: 'italic',
                }}
              >
                Sensor_2
              </Typography>
            </Paper>

            {/* RUN Button */}
            <Button
              variant="contained"
              sx={{
                width: '70%',
                height: 80,
                fontSize: '2rem',
                fontWeight: 700,
                backgroundColor: '#D3D3D3',
                color: '#000000',
                borderRadius: '40px',
                mb: 4,
                '&:hover': {
                  backgroundColor: '#BDBDBD',
                },
              }}
            >
              RUN
            </Button>

            {/* Control Buttons Grid */}
            <Grid container spacing={2} justifyContent="center">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                <Grid item key={num}>
                  <Button
                    variant="contained"
                    onClick={() => handleButtonClick(`button${num}`)}
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      backgroundColor: activeButtons[`button${num}`]
                        ? '#8BC34A'
                        : '#FFFFFF',
                      color: activeButtons[`button${num}`] ? '#000000' : '#000000',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                      '&:hover': {
                        backgroundColor: activeButtons[`button${num}`]
                          ? '#689F38'
                          : '#E0E0E0',
                      },
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Right Panel - Additional Controls */}
        <Grid item xs={12} md={3}>
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
              sx={{ color: '#8BC34A', mb: 3, textAlign: 'center', fontWeight: 600 }}
            >
              Gauge_parameter_2
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Paper
                sx={{
                  width: '100%',
                  p: 1.5,
                  backgroundColor: '#D3D3D3',
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: '#000000',
                    textAlign: 'center',
                    fontWeight: 600,
                  }}
                >
                  Select Parameters
                </Typography>
              </Paper>
            </Box>

            <Typography
              variant="h6"
              sx={{ color: '#8BC34A', mb: 3, textAlign: 'center', fontWeight: 600 }}
            >
              sensor_prameter_2
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Paper
                sx={{
                  width: '100%',
                  p: 1.5,
                  backgroundColor: '#D3D3D3',
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: '#000000',
                    textAlign: 'center',
                    fontWeight: 600,
                  }}
                >
                  Select Sensor
                </Typography>
              </Paper>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Additional Data Sections */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* RUL History Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>
              RUL Trend (30 Days)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={pdmData.rulHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="day" stroke="#8BC34A" />
                <YAxis stroke="#8BC34A" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #8BC34A' }} />
                <Legend />
                <Line type="monotone" dataKey="rul" stroke="#8BC34A" name="RUL (days)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Component Health Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>
              Component Health Status
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pdmData.componentHealth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#8BC34A" />
                <YAxis stroke="#8BC34A" domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #8BC34A' }} />
                <Legend />
                <Bar dataKey="health" fill="#8BC34A" name="Health %" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Maintenance Schedule Table */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>
              Maintenance Schedule
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#8BC34A' }}>Component</TableCell>
                    <TableCell sx={{ color: '#8BC34A' }}>Days Until</TableCell>
                    <TableCell sx={{ color: '#8BC34A' }}>Priority</TableCell>
                    <TableCell sx={{ color: '#8BC34A' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pdmData.maintenanceSchedule.map((row) => (
                    <TableRow key={row.component}>
                      <TableCell sx={{ color: '#FFFFFF' }}>{row.component}</TableCell>
                      <TableCell sx={{ color: '#FFFFFF' }}>{row.daysUntil}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.priority}
                          size="small"
                          color={
                            row.priority === 'High' ? 'error' :
                            row.priority === 'Medium' ? 'warning' : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          size="small"
                          color={
                            row.status === 'Critical' ? 'error' :
                            row.status === 'Warning' ? 'warning' : 'success'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Failure Probability Table */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>
              Failure Probability Analysis
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#8BC34A' }}>Component</TableCell>
                    <TableCell sx={{ color: '#8BC34A' }}>Probability</TableCell>
                    <TableCell sx={{ color: '#8BC34A' }}>Risk Level</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pdmData.failureProbability.map((row) => (
                    <TableRow key={row.component}>
                      <TableCell sx={{ color: '#FFFFFF' }}>{row.component}</TableCell>
                      <TableCell sx={{ color: '#FFFFFF' }}>{row.probability}%</TableCell>
                      <TableCell>
                        <Chip
                          label={row.risk}
                          size="small"
                          color={
                            row.risk === 'High' ? 'error' :
                            row.risk === 'Medium' ? 'warning' : 'default'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PDMPage;

