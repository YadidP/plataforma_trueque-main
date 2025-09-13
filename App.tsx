
import React from 'react';
import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import AppRouter from './routes/AppRouter';

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <HashRouter>
          <AppRouter />
        </HashRouter>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
