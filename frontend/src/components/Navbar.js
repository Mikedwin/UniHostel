import React, { useEffect, useState } from 'react';
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
  const [isScrolled, setIsScrolled] = useState(false);

  const isLandingPage = location.pathname === '/';
  const useScrolledLandingStyle = isLandingPage && isScrolled;
  const dashboardPath =
    user?.role === 'admin'
      ? '/admin-dashboard'
      : user?.role === 'manager'
        ? '/manager-dashboard'
        : '/student-dashboard';
  const isBrowseActive = location.pathname === '/hostels';
  const isDashboardActive = Boolean(user && location.pathname === dashboardPath);

  useEffect(() => {
    if (!isLandingPage) {
      setIsScrolled(false);
      return undefined;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 72);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLandingPage]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navShellClass = isLandingPage
    ? useScrolledLandingStyle
      ? 'px-0 sm:px-0'
      : 'rounded-[24px] sm:rounded-[28px] bg-white/92 px-3 sm:px-5 shadow-[0_18px_50px_rgba(15,23,42,0.10)] backdrop-blur-2xl'
    : '';

  const lightToneClass = 'text-primary-700 hover:text-primary-800';

  const linkToneClass = isLandingPage
    ? lightToneClass
    : lightToneClass;

  const logoBadgeClass = isLandingPage
    ? 'border-primary-200 bg-primary-50 text-primary-700 shadow-sm'
    : 'border-primary-200 bg-primary-50 text-primary-700';

  const subLabelClass = 'text-primary-600/75';

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isLandingPage
          ? useScrolledLandingStyle
            ? 'bg-white/94 border-b border-slate-200/80 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl'
            : 'bg-transparent border-b-0 shadow-none'
          : 'bg-white/92 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_10px_30px_rgba(15,23,42,0.06)]'
      }`}
    >
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${
          isLandingPage && !useScrolledLandingStyle ? 'pt-3 sm:pt-4' : ''
        }`}
      >
        <div className={`flex justify-between items-center h-18 min-h-[72px] transition-all duration-300 ${navShellClass}`}>
          <div className="flex items-center">
            <Link to="/" className={`group flex items-center gap-2 sm:gap-3 rounded-full px-1 py-1 transition-colors ${linkToneClass}`}>
              <span
                className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border transition-all ${logoBadgeClass}`}
              >
                <Logo className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
              <span className="flex flex-col leading-none min-w-0">
                <span className="text-base sm:text-xl font-black tracking-tight">uniHostel</span>
                <span className={`mt-1 text-[10px] sm:text-[11px] font-medium tracking-[0.16em] sm:tracking-[0.18em] uppercase ${subLabelClass}`}>
                  Student housing
                </span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <Link
              to="/hostels"
              className={`relative rounded-full px-4 py-2.5 text-sm lg:text-[15px] font-semibold transition-all ${
                useScrolledLandingStyle
                  ? isBrowseActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-primary-700 hover:bg-primary-50 hover:text-primary-800'
                  : isLandingPage
                    ? isBrowseActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-primary-700 hover:bg-primary-50 hover:text-primary-800'
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
                    useScrolledLandingStyle
                      ? isDashboardActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-primary-700 hover:bg-primary-50 hover:text-primary-800'
                      : isLandingPage
                        ? isDashboardActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-primary-700 hover:bg-primary-50 hover:text-primary-800'
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
                    useScrolledLandingStyle
                      ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
                      : isLandingPage
                        ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
                        : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <div className="relative" onMouseEnter={() => setShowLoginMenu(true)} onMouseLeave={() => setShowLoginMenu(false)}>
                <button
                  className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm lg:text-[15px] font-semibold transition-all ${
                    useScrolledLandingStyle
                      ? 'border border-primary-100 bg-white text-primary-700 shadow-sm hover:border-primary-200 hover:bg-primary-50/60'
                      : isLandingPage
                        ? 'border border-primary-100 bg-white text-primary-700 shadow-sm hover:border-primary-200 hover:bg-primary-50/60'
                        : 'border border-slate-200 bg-white text-slate-800 shadow-sm hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Login
                  <ChevronDown className={`w-4 h-4 transition-transform ${showLoginMenu ? 'rotate-180' : ''}`} />
                </button>
                <div
                  className={`absolute right-0 mt-3 w-56 rounded-3xl border p-2 shadow-2xl transition-all duration-200 z-50 ${
                    useScrolledLandingStyle
                      ? 'border-primary-100 bg-white shadow-primary-100/60'
                      : isLandingPage
                        ? 'border-primary-100 bg-white shadow-primary-100/60'
                        : 'border-slate-200 bg-white shadow-slate-200/80'
                  } ${showLoginMenu ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                >
                  <Link
                    to="/student-login"
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                      useScrolledLandingStyle
                        ? 'text-primary-700 hover:bg-primary-50 hover:text-primary-800'
                      : isLandingPage
                          ? 'text-primary-700 hover:bg-primary-50 hover:text-primary-800'
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
                      useScrolledLandingStyle
                        ? 'text-primary-700 hover:bg-primary-50 hover:text-primary-800'
                      : isLandingPage
                          ? 'text-primary-700 hover:bg-primary-50 hover:text-primary-800'
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

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`rounded-full p-2.5 transition-colors ${
                useScrolledLandingStyle
                  ? 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                : isLandingPage
                    ? 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className={`md:hidden border-t ${
            useScrolledLandingStyle
              ? 'bg-white/95 border-primary-100 backdrop-blur-xl'
              : isLandingPage
                ? 'mx-4 mt-2 rounded-[24px] border border-primary-100 bg-white/95 shadow-[0_16px_40px_rgba(15,23,42,0.10)] backdrop-blur-xl'
                : 'bg-white/95 border-slate-200 backdrop-blur-xl'
          }`}
        >
          <div className="px-4 py-4 space-y-2">
            <Link
              to="/hostels"
              onClick={() => setMobileMenuOpen(false)}
              className={`block rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                useScrolledLandingStyle
                  ? 'text-primary-700 hover:bg-primary-50'
                : isLandingPage
                    ? 'text-primary-700 hover:bg-primary-50'
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
                    useScrolledLandingStyle
                      ? 'text-primary-700 hover:bg-primary-50'
                    : isLandingPage
                        ? 'text-primary-700 hover:bg-primary-50'
                        : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className={`flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-colors ${
                    useScrolledLandingStyle
                      ? 'text-red-600 hover:bg-red-50'
                    : isLandingPage
                        ? 'text-red-600 hover:bg-red-50'
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
                    useScrolledLandingStyle
                      ? 'text-primary-700 hover:bg-primary-50'
                    : isLandingPage
                        ? 'text-primary-700 hover:bg-primary-50'
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
                    useScrolledLandingStyle
                      ? 'text-primary-700 hover:bg-primary-50'
                    : isLandingPage
                        ? 'text-primary-700 hover:bg-primary-50'
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
