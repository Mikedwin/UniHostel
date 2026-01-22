import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { setupAxiosInterceptors } from './utils/axiosInterceptor';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import HostelList from './pages/HostelList';
import HostelDetail from './pages/HostelDetail';
import StudentLogin from './pages/StudentLogin';
import ManagerLogin from './pages/ManagerLogin';
import StudentRegister from './pages/StudentRegister';
import StudentDashboard from './pages/StudentDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AddHostel from './pages/AddHostel';
import EditHostel from './pages/EditHostel';
import PaymentVerify from './pages/PaymentVerify';
import Terms from './pages/Terms';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Support from './pages/Support';
import Contact from './pages/Contact';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setupAxiosInterceptors(logout, navigate);
  }, [logout, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/hostels" element={<HostelList />} />
        <Route path="/hostels/:id" element={<HostelDetail />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/support" element={<Support />} />
        <Route path="/contact" element={<Contact />} />
        
        {/* Authentication Routes */}
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/manager-login" element={<ManagerLogin />} />
        <Route path="/student-register" element={<StudentRegister />} />
        
        {/* Payment Verification */}
        <Route path="/payment/verify" element={
          <ProtectedRoute role="student">
            <PaymentVerify />
          </ProtectedRoute>
        } />
        
        {/* Protected Routes */}
        <Route path="/student-dashboard" element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/manager-dashboard" element={
          <ProtectedRoute role="manager">
            <ManagerDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/admin-dashboard" element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/add-hostel" element={
          <ProtectedRoute role="manager">
            <AddHostel />
          </ProtectedRoute>
        } />
        
        <Route path="/edit-hostel/:id" element={
          <ProtectedRoute role="manager">
            <EditHostel />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
