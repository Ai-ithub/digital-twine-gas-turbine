// src/pages/Optimization.jsx (Final version with separated components)

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Paper, Typography, Button, CircularProgress } from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import { fetchLatestRtoSuggestion, fetchEfficiencyHistory } from '../features/rto/rtoSlice';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BoltIcon from '@mui/icons-material/Bolt';

// --- THIS IS THE FIX: We create a separate component for the suggestion card ---
const SuggestionCard = () => {
  const { suggestion, status, error } = useSelector((state) => state.rto);

  if (status === 'loading' && !suggestion) return <CircularProgress />;
  if (status === 'failed' || !suggestion) {
      return (
          <Paper elevation={3} sx={{ p: 3, backgroundColor: 'error.light' }}>
              <Typography color="error.contrastText">{error || 'Error fetching RTO data.'}</Typography>
          </Paper>
      );
  }
  return (
      <Paper elevation={3} sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3,
                                  backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
          <BoltIcon sx={{ fontSize: 60 }} />
          <Box>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                  Optimization Suggestion
              </Typography>
              <Typography variant="body1">{suggestion.suggestion_text}</Typography>
          </Box>
          <Button variant="contained" color="secondary" startIcon={<CheckCircleIcon />}
                  sx={{ ml: 'auto', whiteSpace: 'nowrap' }}>
              Apply Suggestion
          </Button>
      </Paper>
  );
};


const Optimization = () => {
  const dispatch = useDispatch();
  const { history, historyStatus } = useSelector((state) => state.rto);

  useEffect(() => {
    const fetchData = () => {
      dispatch(fetchLatestRtoSuggestion());
      dispatch(fetchEfficiencyHistory());
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [dispatch]);
  
  const formatXAxis = (isoStr) => {
    if (!isoStr) return '';
    return new Date(isoStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box>
      <PageHeader
        title="Real-Time Optimization (RTO)"
        subtitle="Live recommendations to improve operational efficiency."
      />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        
        <SuggestionCard />

        <Paper elevation={3} sx={{ p: 3, height: '400px' }}>
            <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                <TrendingUpIcon color="action" sx={{mr: 1}}/>
                <Typography variant="h6">Efficiency Trend (Last 24 Hours)</Typography>
            </Box>
            {historyStatus === 'loading' ? <CircularProgress /> : (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" tickFormatter={formatXAxis} />
                        <YAxis domain={['dataMin - 1', 'dataMax + 1']} label={{ value: 'Efficiency (%)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip animationDuration={0} />
                        <Legend />
                        <Line type="monotone" dataKey="efficiency" stroke="#8884d8" name="Avg. Efficiency" activeDot={{ r: 8 }} isAnimationActive={false} />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </Paper>
      </Box>
    </Box>
  );
};

export default Optimization;