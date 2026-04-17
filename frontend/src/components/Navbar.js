import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut, LayoutDashboard, ChevronDown, Menu, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLandingPage = location.pathname === '/';
  const dashboardPath =
    user?.role === 'admin'
      ? '/admin-dashboard'
      : user?.role === 'manager'
        ? '/manager-dashboard'
        : '/student-dashboard';
  const isBrowseActive = location.pathname === '/hostels';
  const isDashboardActive = Boolean(user && location.pathname === dashboardPath);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isLandingPage
          ? 'bg-transparent border-b-0 shadow-none'
          : 'bg-white/92 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_10px_30px_rgba(15,23,42,0.06)]'
      }`}
    >
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isLandingPage ? 'pt-3 sm:pt-4' : ''}`}>
        <div
          className={`flex justify-between items-center h-18 min-h-[72px] ${
            isLandingPage
              ? 'rounded-[24px] sm:rounded-[28px] border border-white/12 bg-[#071917]/82 px-3 sm:px-5 shadow-[0_18px_50px_rgba(3,12,12,0.34)] backdrop-blur-2xl'
              : ''
          }`}
        >
          <div className="flex items-center">
            <Link
              to="/"
              className={`group flex items-center gap-2 sm:gap-3 rounded-full px-1 py-1 transition-colors ${
                isLandingPage ? 'text-white hover:text-emerald-100' : 'text-slate-900 hover:text-primary-700'
              }`}
            >
              <span
                className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border transition-all ${
                  isLandingPage
                    ? 'border-white/20 bg-white/12 text-white shadow-lg shadow-black/15 backdrop-blur-md'
                    : 'border-primary-100 bg-primary-50 text-primary-700'
                }`}
              >
                <Logo className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
              <span className="flex flex-col leading-none min-w-0">
                <span className="text-base sm:text-xl font-black tracking-tight">uniHostel</span>
                <span
                  className={`mt-1 text-[10px] sm:text-[11px] font-medium tracking-[0.16em] sm:tracking-[0.18em] uppercase ${
                    isLandingPage ? 'text-teal-100/75' : 'text-slate-500'
                  }`}
                >
                  Student housing
                </span>
              </span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <Link
              to="/hostels"
              className={`relative rounded-full px-4 py-2.5 text-sm lg:text-[15px] font-semibold transition-all ${
                isLandingPage
                  ? isBrowseActive
                    ? 'bg-white/16 text-white shadow-lg shadow-black/10'
                    : 'text-teal-50/90 hover:bg-white/10 hover:text-white'
                  : isBrowseActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              Browse
            </Link>
            {user ? (
              <>
                <Link 
                  to={dashboardPath}
                  className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm lg:text-[15px] font-semibold transition-all ${
                    isLandingPage
                      ? isDashboardActive
                        ? 'bg-white/16 text-white shadow-lg shadow-black/10'
                        : 'text-teal-50/90 hover:bg-white/10 hover:text-white'
                      : isDashboardActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm lg:text-[15px] font-semibold transition-all ${
                    isLandingPage
                      ? 'text-rose-100 hover:bg-rose-400/10 hover:text-white'
                      : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <div 
                className="relative"
                onMouseEnter={() => setShowLoginMenu(true)}
                onMouseLeave={() => setShowLoginMenu(false)}
              >
                <button
                  className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm lg:text-[15px] font-semibold transition-all ${
                    isLandingPage
                      ? 'border border-white/20 bg-white text-slate-950 shadow-xl shadow-black/20 hover:-translate-y-0.5 hover:bg-slate-100'
                      : 'border border-slate-200 bg-white text-slate-800 shadow-sm hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Login
                  <ChevronDown className={`w-4 h-4 transition-transform ${showLoginMenu ? 'rotate-180' : ''}`} />
                </button>
                <div className={`absolute right-0 mt-3 w-56 rounded-3xl border p-2 shadow-2xl transition-all duration-200 z-50 ${
                  isLandingPage
                    ? 'border-white/15 bg-[#0c2c28]/92 backdrop-blur-xl shadow-black/25'
                    : 'border-slate-200 bg-white shadow-slate-200/80'
                } ${
                  showLoginMenu ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}>
                  <Link 
                    to="/student-login" 
                  className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                      isLandingPage
                        ? 'text-white hover:bg-white/10'
                        : 'text-slate-700 hover:bg-primary-50 hover:text-primary-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Student Login
                    </span>
                    <ArrowRight className="w-4 h-4 opacity-70" />
                  </Link>
                  <Link 
                    to="/manager-login" 
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                      isLandingPage
                        ? 'text-white hover:bg-white/10'
                        : 'text-slate-700 hover:bg-primary-50 hover:text-primary-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Manager Login
                    </span>
                    <ArrowRight className="w-4 h-4 opacity-70" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`rounded-full p-2.5 transition-colors ${
                isLandingPage
                  ? 'bg-white/10 text-white backdrop-blur-md hover:bg-white/15'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden border-t ${
            isLandingPage
              ? 'mx-4 mt-2 rounded-[24px] border border-white/10 bg-[#082523]/95 shadow-[0_16px_40px_rgba(3,12,12,0.32)] backdrop-blur-xl'
              : 'bg-white/95 border-slate-200 backdrop-blur-xl'
          }`}
        >
          <div className="px-4 py-4 space-y-2">
            <Link 
              to="/hostels" 
              onClick={() => setMobileMenuOpen(false)}
              className={`block rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                isLandingPage
                  ? 'text-white hover:bg-white/10'
                  : 'text-primary-700 hover:bg-primary-50'
              }`}
            >
              Browse Hostels
            </Link>
            {user ? (
              <>
                <Link 
                  to={dashboardPath}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                    isLandingPage
                      ? 'text-white hover:bg-white/10'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className={`flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-colors ${
                    isLandingPage
                      ? 'text-rose-100 hover:bg-rose-400/10'
                      : 'text-red-600 hover:bg-red-50'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/student-login"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                    isLandingPage
                      ? 'text-white hover:bg-white/10'
                      : 'text-slate-700 hover:bg-primary-50'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Student Login
                </Link>
                <Link 
                  to="/manager-login"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                    isLandingPage
                      ? 'text-white hover:bg-white/10'
                      : 'text-slate-700 hover:bg-primary-50'
                  }`}
                >
                  <User className="w-4 h-4" />
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
