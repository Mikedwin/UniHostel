import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  CheckCircle,
} from "lucide-react";
import { API_ENDPOINTS } from "../config/api";
import TurnstileWidget from "../components/security/TurnstileWidget";
import useTurnstileGate from "../utils/useTurnstileGate";
import GoogleAuthButton from "../components/auth/GoogleAuthButton";

const StudentRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });
  const [tosAccepted, setTosAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const pageRef = useRef(null);
  const {
    turnstileEnabled,
    turnstileResetKey,
    turnstileToken,
    setTurnstileToken,
    resetTurnstile,
    validateTurnstile,
  } = useTurnstileGate();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "student",
    });
    setTosAccepted(false);
    setPrivacyAccepted(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      if (!tosAccepted || !privacyAccepted) {
        setError("You must accept the Terms of Service and Privacy Policy");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters long");
        return;
      }

      if (!validateTurnstile(setError)) {
        return;
      }

      const { confirmPassword, ...submitData } = formData;
      const res = await axios.post(API_ENDPOINTS.REGISTER, {
        ...submitData,
        tosAccepted,
        privacyPolicyAccepted: privacyAccepted,
        turnstileToken,
      });
      setSuccessMessage(
        res.data?.message || "Registration successful. You can now sign in.",
      );
      resetForm();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Registration failed",
      );
    } finally {
      resetTurnstile();
      setLoading(false);
    }
  };

  return (
    <div
      ref={pageRef}
      className={`access-shell min-h-screen bg-[#f8f6f0] px-4 py-16 sm:px-6 lg:px-8 ${motionEnabled ? "access-motion-enabled" : ""}`}
    >
      <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)] lg:items-start lg:gap-24">
        <div
          data-access-motion
          className="access-story text-center lg:pt-24 lg:text-left"
        >
          <div className="access-identity-mark mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#173b35] text-[#f6deb1] lg:ml-0">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h2 className="access-story-copy text-4xl font-black tracking-[-0.045em] text-[#173b35]">
            Start with clarity.
          </h2>
          <p className="access-story-copy mt-3 text-sm leading-6 text-[#526960]">
            Create your account to find accommodation
          </p>
          <div className="access-story-list mx-auto mt-10 hidden max-w-sm border-t border-[#173b35]/20 lg:block lg:mx-0">
            {[
              "Browse verified rooms",
              "Apply with confidence",
              "Pay only after approval",
            ].map((item, index) => (
              <div
                key={item}
                className="flex gap-4 border-b border-[#173b35]/15 py-4 text-sm font-bold text-[#173b35]"
              >
                <span className="text-[#c96e32]">0{index + 1}</span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div
          data-access-motion
          className="access-form-panel rounded-[2rem] border border-[#173b35]/15 bg-white p-6 shadow-[0_24px_70px_rgba(23,59,53,0.10)] sm:p-8"
        >
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-green-800">
                    Account created
                  </h3>
                  <p className="mt-1 text-sm text-green-700">
                    {successMessage}
                  </p>
                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <Link
                      to="/student-login"
                      className="inline-flex items-center justify-center rounded-xl px-4 py-2 font-medium text-white"
                      style={{ backgroundColor: "#23817A" }}
                    >
                      Go to Student Login
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!successMessage && (
            <>
              <div className="mb-6">
                <GoogleAuthButton
                  role="student"
                  redirectTo="/hostels"
                  text="signup_with"
                  onError={setError}
                />
              </div>

              <div className="relative my-6 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <span className="relative bg-white px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Or register with email
                </span>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="access-form-field">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    className="w-full rounded-xl border border-[#173b35]/25 py-3 pl-10 pr-3 outline-none transition-colors focus:border-[#c96e32] focus:ring-4 focus:ring-[#c96e32]/15"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    onFocus={(e) => (e.target.style.borderColor = "#23817A")}
                    onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                  />
                </div>
              </div>

              <div className="access-form-field">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    className="w-full rounded-xl border border-[#173b35]/25 py-3 pl-10 pr-3 outline-none transition-colors focus:border-[#c96e32] focus:ring-4 focus:ring-[#c96e32]/15"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    onFocus={(e) => (e.target.style.borderColor = "#23817A")}
                    onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                  />
                </div>
              </div>

              <div className="access-form-field">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full rounded-xl border border-[#173b35]/25 py-3 pl-10 pr-10 outline-none transition-colors focus:border-[#c96e32] focus:ring-4 focus:ring-[#c96e32]/15"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    onFocus={(e) => (e.target.style.borderColor = "#23817A")}
                    onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="access-form-field">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    className="w-full rounded-xl border border-[#173b35]/25 py-3 pl-10 pr-10 outline-none transition-colors focus:border-[#c96e32] focus:ring-4 focus:ring-[#c96e32]/15"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    onFocus={(e) => (e.target.style.borderColor = "#23817A")}
                    onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="access-form-terms space-y-3 pt-2">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={tosAccepted}
                    onChange={(e) => setTosAccepted(e.target.checked)}
                    className="mt-1 mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    I accept the{" "}
                    <Link
                      to="/terms"
                      target="_blank"
                      className="font-semibold hover:underline"
                      style={{ color: "#23817A" }}
                    >
                      Terms of Service
                    </Link>
                  </span>
                </label>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={privacyAccepted}
                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                    className="mt-1 mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    I accept the{" "}
                    <Link
                      to="/privacy"
                      target="_blank"
                      className="font-semibold hover:underline"
                      style={{ color: "#23817A" }}
                    >
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </div>

              {turnstileEnabled && (
                <TurnstileWidget
                  action="register"
                  resetKey={turnstileResetKey}
                  onTokenChange={setTurnstileToken}
                  onError={setError}
                />
              )}

              <button
                type="submit"
                disabled={loading}
                className="access-form-action flex w-full items-center justify-center rounded-xl bg-[#c96e32] px-4 py-3.5 font-bold text-white transition-colors hover:bg-[#ad5926] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="unihostel-button-loader" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
            </>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/student-login"
                className="font-medium"
                style={{ color: "#23817A" }}
              >
                Sign In
              </Link>
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Need a manager account?{" "}
              <Link to="/contact" style={{ color: "#23817A" }}>
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRegister;
