// src/pages/Optimization.jsx (Final version connected to real API)

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Paper, Typography, Button, CircularProgress } from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import { fetchLatestRtoSuggestion } from '../features/rto/rtoSlice';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BoltIcon from '@mui/icons-material/Bolt';

const Optimization = () => {
  const dispatch = useDispatch();
  const { suggestion, status, error } = useSelector((state) => state.rto);

  // Fetch data every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchLatestRtoSuggestion());
    }, 5000); // 5000 ms = 5 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [dispatch]);

  const renderContent = () => {
    if (status === 'loading' && !suggestion) {
      return <CircularProgress />;
    }

    if (status === 'failed') {
      return <Typography color="error">{error?.suggestion_text || 'Error fetching data.'}</Typography>;
    }

    if (!suggestion) {
      return <Typography>Waiting for the first optimization suggestion...</Typography>;
    }

    return (
        <Paper 
            elevation={3} 
            sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3,
                  backgroundColor: 'primary.light', color: 'primary.contrastText' }}
        >
            <BoltIcon sx={{ fontSize: 60 }} />
            <Box>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                Optimization Suggestion
            </Typography>
            <Typography variant="body1">
                {suggestion.suggestion_text}
            </Typography>
            </Box>
            <Button 
            variant="contained" color="secondary" startIcon={<CheckCircleIcon />}
            sx={{ ml: 'auto', whiteSpace: 'nowrap' }}
            >
            Apply Suggestion
            </Button>
        </Paper>
    );
  };
  
  return (
    <Box>
      <PageHeader
        title="Real-Time Optimization (RTO)"
        subtitle="Live recommendations to improve operational efficiency."
      />
      {renderContent()}
      {/* The chart placeholder can be removed or developed later */}
    </Box>
  );
};

export default Optimization;