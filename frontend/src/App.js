import React, { Suspense, lazy, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { setupAxiosInterceptors } from './utils/axiosInterceptor';
import { trackPageView } from './utils/visitorTracking';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

const Landing = lazy(() => import('./pages/Landing'));
const HostelList = lazy(() => import('./pages/HostelList'));
const HostelDetail = lazy(() => import('./pages/HostelDetail'));
const Login = lazy(() => import('./pages/Login'));
const StudentLogin = lazy(() => import('./pages/StudentLogin'));
const ManagerLogin = lazy(() => import('./pages/ManagerLogin'));
const StudentRegister = lazy(() => import('./pages/StudentRegister'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const SetupSecurityQuestion = lazy(() => import('./pages/SetupSecurityQuestion'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const ManagerDashboard = lazy(() => import('./pages/ManagerDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AddHostel = lazy(() => import('./pages/AddHostel'));
const EditHostelSimple = lazy(() => import('./pages/EditHostelSimple'));
const PaymentVerify = lazy(() => import('./pages/PaymentVerify'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const Terms = lazy(() => import('./pages/Terms'));
const About = lazy(() => import('./pages/About'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Support = lazy(() => import('./pages/Support'));
const Contact = lazy(() => import('./pages/Contact'));
const GDPRSettings = lazy(() => import('./pages/GDPRSettings'));
const MoMoSettings = lazy(() => import('./pages/MoMoSettings'));

function AppContent() {
  const { logout, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const lastTrackedRouteRef = useRef('');

  useEffect(() => {
    setupAxiosInterceptors(logout, navigate);
  }, [logout, navigate]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const routeKey = `${location.pathname}${location.search}${location.hash}`;

    if (lastTrackedRouteRef.current === routeKey) {
      return;
    }

    lastTrackedRouteRef.current = routeKey;

    trackPageView({
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      token
    });
  }, [location.pathname, location.search, location.hash, token]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Suspense fallback={<LoadingSpinner message="Loading page..." fullScreen />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/hostels" element={<HostelList />} />
          <Route path="/hostels/:id" element={<HostelDetail />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/support" element={<Support />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/gdpr-settings" element={
            <ProtectedRoute>
              <GDPRSettings />
            </ProtectedRoute>
          } />
          
          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/student-login" element={<StudentLogin />} />
          <Route path="/manager-login" element={<ManagerLogin />} />
          <Route path="/student-register" element={<StudentRegister />} />
          <Route path="/manager-register" element={<Navigate to="/contact" replace />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/reset-password-inapp" element={<Navigate to="/forgot-password" replace />} />
          <Route path="/change-password" element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          } />
          <Route path="/setup-security-question" element={
            <ProtectedRoute>
              <SetupSecurityQuestion />
            </ProtectedRoute>
          } />
          
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
              <EditHostelSimple />
            </ProtectedRoute>
          } />
          
          <Route path="/momo-settings" element={
            <ProtectedRoute role="manager">
              <MoMoSettings />
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
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
