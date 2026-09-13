import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_ENDPOINTS } from "../config/api";
import AccountFlowShell from "../components/AccountFlowShell";

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const dashboardPath =
    user?.role === "admin"
      ? "/admin-dashboard"
      : user?.role === "manager"
        ? "/manager-dashboard"
        : "/student-dashboard";
  const update = (key, value) =>
    setFormData((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (formData.newPassword.length < 8)
      return setError("New password must be at least 8 characters");
    if (formData.newPassword !== formData.confirmPassword)
      return setError("New passwords do not match");
    setLoading(true);
    try {
      await axios.post(API_ENDPOINTS.CHANGE_PASSWORD, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setSuccess("Password changed successfully!");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => navigate(dashboardPath), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };
  return (
    <AccountFlowShell
      icon={LockKeyhole}
      title="Change password."
      description="Confirm your current password, then create a stronger one."
      asideTitle="Your account. Your control."
      asideCopy="Security settings should feel clear, calm, and completely in your hands."
      notes={[
        "Signed-in account action",
        "Minimum 8 characters",
        "Return to your dashboard",
      ]}
      backTo={dashboardPath}
      backLabel="Back to dashboard"
    >
      {error && (
        <div className="account-flow-alert account-flow-alert--error">
          {error}
        </div>
      )}
      {success && (
        <div className="account-flow-alert account-flow-alert--success">
          {success}
        </div>
      )}
      <form className="account-flow-form" onSubmit={submit}>
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
            value={formData.newPassword}
            onChange={(e) => update("newPassword", e.target.value)}
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
        <button
          type="submit"
          className="account-flow-submit"
          disabled={loading}
        >
          {loading ? (
            "Changing password..."
          ) : (
            <>
              Change password <ArrowRight />
            </>
          )}
        </button>
      </form>
    </AccountFlowShell>
  );
};
export default ChangePassword;
