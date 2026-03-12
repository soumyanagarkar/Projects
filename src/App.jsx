import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ProjectWorkspace from './pages/ProjectWorkspace';
import CreateProjectPage from './pages/CreateProjectPage';

const queryClient = new QueryClient();

// --- Authentication State ---
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const authStorage = localStorage.getItem('auth-storage');
  if (token) return true;
  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage);
      return !!parsed?.state?.token;
    } catch {
      return false;
    }
  }
  return false;
};

// --- Private Route Wrapper ---
const PrivateRoute = ({ children }) => {
  return isAuthenticated()
    ? children
    : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Pages */}
          <Route
            path="/dashboard"
            element={<PrivateRoute><DashboardPage /></PrivateRoute>}
          />

          <Route
            path="/project/:projectId"
            element={<PrivateRoute><ProjectWorkspace /></PrivateRoute>}
          />

          <Route
            path="/projects/create"
            element={<PrivateRoute><CreateProjectPage /></PrivateRoute>}
          />

        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

export default App;