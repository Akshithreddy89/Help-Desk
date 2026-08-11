import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import SetPasswordPage from './features/auth/pages/SetPasswordPage';
import CustomerDashboard from './features/customer/pages/CustomerDashboard';
import AdminDashboard from './features/admin/pages/AdminDashboard';
import AdminAgents from './features/admin/pages/AdminAgents';
import AgentDashboard from './features/agent/pages/AgentDashboard';
import CustomerProfile from './features/customer/pages/CustomerProfile';

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
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/set-password" element={<SetPasswordPage />} />
        
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
        <Route path="/agent/dashboard" element={<AgentDashboard />} />
        {/* Default route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
