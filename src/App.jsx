import React, { Suspense, useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import logo from './assets/logo.jpeg'; // Update this line

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const errorHandler = (error) => {
      console.error('Error caught by error boundary:', error);
      setHasError(true);
      setErrorMessage(error.message || 'An unknown error occurred');
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    return (
      <div>
        <h1>Something went wrong</h1>
        <p>Error: {errorMessage}</p>
        <p>Please check the console for more details.</p>
      </div>
    );
  }

  return children;
};

const App = () => {
  return (
    <ErrorBoundary>
      <div className="app">
        <header className="app-header">
          <div className="logo-container">
            <div className="circular-logo">
              <img src={logo} alt="Cosmic Scope Logo" className="app-logo" />
            </div>
            <h1>Cosmic Scope</h1>
          </div>
        </header>
        <Suspense fallback={<div>Loading Dashboard...</div>}>
          <Dashboard />
        </Suspense>
        <footer className="app-footer">
          <p>&copy; {new Date().getFullYear()} Cosmic Scope by Functional Bits. All rights reserved.</p>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default App;
