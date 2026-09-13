import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, KeyRound } from "lucide-react";
import { API_ENDPOINTS } from "../config/api";
import TurnstileWidget from "../components/security/TurnstileWidget";
import useTurnstileGate from "../utils/useTurnstileGate";
import AccountFlowShell from "../components/AccountFlowShell";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const returnTo = params.get("returnTo") || "/login";
  const [formData, setFormData] = useState({
    email: "",
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const {
    turnstileEnabled,
    turnstileResetKey,
    turnstileToken,
    setTurnstileToken,
    resetTurnstile,
    validateTurnstile,
  } = useTurnstileGate();
  const update = (key, value) =>
    setFormData((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      if (!validateTurnstile(setError)) return;
      if (!formData.currentPassword)
        throw new Error("Current password is required");
      if (formData.password.length < 8)
        throw new Error("Password must be at least 8 characters");
      if (formData.password !== formData.confirmPassword)
        throw new Error("Passwords do not match");
      const res = await axios.post(API_ENDPOINTS.RESET_PASSWORD_CURRENT, {
        email: formData.email.trim().toLowerCase(),
        currentPassword: formData.currentPassword,
        password: formData.password,
        turnstileToken,
      });
      setMessage(res.data.message);
      setSuccess(true);
      setTimeout(() => navigate(returnTo), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to reset password",
      );
    } finally {
      resetTurnstile();
      setLoading(false);
    }
  };
  return (
    <AccountFlowShell
      icon={KeyRound}
      title={success ? "Password updated." : "Reset password."}
      description={
        success
          ? "Your password is secure. Returning you to sign in."
          : "Confirm your current details, then choose a new password."
      }
      asideTitle="Keep access in your hands."
      asideCopy="A few careful steps return you to your account without losing your place."
      notes={[
        "Your account stays protected",
        "Use a password only you know",
        "Return to your next step",
      ]}
      backTo={returnTo}
      backLabel="Back to sign in"
    >
      {success ? (
        <div className="account-flow-complete">
          <strong>Password reset successful</strong>
          <p>{message}</p>
        </div>
      ) : (
        <>
          <>
            {error && (
              <div className="account-flow-alert account-flow-alert--error">
                {error}
              </div>
            )}
          </>
          <form onSubmit={submit} className="account-flow-form">
            <label className="account-flow-field">
              Email address
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => update("email", e.target.value)}
              />
              <small>Use email linked to your account.</small>
            </label>
            <label className="account-flow-field">
              Current password
              <input
                type="password"
                required
                placeholder="Enter current password"
                value={formData.currentPassword}
                onChange={(e) => update("currentPassword", e.target.value)}
              />
            </label>
            <label className="account-flow-field">
              New password
              <input
                type="password"
                required
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={(e) => update("password", e.target.value)}
              />
            </label>
            <label className="account-flow-field">
              Confirm new password
              <input
                type="password"
                required
                placeholder="Type it again"
                value={formData.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
              />
            </label>
            {turnstileEnabled && (
              <TurnstileWidget
                action="forgot_password"
                resetKey={turnstileResetKey}
                onTokenChange={setTurnstileToken}
                onError={setError}
              />
            )}
            <button
              className="account-flow-submit"
              disabled={loading}
              type="submit"
            >
              {loading ? (
                "Updating password..."
              ) : (
                <>
                  Update password <ArrowRight />
                </>
              )}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-[#526960]">
            Remembered it?{" "}
            <Link className="font-bold text-[#c96e32]" to={returnTo}>
              Sign in
            </Link>
          </p>
        </>
      )}
    </AccountFlowShell>
  );
};
export default ForgotPassword;
