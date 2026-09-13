import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { API_ENDPOINTS } from "../config/api";
import TurnstileWidget from "../components/security/TurnstileWidget";
import PrivilegedMfaChallenge from "../components/security/PrivilegedMfaChallenge";
import useTurnstileGate from "../utils/useTurnstileGate";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mfaChallenge, setMfaChallenge] = useState(null);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaResendLoading, setMfaResendLoading] = useState(false);
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

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return undefined;
    const targets = pageRef.current?.querySelectorAll("[data-access-motion]");
    if (!targets?.length) return undefined;
    setMotionEnabled(true);
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) =>
          entry.target.classList.toggle(
            "access-motion-visible",
            entry.intersectionRatio >= 0.22,
          ),
        ),
      { threshold: [0, 0.22, 0.5] },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  const resetMfaState = () => {
    setMfaChallenge(null);
    setMfaCode("");
    setMfaLoading(false);
    setMfaResendLoading(false);
  };

  const navigateByRole = (role) => {
    const requestedPath = location.state?.from?.pathname;
    if (requestedPath) return navigate(requestedPath, { replace: true });
    if (role === "admin")
      return navigate("/admin-dashboard", { replace: true });
    if (role === "manager")
      return navigate("/manager-dashboard", { replace: true });
    return navigate("/hostels", { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setInfoMessage("");
    try {
      if (!validateTurnstile(setError)) return;
      const res = await axios.post(API_ENDPOINTS.LOGIN, {
        ...formData,
        turnstileToken,
      });
      if (res.data?.mfaRequired) {
        setMfaChallenge({
          challengeToken: res.data.challengeToken,
          maskedEmail: res.data.maskedEmail,
          pendingRole: res.data.pendingRole,
        });
        setMfaCode("");
        setInfoMessage(
          res.data.message || "A security code has been sent to your email.",
        );
        return;
      }
      login(res.data.user, res.data.csrfToken, res.data.token);
      navigateByRole(res.data.user.role);
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

  const handleVerifyMfa = async (event) => {
    event.preventDefault();
    if (!mfaChallenge?.challengeToken) {
      setError("Security verification expired. Please sign in again.");
      resetMfaState();
      return;
    }
    setMfaLoading(true);
    setError("");
    try {
      const res = await axios.post(API_ENDPOINTS.VERIFY_MFA, {
        challengeToken: mfaChallenge.challengeToken,
        code: mfaCode,
      });
      login(res.data.user, res.data.csrfToken, res.data.token);
      resetMfaState();
      setInfoMessage("");
      navigateByRole(res.data.user?.role || mfaChallenge.pendingRole);
    } catch (err) {
      if (err.response?.data?.resetLogin) resetMfaState();
      setError(
        err.response?.data?.message ||
          "Unable to verify security code right now. Please try again later.",
      );
    } finally {
      setMfaLoading(false);
    }
  };

  const handleResendMfa = async () => {
    if (!mfaChallenge?.challengeToken) {
      setError("Security verification expired. Please sign in again.");
      resetMfaState();
      return;
    }
    setMfaResendLoading(true);
    setError("");
    try {
      const res = await axios.post(API_ENDPOINTS.RESEND_MFA, {
        challengeToken: mfaChallenge.challengeToken,
      });
      setInfoMessage(
        res.data?.message || "A new security code has been sent to your email.",
      );
      if (res.data?.maskedEmail)
        setMfaChallenge((current) =>
          current ? { ...current, maskedEmail: res.data.maskedEmail } : current,
        );
    } catch (err) {
      if (err.response?.data?.resetLogin) resetMfaState();
      setError(
        err.response?.data?.message ||
          "Unable to resend security code right now. Please try again later.",
      );
    } finally {
      setMfaResendLoading(false);
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
              Your next step is still here.
            </h1>
            <p className="access-story-copy mt-7 max-w-md text-lg leading-8 text-white/78">
              Sign in to return to room searches, applications, approvals, and
              all the details that matter.
            </p>
            <div className="access-story-list mt-8 grid max-w-md gap-3">
              {[
                "Verified hostel listings",
                "Approval before payment",
                "Clear next steps",
              ].map((item) => (
                <div
                  key={item}
                  className="border-t border-white/25 py-3 text-sm font-semibold text-white"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-white/65">
            Built for students. Ready for managers.
          </p>
        </div>
      </aside>

      <main className="flex min-h-screen items-center px-5 py-10 sm:px-8 lg:px-12">
        <div
          data-access-motion
          className="access-form-shell mx-auto w-full max-w-md"
        >
          <Link
            to="/"
            className="mb-10 inline-flex items-center gap-2 text-lg font-black tracking-[-0.04em] text-[#173b35] lg:hidden"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#173b35] text-[#f6deb1] shadow-md">
              <Logo reverse className="h-8 w-8" />
            </span>
            UniHostel
          </Link>
          <div className="access-form-intro">
            <div className="access-identity-mark mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#173b35] text-[#f6deb1]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-4xl font-black tracking-[-0.05em] text-[#173b35] sm:text-5xl">
              Welcome back.
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-[#526960]">
              Use your UniHostel account to continue where you left off.
            </p>
          </div>

          {error && (
            <div
              className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}
          {infoMessage && (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {infoMessage}
            </div>
          )}

          {mfaChallenge ? (
            <div className="mt-8">
              <PrivilegedMfaChallenge
                code={mfaCode}
                loading={mfaLoading}
                maskedEmail={mfaChallenge.maskedEmail}
                onBack={() => {
                  resetMfaState();
                  setInfoMessage("");
                }}
                onCodeChange={setMfaCode}
                onResend={handleResendMfa}
                onSubmit={handleVerifyMfa}
                resendLoading={mfaResendLoading}
              />
            </div>
          ) : (
            <>
              <form className="mt-9 space-y-6" onSubmit={handleSubmit}>
                <div className="access-form-field">
                  <label className="mb-2 block text-sm font-bold text-[#173b35]">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full rounded-xl border border-[#173b35]/25 bg-white px-4 py-3.5 text-[#173b35] outline-none transition focus:border-[#c96e32] focus:ring-4 focus:ring-[#c96e32]/15"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(event) =>
                      setFormData({ ...formData, email: event.target.value })
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
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          password: event.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#526960] hover:text-[#173b35]"
                      onClick={() => setShowPassword((current) => !current)}
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
                      to="/forgot-password?returnTo=/login"
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
                      <span className="unihostel-button-loader" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Continue <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
              <div className="mt-8 border-t border-[#173b35]/15 pt-6 text-center">
                <p className="text-sm text-[#526960]">
                  New here?{" "}
                  <Link
                    to="/student-register"
                    className="font-bold text-[#c96e32] hover:text-[#173b35]"
                  >
                    Create student account
                  </Link>
                </p>
                <p className="mt-3 text-xs text-[#526960]">
                  Manage a hostel?{" "}
                  <Link
                    to="/manager-login"
                    className="font-bold text-[#173b35] hover:text-[#c96e32]"
                  >
                    Manager login
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Login;
