// src/routes/AppRouter.jsx

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

// Import all page components
import Overview from '../pages/Overview.jsx';
import Monitoring from '../pages/Monitoring.jsx';
import Optimization from '../pages/Optimization.jsx';
import Maintenance from '../pages/Maintenance.jsx';
import Alarms from '../pages/Alarms.jsx';
import Control from '../pages/Control.jsx';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Overview />} />
          <Route path="monitoring" element={<Monitoring />} />
          <Route path="alarms" element={<Alarms />} />
          <Route path="optimization" element={<Optimization />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="control" element={<Control />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;