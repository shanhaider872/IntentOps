
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { AuthCallback } from './components/AuthCallback';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Simple routing based on pathname
const isAuthCallback = window.location.pathname === '/auth/callback';
const rootComponent = isAuthCallback ? <AuthCallback /> : <App />;

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      {rootComponent}
    </AuthProvider>
  </React.StrictMode>
);
