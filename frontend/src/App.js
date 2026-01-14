import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import HostelList from './pages/HostelList';
import HostelDetail from './pages/HostelDetail';
import StudentLogin from './pages/StudentLogin';
import ManagerLogin from './pages/ManagerLogin';
import StudentRegister from './pages/StudentRegister';
import ManagerRegister from './pages/ManagerRegister';
import StudentDashboard from './pages/StudentDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AddHostel from './pages/AddHostel';
import EditHostel from './pages/EditHostel';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/hostels" element={<HostelList />} />
            <Route path="/hostels/:id" element={<HostelDetail />} />
            
            {/* Authentication Routes */}
            <Route path="/student-login" element={<StudentLogin />} />
            <Route path="/manager-login" element={<ManagerLogin />} />
            <Route path="/student-register" element={<StudentRegister />} />
            <Route path="/manager-register" element={<ManagerRegister />} />
            
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
      </AuthProvider>
    </Router>
  );
}

export default App;
