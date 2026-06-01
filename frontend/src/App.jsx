import React from 'react';
import AppRouter from './router/AppRouter';
import { EndorsementProvider } from './pages/endorsement/EndorsementContext';
import './App.css';

function App() {
  return (
    <EndorsementProvider>
      <AppRouter />
    </EndorsementProvider>
  );
}

export default App;