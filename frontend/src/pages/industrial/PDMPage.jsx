/**
 * PDM (Predictive Maintenance) Page
 * Shows threshold gauges and control panel
 */

import React, { useState } from 'react';
import { Box, Grid, Typography, Paper, Button } from '@mui/material';
import LinearGauge from '../../components/gauges/LinearGauge';

const PDMPage = () => {
  const [thresholds, setThresholds] = useState({
    threshold1: 5,
    threshold2: 5,
    threshold3: 5,
    threshold4: 5,
  });

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
    </Box>
  );
};

export default PDMPage;

