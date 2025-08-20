// src/layouts/MainLayout.jsx

import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Box, Drawer, AppBar, Toolbar, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, CssBaseline } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TimelineIcon from '@mui/icons-material/Timeline';
import SettingsIcon from '@mui/icons-material/Settings';
import BuildIcon from '@mui/icons-material/Build';

const drawerWidth = 240;

const MainLayout = () => {
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Overview', icon: <DashboardIcon />, path: '/' },
    { text: 'Real-Time Monitoring', icon: <TimelineIcon />, path: '/monitoring' },
    { text: 'Optimization', icon: <SettingsIcon />, path: '/optimization' },
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
        <Toolbar />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton onClick={() => navigate(item.path)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3, marginTop: '64px' }}
      >
        {/* محتوای هر صفحه اینجا نمایش داده می‌شود */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;