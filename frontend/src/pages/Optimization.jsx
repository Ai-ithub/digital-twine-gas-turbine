// src/pages/Optimization.jsx (Final version using Box for layout)

import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Paper, Typography, Button } from '@mui/material';
// We don't need Grid, so we remove the import to avoid issues
import PageHeader from '../components/common/PageHeader';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BoltIcon from '@mui/icons-material/Bolt';

const Optimization = () => {
  const { suggestion } = useSelector((state) => state.rto);

  return (
    <Box>
      <PageHeader
        title="Real-Time Optimization (RTO)"
        subtitle="Live recommendations to improve operational efficiency."
      />
      
      {/* We use a main Box with vertical flex layout */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        
        {/* Suggestion Card */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 3,
            backgroundColor: 'primary.light',
            color: 'primary.contrastText'
          }}
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
            variant="contained" 
            color="secondary" 
            startIcon={<CheckCircleIcon />}
            sx={{ ml: 'auto', whiteSpace: 'nowrap' }}
          >
            Apply Suggestion
          </Button>
        </Paper>

        {/* Efficiency History Chart Placeholder */}
        <Paper elevation={3} sx={{ p: 3, height: '400px' }}>
            <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                <TrendingUpIcon color="action" sx={{mr: 1}}/>
                <Typography variant="h6">
                    Efficiency Trend (Last 5 Hours)
                </Typography>
            </Box>
            <Box 
                sx={{
                    height: '300px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    backgroundColor: '#f5f5f5', 
                    borderRadius: 1
                }}
            >
                <Typography color="text.secondary">
                    Chart component will be implemented here.
                </Typography>
            </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Optimization;