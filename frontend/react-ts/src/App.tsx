import { Link, Outlet } from 'react-router-dom';

const App = () => {
  return (
    <div>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/status">Status</Link></li>
          <li><Link to="/analytics">Analytics</Link></li>
          <li><Link to="/sensor">Sensor</Link></li>
        </ul>
      </nav>
      <Outlet />
    </div>
  );
};

export default App;