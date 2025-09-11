import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Components
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import ToastContainer from './components/ToastContainer';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EmployeesPage from './pages/EmployeesPage';
import TasksPage from './pages/TasksPage';
import TaskDetailPage from './pages/TaskDetailPage';
import CreateTaskPage from './pages/CreateTaskPage';
import NotificationsPage from './pages/NotificationsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route path="/" element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="employees" element={<EmployeesPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="tasks/:id" element={<TaskDetailPage />} />
              <Route path="tasks/create" element={
                <AdminRoute>
                  <CreateTaskPage />
                </AdminRoute>
              } />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="analytics" element={
                <AdminRoute>
                  <AnalyticsPage />
                </AdminRoute>
              } />
            </Route>
            
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <ToastContainer />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;