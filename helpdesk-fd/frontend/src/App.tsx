import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { CustomThemeProvider } from './theme/ThemeContext';
import FullScreenLoader from './components/loader/FullScreenLoader';

// Lazy-loaded page components (loaded only on-demand when visiting the route)
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('./features/auth/pages/RegisterPage'));
const SetPasswordPage = lazy(() => import('./features/auth/pages/SetPasswordPage'));
const CustomerDashboard = lazy(() => import('./features/customer/pages/CustomerDashboard'));
const AdminDashboard = lazy(() => import('./features/admin/pages/AdminDashboard'));
const AdminAgents = lazy(() => import('./features/admin/pages/AdminAgents'));
const AdminTickets = lazy(() => import('./features/admin/pages/AdminTickets'));
const AdminTicketDetails = lazy(() => import('./features/admin/pages/AdminTicketDetails'));
const AgentDashboard = lazy(() => import('./features/agent/pages/AgentDashboard'));
const AgentTickets = lazy(() => import('./features/agent/pages/AgentTickets'));
const AgentTicketDetails = lazy(() => import('./features/agent/pages/AgentTicketDetails'));
const AgentCalendarPage = lazy(() => import('./features/agent/pages/AgentCalendarPage'));
const AgentSlotsPage = lazy(() => import('./features/agent/pages/AgentSlotsPage'));
const CustomerProfile = lazy(() => import('./features/customer/pages/CustomerProfile'));
const MyTickets = lazy(() => import('./features/customer/pages/MyTickets'));
const TicketDetails = lazy(() => import('./features/customer/pages/TicketDetails'));
const PublicSchedulePage = lazy(() => import('./features/public/pages/PublicSchedulePage'));


const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  
  if (!token || !userString) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userString);
    if (!allowedRoles.map(r => r.toLowerCase()).includes(user.role.toLowerCase())) {
      return <Navigate to="/login" replace />;
    }
  } catch (e) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <CustomThemeProvider>
      <Router>
        <ToastProvider>
          <Suspense fallback={<FullScreenLoader />}>
            <Routes>
            <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/set-password" element={<SetPasswordPage />} />
          <Route path="/schedule/:token" element={<PublicSchedulePage />} />

          
          {/* Customer Routes */}
          <Route 
            path="/customer/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/customer/tickets" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <MyTickets />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/customer/tickets/:id" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <TicketDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/customer/profile" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerProfile />
              </ProtectedRoute>
            } 
          />
          {/* Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/agents" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminAgents />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/tickets" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminTickets />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/tickets/:id" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminTicketDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/agent/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['agent']}>
                <AgentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/agent/my-tickets" 
            element={
              <ProtectedRoute allowedRoles={['agent']}>
                <AgentTickets />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/agent/tickets/:id" 
            element={
              <ProtectedRoute allowedRoles={['agent']}>
                <AgentTicketDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/agent/calendar" 
            element={
              <ProtectedRoute allowedRoles={['agent']}>
                <AgentCalendarPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/agent/slots" 
            element={
              <ProtectedRoute allowedRoles={['agent']}>
                <AgentSlotsPage />
              </ProtectedRoute>
            } 
          />
          {/* Default route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          </Suspense>
        </ToastProvider>
      </Router>
    </CustomThemeProvider>
  );
}

export default App;
