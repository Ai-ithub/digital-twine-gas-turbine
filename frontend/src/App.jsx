import React from 'react';
import RTMDashboard from './components/RTMDashboard';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Compressor Monitoring Dashboard</h1>
      </header>
      <main>
        <RTMDashboard />
      </main>
    </div>
  );
}

export default App;