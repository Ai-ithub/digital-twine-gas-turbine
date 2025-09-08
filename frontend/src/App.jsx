// src/App.jsx

import AppRouter from './routes/AppRouter';
import Notifier from './components/common/Notifier'; // <-- 1. Import

function App() {
  return (
    <>
      <AppRouter />
      <Notifier /> 
    </>
  );
}

export default App;