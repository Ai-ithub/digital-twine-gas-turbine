// src/pages/Checklist.jsx

import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Paper, Typography, Grid, FormGroup, FormControlLabel, Checkbox, LinearProgress, Button } from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import { toggleChecklistItem } from '../features/checklist/checklistSlice';

const Checklist = () => {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.checklist);

  const handleToggle = (id) => {
    dispatch(toggleChecklistItem(id));
  };

  const categories = useMemo(() => 
    [...new Set(items.map(item => item.category))]
  , [items]);

  const completionRate = useMemo(() => 
    (items.filter(item => item.checked).length / items.length) * 100
  , [items]);

  return (
    <Box>
      <PageHeader
        title="System Checklist"
        subtitle="Pre-operational and routine maintenance checks."
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Typography variant="h6">Completion: {completionRate.toFixed(0)}%</Typography>
        <LinearProgress variant="determinate" value={completionRate} sx={{ width: '50%', height: 10, borderRadius: 5 }} />
      </Box>

      <Grid container spacing={4}>
        {categories.map(category => (
          <Grid size={{ xs: 12, md: 6 }} key={category}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>{category}</Typography>
              <FormGroup>
                {items.filter(item => item.category === category).map(item => (
                  <FormControlLabel 
                    key={item.id}
                    control={<Checkbox checked={item.checked} onChange={() => handleToggle(item.id)} />} 
                    label={item.text}
                    sx={{ textDecoration: item.checked ? 'line-through' : 'none', color: item.checked ? 'text.secondary' : 'text.primary' }}
                  />
                ))}
              </FormGroup>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button 
          variant="contained" 
          color="primary"
          size="large"
          disabled={completionRate < 100}
        >
          {completionRate === 100 ? "All Checks Complete" : "Submit Checklist"}
        </Button>
      </Box>
    </Box>
  );
};

export default Checklist;