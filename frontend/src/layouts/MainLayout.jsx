// src/layouts/MainLayout.jsx

import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, CssBaseline } from '@mui/material';

// Import Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import TimelineIcon from '@mui/icons-material/Timeline';
import OnlinePredictionIcon from '@mui/icons-material/OnlinePrediction';
import BuildIcon from '@mui/icons-material/Build';
import companyLogo from '../assets/images/logo.png';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SettingsIcon from '@mui/icons-material/Settings';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';

const drawerWidth = 240;

const MainLayout = () => {
  const menuItems = [
    { text: 'Overview', icon: <DashboardIcon />, path: '/' },
    { text: 'Real-Time Monitoring', icon: <TimelineIcon />, path: '/monitoring' },
    { text: 'Alarms', icon: <NotificationsActiveIcon />, path: '/alarms' },
    { text: 'Optimization', icon: <OnlinePredictionIcon />, path: '/optimization' },
     { text: '3D Analysis', icon: <BubbleChartIcon />, path: '/3d-analysis' },
    { text: 'Control', icon: <SettingsIcon />, path: '/control' },
    { text: 'Maintenance', icon: <BuildIcon />, path: '/maintenance' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Compressor Monitoring Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        {/* --- THIS IS THE FIX: Wrap the logo's Box with an anchor tag --- */}
        <a 
          href="http://petropala.com/" 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <img src={companyLogo} alt="Company Logo" style={{ height: 40 }} />
            <Typography variant="h6" component="div">
              Petro Pala
            </Typography>
          </Box>
        </a>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton component={NavLink} to={item.path}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3, mt: '64px' }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;