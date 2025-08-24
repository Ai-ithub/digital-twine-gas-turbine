// src/routes/AppRouter.jsx

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

// Import all page components
import Overview from '../pages/Overview.jsx';
import Monitoring from '../pages/Monitoring.jsx';
import Optimization from '../pages/Optimization.jsx';
import Maintenance from '../pages/Maintenance.jsx';


const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Overview />} /> {/* 'index' makes it the default */}
          <Route path="monitoring" element={<Monitoring />} />
          <Route path="optimization" element={<Optimization />} />
          <Route path="maintenance" element={<Maintenance />} /> {/* <-- Check this line carefully */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;