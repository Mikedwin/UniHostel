import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowRight, LockKeyhole } from "lucide-react";
import API_URL from "../config";
import AccountFlowShell from "../components/AccountFlowShell";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (password.length < 8)
      return setError("Password must be at least 8 characters");
    if (password !== confirmPassword) return setError("Passwords do not match");
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/auth/reset-password/${token}`,
        { password },
      );
      setMessage(res.data.message);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };
  return (
    <AccountFlowShell
      icon={LockKeyhole}
      title={success ? "New password saved." : "Set new password."}
      description={
        success
          ? "You can now use your new password to sign in."
          : "Choose something strong and easy for only you to remember."
      }
      asideTitle="A fresh start, safely."
      asideCopy="Your reset link is a private bridge back into your UniHostel account."
      notes={[
        "Private reset link",
        "At least 8 characters",
        "Sign in when complete",
      ]}
      backTo="/login"
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
          <form className="account-flow-form" onSubmit={submit}>
            <label className="account-flow-field">
              New password
              <input
                type="password"
                required
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <label className="account-flow-field">
              Confirm password
              <input
                type="password"
                required
                placeholder="Type it again"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </label>
            <button
              className="account-flow-submit"
              disabled={loading}
              type="submit"
            >
              {loading ? (
                "Saving password..."
              ) : (
                <>
                  Save new password <ArrowRight />
                </>
              )}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-[#526960]">
            Need to return?{" "}
            <Link className="font-bold text-[#c96e32]" to="/login">
              Sign in
            </Link>
          </p>
        </>
      )}
    </AccountFlowShell>
  );
};
export default ResetPassword;
