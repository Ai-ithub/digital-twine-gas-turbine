// src/pages/Alarms.jsx

import React, { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, Paper, Button, List, ListItem, ListItemText, Divider, Chip, CircularProgress, Grid } from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import useWebSocket from '../hooks/useWebSocket';
import { fetchAlarmsHistory, addActiveAlarm, acknowledgeAlarm } from '../features/alarms/alarmsSlice';

// Icons
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HistoryIcon from '@mui/icons-material/History';

const AlarmItem = ({ alarm, onAcknowledge }) => {
  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2, borderLeft: `4px solid ${alarm.acknowledged ? 'grey' : '#f44336'}` }}>
      <WarningAmberIcon color={alarm.acknowledged ? "disabled" : "error"} />
      <ListItemText
        primary={alarm.alert_type}
        secondary={alarm.details}
      />
      <Box sx={{ textAlign: 'right', ml: 'auto' }}>
        <Typography variant="caption" display="block">
          {new Date(alarm.timestamp).toLocaleString()}
        </Typography>
        {!alarm.acknowledged && (
          <Button
            size="small"
            variant="outlined"
            onClick={() => onAcknowledge(alarm.id)}
            sx={{ mt: 1 }}
          >
            Acknowledge
          </Button>
        )}
      </Box>
    </Paper>
  );
};

const Alarms = () => {
  const dispatch = useDispatch();
  const { active, history, status } = useSelector((state) => state.alarms);

  const handleNewAlert = useCallback((alertData) => {
    // WebSocket pushes new alerts into our Redux store
    dispatch(addActiveAlarm(alertData));
  }, [dispatch]);

  // Connect to WebSocket to listen for new alerts
  useWebSocket({ 'new_alert': handleNewAlert });

  // Fetch initial historical alarms when the component mounts
  useEffect(() => {
    dispatch(fetchAlarmsHistory());
  }, [dispatch]);

  const handleAcknowledge = (alarmId) => {
    dispatch(acknowledgeAlarm(alarmId));
  };

  return (
    <Box>
      <PageHeader
        title="Alarm Management"
        subtitle="View and manage real-time system alerts."
      />
      <Grid container spacing={4}>
        {/* Active Alarms Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6" gutterBottom>Active Alarms ({active.length})</Typography>
          {status === 'loading' && <CircularProgress />}
          <Paper elevation={1} sx={{ p: 2, maxHeight: '60vh', overflow: 'auto' }}>
            {active.length > 0 ? (
              <List>
                {active.map(alarm => // <<<<<<< اصلاح شده
                    <AlarmItem
                        key={`active-${alarm.id}`} // <<<<<<< اصلاح شده
                        alarm={alarm} 
                        onAcknowledge={handleAcknowledge}
                    />
                )}
              </List>
            ) : (
              <Typography sx={{ p: 2, color: 'text.secondary' }}>No active alarms.</Typography>
            )}
          </Paper>
        </Grid>
        
        {/* Alarm History Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6" gutterBottom>Alarm History ({history.length})</Typography>
          <Paper elevation={1} sx={{ p: 2, maxHeight: '60vh', overflow: 'auto' }}>
            {history.length > 0 ? (
              <List>
                {history.map(alarm => <AlarmItem key={`history-${alarm.id}`} alarm={alarm} />)}
              </List>
            ) : (
              <Typography sx={{ p: 2, color: 'text.secondary' }}>No acknowledged alarms in history.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Alarms;