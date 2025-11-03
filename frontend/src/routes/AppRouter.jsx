// src/routes/AppRouter.jsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import IndustrialLayout from '../layouts/IndustrialLayout';
import Login from '../pages/Login.jsx';
import ProtectedRoute from '../components/auth/ProtectedRoute.jsx';

// Industrial Pages
import DisplayPage from '../pages/industrial/DisplayPage';
import GraphAnalysisPage from '../pages/industrial/GraphAnalysisPage';
import ControlPage from '../pages/industrial/ControlPage';
import RealTimeOptimizationPage from '../pages/industrial/RealTimeOptimizationPage';
import PDMPage from '../pages/industrial/PDMPage';
import TestChartsPage from '../pages/industrial/TestChartsPage';

// Lazy load pages for better performance
const Overview = React.lazy(() => import('../pages/Overview.jsx'));
const Monitoring = React.lazy(() => import('../pages/Monitoring.jsx'));
const Optimization = React.lazy(() => import('../pages/Optimization.jsx'));
const Maintenance = React.lazy(() => import('../pages/Maintenance.jsx'));
const Alarms = React.lazy(() => import('../pages/Alarms.jsx'));
const Control = React.lazy(() => import('../pages/Control.jsx'));
const ThreeDAnalysis = React.lazy(() => import('../pages/ThreeDAnalysis.jsx'));
const Checklist = React.lazy(() => import('../pages/Checklist.jsx'));
const GraphAnalysis = React.lazy(() => import('../pages/GraphAnalysis.jsx'));

const AppRouter = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <BrowserRouter>
      <React.Suspense fallback={
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh' 
        }}>
          Loading...
        </div>
      }>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <IndustrialLayout />
              </ProtectedRoute>
            }
          >
            {/* Industrial Dashboard Routes */}
            <Route index element={<DisplayPage />} />
            <Route path="dashboard" element={<DisplayPage />} />
            <Route path="test-charts" element={<TestChartsPage />} />
            <Route path="checklist" element={<Checklist />} />
            <Route path="alarms" element={<Alarms />} />
            <Route path="graph-analysis" element={<GraphAnalysisPage />} />
            <Route path="3d-analysis" element={<ThreeDAnalysis />} />
            <Route path="real-time-op" element={<RealTimeOptimizationPage />} />
            <Route path="pdm" element={<PDMPage />} />
            <Route path="dvr" element={<Monitoring />} />
            <Route path="reporting" element={<Overview />} />
            <Route path="connection" element={<Overview />} />
            <Route path="data-loggers" element={<Monitoring />} />
            <Route path="databases" element={<Overview />} />
            <Route path="csm" element={<Overview />} />
            <Route path="thermo-vision" element={<Overview />} />
            
            {/* Control page requires engineer or admin role */}
            <Route
              path="control"
              element={
                <ProtectedRoute requiredRoles={['admin', 'engineer']}>
                  <ControlPage />
                </ProtectedRoute>
              }
            />
            
            {/* Legacy Routes */}
            <Route path="monitoring" element={<Monitoring />} />
            <Route path="optimization" element={<Optimization />} />
            <Route path="maintenance" element={<Maintenance />} />
          </Route>

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;
