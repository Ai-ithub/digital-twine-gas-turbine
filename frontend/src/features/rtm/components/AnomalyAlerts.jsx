import React from 'react';

const AlertsList = ({ alerts }) => {
  return (
    <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', height: '380px', overflowY: 'auto' }}>
      <h3>Anomaly Alerts</h3>
      {alerts.length === 0 ? (
        <p>No alerts to display.</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {/* We get the 'index' from the map function */}
          {alerts.map((alert, index) => (
            // We create a unique key using both id and index
            <li key={`${alert.id}-${index}`} style={{ borderBottom: '1px solid #eee', padding: '10px', backgroundColor: '#fff0f0' }}>
              <strong>⚠️ {alert.timestamp}:</strong> {alert.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AlertsList;