import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, User, LogOut, LayoutDashboard, ChevronDown, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-primary-600 font-bold text-lg sm:text-xl hover:text-primary-700 transition-colors">
              <Home className="mr-2 w-5 h-5 sm:w-6 sm:h-6" />
              UniHostel
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
            <Link to="/hostels" className="relative text-primary-600 text-base lg:text-lg font-medium hover:text-primary-700 transition-colors group">
              Browse
              <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
            </Link>
            {user ? (
              <>
                <Link 
                  to={
                    user.role === 'admin' ? '/admin-dashboard' :
                    user.role === 'manager' ? '/manager-dashboard' : 
                    '/student-dashboard'
                  } 
                  className="flex items-center text-gray-700 hover:text-primary-600 text-base"
                >
                  <LayoutDashboard className="w-4 h-4 mr-1" />
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center text-red-600 hover:text-red-700 text-base"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <div 
                className="relative"
                onMouseEnter={() => setShowLoginMenu(true)}
                onMouseLeave={() => setShowLoginMenu(false)}
              >
                <button className="flex items-center text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md transition-colors text-base font-medium">
                  Login
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>
                <div className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg transition-all duration-200 z-50 ${
                  showLoginMenu ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}>
                  <Link 
                    to="/student-login" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center rounded-t-md"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Student Login
                  </Link>
                  <Link 
                    to="/manager-login" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center rounded-b-md"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Manager Login
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-primary-600 p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-3 space-y-3">
            <Link 
              to="/hostels" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-primary-600 font-medium py-2 hover:bg-gray-50 px-3 rounded"
            >
              Browse Hostels
            </Link>
            {user ? (
              <>
                <Link 
                  to={
                    user.role === 'admin' ? '/admin-dashboard' :
                    user.role === 'manager' ? '/manager-dashboard' : 
                    '/student-dashboard'
                  }
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center text-gray-700 py-2 hover:bg-gray-50 px-3 rounded"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center text-red-600 py-2 hover:bg-red-50 px-3 rounded w-full text-left"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/student-login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center text-gray-700 py-2 hover:bg-blue-50 px-3 rounded"
                >
                  <User className="w-4 h-4 mr-2" />
                  Student Login
                </Link>
                <Link 
                  to="/manager-login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center text-gray-700 py-2 hover:bg-indigo-50 px-3 rounded"
                >
                  <User className="w-4 h-4 mr-2" />
                  Manager Login
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
