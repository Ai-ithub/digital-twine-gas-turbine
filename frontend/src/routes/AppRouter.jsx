// src/routes/AppRouter.jsx

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

// --- CHANGE: Import real page components ---
import Overview from '../pages/Overview.jsx';
import Monitoring from '../pages/Monitoring.jsx';
import Optimization from '../pages/Optimization.jsx';
// We'll create a simple placeholder for Maintenance for now
const Maintenance = () => <div style={{color: 'white'}}>Maintenance Page - Coming Soon</div>;


const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* --- CHANGE: Use the imported components --- */}
          <Route path="/" element={<Overview />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/optimization" element={<Optimization />} />
          <Route path="/maintenance" element={<Maintenance />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;