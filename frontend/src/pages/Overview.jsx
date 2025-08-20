// src/pages/Overview.jsx (Final version with correct Grid sx prop)

import React, { useState, useEffect } from 'react';
import { Grid, Typography, CircularProgress, Box } from '@mui/material';
import StatCard from '../components/common/StatCard';
import { getSystemStatus } from '../api/rtmApi';
import PageHeader from '../components/common/PageHeader';

// Import icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SpeedIcon from '@mui/icons-material/Speed';
import ErrorIcon from '@mui/icons-material/Error';

const Overview = () => {
  const [kpiData, setKpiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        setLoading(true);
        const response = await getSystemStatus();
        setKpiData(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch overview data:", err);
        setError("Could not load system data. Please try again later.");
        setKpiData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  if (loading) {
    return (
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
            <CircularProgress />
        </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box>
      <PageHeader 
        title="System Overview"
        subtitle="A high-level summary of the compressor's current health"
      />
      
      <Grid container spacing={3}>
        {/* --- THIS IS THE FINAL FIX: Use the 'sx' prop for breakpoints --- */}
        <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="System Status"
            value={kpiData?.status || 'Unknown'}
            icon={<CheckCircleIcon fontSize="large" />}
            color="success.main"
          />
        </Grid>
        <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Remaining Useful Life"
            value={kpiData?.rul || 'N/A'}
            unit="days"
            icon={<ScheduleIcon fontSize="large" />}
            color="info.main"
          />
        </Grid>
        <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Avg. Efficiency"
            value={kpiData?.efficiency || 'N/A'}
            unit="%"
            icon={<SpeedIcon fontSize="large" />}
            color="warning.main"
          />
        </Grid>
        <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Alerts (24h)"
            value={kpiData?.alerts_24h || 0}
            icon={<ErrorIcon fontSize="large" />}
            color="error.main"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Overview;