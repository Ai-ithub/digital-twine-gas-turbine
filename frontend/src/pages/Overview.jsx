// src/pages/SystemOverview.jsx (or Overview.jsx)

import React, { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Grid, CircularProgress, Icon } from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard'; // Assuming StatCard exists here

// --- Actions and New Icons ---
import { fetchLatestRul } from '../features/pdm/pdmSlice';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import DangerousIcon from '@mui/icons-material/Dangerous';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SpeedIcon from '@mui/icons-material/Speed';
import ErrorIcon from '@mui/icons-material/Error';

const SystemOverview = () => {
  const dispatch = useDispatch();

  // --- Data fetching logic remains the same ---
  const { liveData, alerts } = useSelector((state) => state.rtm);
  const { data: pdmData, status: pdmStatus } = useSelector((state) => state.pdm);

  useEffect(() => {
    dispatch(fetchLatestRul());
  }, [dispatch]);

  // --- Calculation logic remains the same ---
  const alerts8hCount = useMemo(() => {
    const eightHoursAgo = Date.now() - (8 * 60 * 60 * 1000);
    return alerts.filter(alert => 
      new Date(alert.iso_timestamp).getTime() >= eightHoursAgo
    ).length;
  }, [alerts]);

  const avgEfficiency = useMemo(() => {
    if (!liveData || liveData.length === 0) return { value: 'N/A', unit: '%' };
    const total = liveData.reduce((sum, point) => sum + point.Efficiency, 0);
    return { value: (total / liveData.length).toFixed(1), unit: '%' };
  }, [liveData]);
  
  const systemStatus = useMemo(() => {
    if (pdmStatus !== 'succeeded' || !pdmData) {
      return { text: 'Loading...', icon: <CircularProgress size="large" />, color: 'text.secondary' };
    }
    const rul = pdmData.rul_value;
    if (rul > 30) {
      return { text: 'Normal', icon: <CheckCircleIcon fontSize="large" />, color: 'success.main' };
    }
    if (rul > 7) {
      return { text: 'Warning', icon: <WarningIcon fontSize="large" />, color: 'warning.main' };
    }
    return { text: 'Critical', icon: <DangerousIcon fontSize="large" />, color: 'error.main' };
  }, [pdmData, pdmStatus]);

  const rulValue = useMemo(() => {
    if (pdmStatus !== 'succeeded' || !pdmData) return { value: '...', unit: 'days' };
    return { value: pdmData.rul_value.toFixed(0), unit: 'days' };
  }, [pdmData, pdmStatus]);

  return (
    <Box>
      <PageHeader
        title="System Overview"
        subtitle="A high-level summary of the compressor's current health"
      />
      <Grid container spacing={3}>
        {/* --- Using StatCard with new icons and dynamic data --- */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="System Status"
            value={systemStatus.text}
            icon={systemStatus.icon}
            color={systemStatus.color}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Remaining Useful Life"
            value={rulValue.value}
            unit={rulValue.unit}
            icon={<ScheduleIcon fontSize="large" />}
            color="info.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Avg. Efficiency"
            value={avgEfficiency.value}
            unit={avgEfficiency.unit}
            icon={<SpeedIcon fontSize="large" />}
            color="warning.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Alerts (8h)"
            value={alerts8hCount}
            icon={<ErrorIcon fontSize="large" />}
            color={alerts8hCount > 0 ? 'error.main' : 'text.secondary'}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default SystemOverview;