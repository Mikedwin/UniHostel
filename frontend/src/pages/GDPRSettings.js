import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Download,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  ArrowDownToLine,
} from "lucide-react";
import axios from "axios";
import API_URL from "../config";
import { useAuth } from "../context/AuthContext";

const GDPRSettings = () => {
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const handleExportData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_URL}/api/gdpr/export-data`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const dataStr = JSON.stringify(res.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `unihostel-data-${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to export data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.delete(`${API_URL}/api/gdpr/delete-account`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await logout({ notifyServer: false });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete account");
      setShowDeleteConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="data-control-page">
      <section className="data-control-hero">
        <div>
          <p>Account control</p>
          <h1>Your data, in your hands.</h1>
          <span>
            Download a record of your UniHostel data, or manage your account
            with care.
          </span>
        </div>
        <div className="data-control-seal">
          <ShieldCheck />
        </div>
      </section>
      <div className="data-control-layout">
        <aside className="data-control-aside">
          <span>Privacy centre</span>
          <p>These tools are personal to your signed-in account.</p>
          <small>
            Actions that change your account always ask for confirmation.
          </small>
        </aside>
        <main className="data-control-main">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="data-control-card">
            <div className="flex items-start">
              <div className="data-control-card-icon">
                <ArrowDownToLine />
              </div>
              <div className="flex-1">
                <p className="data-control-label">Portable record</p>
                <h2>Export your data</h2>
                <p>
                  Download a copy of all your personal data stored on UniHostel
                  in JSON format.
                </p>
                <button
                  onClick={handleExportData}
                  disabled={loading}
                  className="data-control-button"
                >
                  <Download />{" "}
                  {loading ? "Preparing export…" : "Download my data"}
                </button>
              </div>
            </div>
          </div>

          <div className="data-control-card data-control-card--danger">
            <div className="flex items-start">
              <div className="data-control-card-icon">
                <Trash2 />
              </div>
              <div className="flex-1">
                <p className="data-control-label">Permanent action</p>
                <h2>Delete this account</h2>
                <p>
                  Permanently delete your account and all associated data. This
                  action cannot be undone.
                </p>

                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="data-control-button data-control-button--danger"
                  >
                    Delete Account
                  </button>
                ) : (
                  <div className="data-control-confirm">
                    <div className="flex items-start mb-4">
                      <AlertTriangle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                      <p className="text-sm text-red-800 font-semibold">
                        Are you absolutely sure? This action is permanent and
                        cannot be reversed.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={loading}
                        className="data-control-button data-control-button--danger"
                      >
                        {loading ? "Deleting..." : "Yes, Delete My Account"}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="data-control-button data-control-button--quiet"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GDPRSettings;
