// src/App.jsx

import AppRouter from './routes/AppRouter';
import Notifier from './components/common/Notifier';

function App() {
  return (
    <>
      <AppRouter />
      <Notifier /> 
    </>
  );
}

export default App;