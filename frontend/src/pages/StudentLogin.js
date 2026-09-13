import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowRight, Eye, EyeOff, GraduationCap } from "lucide-react";
import Logo from "../components/Logo";
import { API_ENDPOINTS } from "../config/api";
import TurnstileWidget from "../components/security/TurnstileWidget";
import useTurnstileGate from "../utils/useTurnstileGate";

const StudentLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const pageRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    turnstileEnabled,
    turnstileResetKey,
    turnstileToken,
    setTurnstileToken,
    resetTurnstile,
    validateTurnstile,
  } = useTurnstileGate();
  const redirectTo = location.state?.from?.pathname || "/hostels";

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const targets = pageRef.current?.querySelectorAll("[data-access-motion]");
    if (!targets?.length) return undefined;

    setMotionEnabled(true);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle(
            "access-motion-visible",
            entry.intersectionRatio >= 0.22,
          );
        });
      },
      { threshold: [0, 0.22, 0.5] },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfoMessage("");

    try {
      if (!validateTurnstile(setError)) {
        return;
      }

      const res = await axios.post(API_ENDPOINTS.LOGIN, {
        ...formData,
        turnstileToken,
      });

      if (res.data?.mfaRequired) {
        setError(
          "This login is for students only. Please use the manager login.",
        );
        return;
      }

      if (res.data.user.role !== "student") {
        setError(
          "This login is for students only. Please use the manager login.",
        );
        return;
      }

      login(res.data.user, res.data.csrfToken, res.data.token);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to sign in right now. Please try again later.",
      );
    } finally {
      resetTurnstile();
      setLoading(false);
    }
  };

  return (
    <div
      ref={pageRef}
      className={`access-shell min-h-screen bg-[#f8f6f0] text-[#173b35] lg:grid lg:grid-cols-2 ${motionEnabled ? "access-motion-enabled" : ""}`}
    >
      <aside
        data-access-motion
        className="access-story relative hidden min-h-screen overflow-hidden bg-[#173b35] lg:block"
      >
        <img
          src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1800&q=85"
          alt="Furnished student accommodation"
          className="access-scene absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#173b35]/80" />
        <div className="relative flex h-full max-w-xl flex-col justify-between px-12 py-12 text-white xl:px-20">
          <Link
            to="/"
            className="text-2xl font-black tracking-[-0.04em] focus:outline-none focus:ring-2 focus:ring-[#f6deb1]"
          >
            UniHostel
          </Link>
          <div>
            <div className="access-story-line h-1 w-12 bg-[#c96e32]" />
            <h1 className="access-story-copy mt-7 max-w-[10ch] text-6xl font-black leading-[0.92] tracking-[-0.05em]">
              Your room search waits for you.
            </h1>
            <p className="access-story-copy mt-7 max-w-md text-lg leading-8 text-white/78">
              Return to verified rooms, active applications, and every next step
              in your housing journey.
            </p>
            <ol className="access-story-list mt-10 border-t border-white/25">
              {[
                "Compare verified rooms",
                "Track your application",
                "Pay after approval",
              ].map((item, index) => (
                <li
                  key={item}
                  className="flex items-center gap-4 border-b border-white/20 py-4 text-sm font-semibold"
                >
                  <span className="text-[#f6deb1]">0{index + 1}</span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
          <p className="text-sm text-white/60">
            Student access for housing in Accra.
          </p>
        </div>
      </aside>
      <main className="flex min-h-screen items-center px-6 py-16 sm:px-10 lg:px-16">
        <div
          data-access-motion
          className="access-form-shell mx-auto w-full max-w-md"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-3 text-2xl font-black tracking-[-0.04em] text-[#173b35] lg:hidden"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#173b35] text-[#f6deb1] shadow-md">
              <Logo reverse className="h-8 w-8" />
            </span>
            UniHostel
          </Link>
          <div className="access-form-intro mt-12 lg:mt-0">
            <div className="access-identity-mark flex h-12 w-12 items-center justify-center rounded-2xl bg-[#173b35] text-[#f6deb1]">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h2 className="mt-6 text-4xl font-black leading-[0.96] tracking-[-0.045em]">
              Welcome back.
            </h2>
            <p className="mt-3 max-w-sm leading-7 text-[#526960]">
              Sign in to continue your student housing journey.
            </p>
          </div>

          {error && (
            <div className="mb-4 mt-8 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {infoMessage && (
            <div className="mb-4 mt-8 border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {infoMessage}
            </div>
          )}

          <form className="mt-9 space-y-6" onSubmit={handleSubmit}>
            <div className="access-form-field">
              <label className="mb-2 block text-sm font-bold text-[#173b35]">
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full rounded-xl border border-[#173b35]/25 bg-white px-4 py-3.5 text-[#173b35] outline-none transition focus:border-[#c96e32] focus:ring-4 focus:ring-[#c96e32]/15"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="access-form-field">
              <label className="mb-2 block text-sm font-bold text-[#173b35]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full rounded-xl border border-[#173b35]/25 bg-white px-4 py-3.5 pr-11 text-[#173b35] outline-none transition focus:border-[#c96e32] focus:ring-4 focus:ring-[#c96e32]/15"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#526960] hover:text-[#173b35]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="mt-2 text-right">
                <Link
                  to="/forgot-password?returnTo=/student-login"
                  className="text-xs font-bold text-[#c96e32] hover:text-[#173b35]"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {turnstileEnabled && (
              <TurnstileWidget
                action="login"
                resetKey={turnstileResetKey}
                onTokenChange={setTurnstileToken}
                onError={setError}
              />
            )}

            <button
              type="submit"
              disabled={loading}
              className="access-form-action flex w-full items-center justify-center gap-2 rounded-xl bg-[#c96e32] px-4 py-4 font-bold text-white transition hover:bg-[#ad5926] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="unihostel-button-loader" />
                  Signing In...
                </>
              ) : (
                <>
                  Continue to your dashboard <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-[#173b35]/15 pt-6 text-center">
            <p className="text-sm text-[#526960]">
              Don't have an account?{" "}
              <Link
                to="/student-register"
                className="font-bold text-[#c96e32] hover:text-[#173b35]"
              >
                Register as Student
              </Link>
            </p>
            <p className="mt-3 text-xs text-[#526960]">
              Are you a hostel manager?{" "}
              <Link
                to="/manager-login"
                className="font-bold text-[#173b35] hover:text-[#c96e32]"
              >
                Manager Login
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentLogin;
