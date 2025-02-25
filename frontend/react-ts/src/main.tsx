
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Status from './pages/Status';
import Analytics from './pages/Analytics';
import Sensor from './pages/Sensor';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Router>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Home />} />
        <Route path="status" element={<Status />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="sensor" element={<Sensor />} />
      </Route>
    </Routes>
  </Router>
);