import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showRegisterMenu, setShowRegisterMenu] = useState(false);
  const [showLoginMenu, setShowLoginMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-primary-600 font-bold text-xl hover:text-primary-700 transition-colors">
              <Home className="mr-2" />
              UniHostel
            </Link>
          </div>
          
          <div className="flex items-center space-x-4 md:space-x-8">
            <Link to="/hostels" className="relative text-primary-600 text-base md:text-lg font-medium hover:text-primary-700 transition-colors group">
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
                  className="flex items-center text-gray-700 hover:text-primary-600 text-sm md:text-base"
                >
                  <LayoutDashboard className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center text-red-600 hover:text-red-700 text-sm md:text-base"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                {/* Login Dropdown */}
                <div 
                  className="relative"
                  onMouseEnter={() => setShowLoginMenu(true)}
                  onMouseLeave={() => setShowLoginMenu(false)}
                >
                  <button className="flex items-center text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md transition-colors text-sm md:text-base font-medium">
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

                {/* Register Dropdown */}
                <div 
                  className="relative"
                  onMouseEnter={() => setShowRegisterMenu(true)}
                  onMouseLeave={() => setShowRegisterMenu(false)}
                >
                  <button className="bg-primary-600 text-white px-3 md:px-4 py-2 rounded-md hover:bg-primary-700 transition-colors text-sm md:text-base font-medium flex items-center">
                    Register
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>
                  <div className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg transition-all duration-200 z-50 ${
                    showRegisterMenu ? 'opacity-100 visible' : 'opacity-0 invisible'
                  }`}>
                    <Link 
                      to="/student-register" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center rounded-t-md"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Student Register
                    </Link>
                    <Link 
                      to="/manager-register" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center rounded-b-md"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Manager Register
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
