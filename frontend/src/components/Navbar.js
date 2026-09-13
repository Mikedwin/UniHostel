import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dashboardPath =
    user?.role === "admin"
      ? "/admin-dashboard"
      : user?.role === "manager"
        ? "/manager-dashboard"
        : "/student-dashboard";
  const isBrowseActive = location.pathname === "/hostels";
  const isDashboardActive = Boolean(
    user && location.pathname === dashboardPath,
  );

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  const desktopLinkClass = (isActive) =>
    `relative px-1 py-2 text-sm font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c96e32] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f8f6f0] ${isActive ? "text-[#25483e]" : "text-[#526960] hover:text-[#25483e]"}`;
  const mobileLinkClass =
    "flex items-center justify-between px-1 py-3 text-base font-semibold text-[#25483e] transition-colors hover:text-[#c96e32] focus:outline-none focus-visible:text-[#c96e32]";

  return (
    <nav className="sticky top-0 z-50 border-b border-[#deddd4] bg-[#f8f6f0]/95 backdrop-blur-md">
      <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-6 sm:px-10 lg:px-16">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c96e32] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f8f6f0]"
          aria-label="UniHostel home"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#173b35] text-[#f6deb1] shadow-md transition-transform duration-200 hover:scale-105">
            <Logo reverse className="h-8 w-8" />
          </span>
          <span className="text-xl font-black tracking-[-0.035em] text-[#173b35] sm:text-2xl">
            UniHostel
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link to="/hostels" className={desktopLinkClass(isBrowseActive)}>
            Browse hostels
            <span
              className={`absolute bottom-0 left-0 h-px bg-[#c96e32] transition-[width] duration-200 ${isBrowseActive ? "w-full" : "w-0"}`}
              aria-hidden="true"
            />
          </Link>
          <Link to="/waitlist" className={desktopLinkClass(location.pathname === "/waitlist")}>
            Early Access Waitlist
            <span
              className={`absolute bottom-0 left-0 h-px bg-[#c96e32] transition-[width] duration-200 ${location.pathname === "/waitlist" ? "w-full" : "w-0"}`}
              aria-hidden="true"
            />
          </Link>
          {!user && (
            <Link to="/contact" className={desktopLinkClass(false)}>
              List your hostel
            </Link>
          )}
          {user && (
            <Link
              to={dashboardPath}
              className={desktopLinkClass(isDashboardActive)}
            >
              Dashboard
              <span
                className={`absolute bottom-0 left-0 h-px bg-[#c96e32] transition-[width] duration-200 ${isDashboardActive ? "w-full" : "w-0"}`}
                aria-hidden="true"
              />
            </Link>
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-1 py-2 text-sm font-semibold text-[#8f3f28] transition-colors duration-200 hover:text-[#b34e2d] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c96e32] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f8f6f0]"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Log out
            </button>
          ) : (
            <>
              <div className="relative">
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={showLoginMenu}
                  onClick={() => setShowLoginMenu((open) => !open)}
                  className="inline-flex items-center gap-1.5 px-1 py-2 text-sm font-semibold text-[#25483e] transition-colors duration-200 hover:text-[#c96e32] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c96e32] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f8f6f0]"
                >
                  Log in{" "}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${showLoginMenu ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>
                {showLoginMenu && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-3 w-56 overflow-hidden rounded-xl border border-[#deddd4] bg-white p-1.5 shadow-[0_16px_34px_rgba(23,59,53,0.14)]"
                  >
                    <Link
                      to="/student-login"
                      role="menuitem"
                      onClick={() => setShowLoginMenu(false)}
                      className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-semibold text-[#25483e] transition-colors duration-200 hover:bg-[#e6eadf] focus:outline-none focus-visible:bg-[#e6eadf]"
                    >
                      <span className="flex items-center gap-2">
                        <User className="h-4 w-4" aria-hidden="true" />
                        Student login
                      </span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <Link
                      to="/manager-login"
                      role="menuitem"
                      onClick={() => setShowLoginMenu(false)}
                      className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-semibold text-[#25483e] transition-colors duration-200 hover:bg-[#e6eadf] focus:outline-none focus-visible:bg-[#e6eadf]"
                    >
                      <span className="flex items-center gap-2">
                        <User className="h-4 w-4" aria-hidden="true" />
                        Manager login
                      </span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                )}
              </div>
              <Link
                to="/student-register"
                className="inline-flex items-center gap-2 bg-[#c96e32] px-4 py-2.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#ad5926] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c96e32] focus-visible:ring-offset-3 focus-visible:ring-offset-[#f8f6f0]"
              >
                Create account{" "}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-[#25483e] transition-colors duration-200 hover:bg-[#e6eadf] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c96e32] focus-visible:ring-offset-3 focus-visible:ring-offset-[#f8f6f0] md:hidden"
        >
          <span className="sr-only">
            {mobileMenuOpen ? "Close navigation" : "Open navigation"}
          </span>
          {mobileMenuOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-[#deddd4] bg-[#f8f6f0] md:hidden"
        >
          <div className="mx-auto max-w-7xl px-6 py-5 sm:px-10">
            <div className="flex flex-col">
              <Link
                to="/hostels"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileLinkClass}
              >
                Browse hostels{" "}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              {user ? (
                <>
                  <Link
                    to={dashboardPath}
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileLinkClass}
                  >
                    <span className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                      Dashboard
                    </span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={`${mobileLinkClass} text-left text-[#8f3f28] hover:text-[#b34e2d]`}
                  >
                    <span className="flex items-center gap-2">
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Log out
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/waitlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl bg-[#173B35] px-4 py-3 text-sm font-bold text-[#F6DEB1] mb-2"
                  >
                    <span>Join Early Access Waitlist</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link
                    to="/contact"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileLinkClass}
                  >
                    List your hostel{" "}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link
                    to="/student-login"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileLinkClass}
                  >
                    Student login{" "}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link
                    to="/manager-login"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileLinkClass}
                  >
                    Manager login{" "}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link
                    to="/student-register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mt-4 inline-flex items-center justify-center gap-2 bg-[#c96e32] px-4 py-3 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#ad5926] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c96e32] focus-visible:ring-offset-3 focus-visible:ring-offset-[#f8f6f0]"
                  >
                    Create student account{" "}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
