import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CreditCard, Archive, KeyRound } from "lucide-react";
import { API_ENDPOINTS, PAYSTACK_PUBLIC_KEY } from "../config/api";
import Swal from "sweetalert2";
import LoadingSpinner from "../components/LoadingSpinner";
import { loadExternalScript } from "../utils/loadExternalScript";
import { FilterTabGroup } from '../components/DashboardFilters';

const isConfiguredPaystackKey = (key) =>
  /^pk_(test|live)_[\w-]+$/.test((key || "").trim());
const PAYSTACK_SCRIPT_ID = "paystack-inline-script";
const PAYSTACK_SCRIPT_SRC = "https://js.paystack.co/v1/inline.js";

const ensurePaystack = async () => {
  if (typeof window !== "undefined" && window.PaystackPop?.setup) {
    return window.PaystackPop;
  }

  await loadExternalScript({
    id: PAYSTACK_SCRIPT_ID,
    src: PAYSTACK_SCRIPT_SRC,
  });

  if (typeof window !== "undefined" && window.PaystackPop?.setup) {
    return window.PaystackPop;
  }

  throw new Error("Paystack failed to initialize");
};

const StudentDashboard = () => {
  const [applications, setApplications] = useState([]);
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("active");
  const [toast, setToast] = useState(null);
  const [selectedApps, setSelectedApps] = useState([]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchApps = async () => {
    try {
      const archived = viewMode === "history" ? "true" : "false";
      const res = await axios.get(
        API_ENDPOINTS.STUDENT_APPLICATIONS + `?archived=${archived}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      // Ensure data is always an array
      const apps = Array.isArray(res.data) ? res.data : [];

      const relevantApplicationIds = apps
        .filter(
          (app) =>
            app.status === "approved_for_payment" &&
            app.paymentStatus !== "paid",
        )
        .map((app) => app._id);

      let paymentStatuses = [];
      if (relevantApplicationIds.length > 0) {
        try {
          const statusRes = await axios.post(
            API_ENDPOINTS.PAYMENT_STATUS_BATCH,
            { applicationIds: relevantApplicationIds },
            { headers: { Authorization: `Bearer ${token}` } },
          );
          paymentStatuses = Array.isArray(statusRes.data?.statuses)
            ? statusRes.data.statuses
            : [];
        } catch (err) {
          console.log("Batch payment status check failed");
        }
      }

      const paymentStatusMap = new Map(
        paymentStatuses.map((status) => [status.applicationId, status]),
      );

      const updatedApps = apps.map((app) =>
        paymentStatusMap.has(app._id)
          ? { ...app, ...paymentStatusMap.get(app._id) }
          : app,
      );

      setApplications(updatedApps);
    } catch (err) {
      console.error(err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, viewMode]);

  const handleProceedToPayment = async (app) => {
    try {
      if (!isConfiguredPaystackKey(PAYSTACK_PUBLIC_KEY)) {
        Swal.fire(
          "Payment unavailable",
          "Paystack is not configured for this frontend deployment. Set VITE_PAYSTACK_PUBLIC_KEY in Vercel and redeploy.",
          "error",
        );
        return;
      }

      // First check if payment status has changed
      const statusCheck = await axios.get(
        API_ENDPOINTS.PAYMENT_STATUS(app._id),
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!statusCheck.data.canPay) {
        Swal.fire(
          "Payment Already Processed",
          "This application has already been paid for.",
          "info",
        );
        fetchApps(); // Refresh to show updated status
        return;
      }

      const response = await axios.post(
        API_ENDPOINTS.PAYMENT_INITIALIZE,
        { applicationId: app._id, email: user.email, amount: app.totalAmount },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const paystack = await ensurePaystack();

      const handler = paystack.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: app.totalAmount * 100,
        currency: "GHS",
        ref: response.data.reference,
        channels: ["card", "mobile_money"],
        onClose: () =>
          Swal.fire(
            "Payment Cancelled",
            "You closed the payment window",
            "info",
          ),
        callback: (res) => {
          axios
            .get(API_ENDPOINTS.PAYMENT_VERIFY(res.reference), {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then(() => {
              Swal.fire(
                "Payment Successful!",
                "Awaiting final manager approval.",
                "success",
              );
              fetchApps();
            });
        },
      });
      handler.openIframe();
    } catch (err) {
      if (err.response?.data?.message === "Application already paid") {
        Swal.fire(
          "Payment Already Processed",
          "This application has already been paid for.",
          "info",
        );
        fetchApps(); // Refresh to show updated status
      } else {
        Swal.fire(
          "Payment Error",
          err.response?.data?.message || "Failed",
          "error",
        );
      }
    }
  };

  const handleMoveToHistory = async (appId) => {
    try {
      await axios.patch(
        `${API_ENDPOINTS.APPLICATIONS}/${appId}/archive`,
        { archive: true },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      showToast("Application moved to history", "success");
      fetchApps();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to archive", "error");
    }
  };

  const handleRestoreFromHistory = async (appId) => {
    try {
      await axios.patch(
        `${API_ENDPOINTS.APPLICATIONS}/${appId}/archive`,
        { archive: false },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      showToast("Application restored successfully", "success");
      fetchApps();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to restore application",
        "error",
      );
    }
  };

  const handlePermanentDelete = async (appId, hostelName) => {
    const result = await Swal.fire({
      title: "Delete Permanently?",
      html: `<p>Are you sure you want to <strong>permanently delete</strong> this application?</p>
                   <p class="text-sm text-gray-600 mt-2">Hostel: <strong>${hostelName}</strong></p>
                   <p class="text-red-600 font-semibold mt-3">⚠️ This action cannot be undone!</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Delete Permanently",
      cancelButtonText: "Cancel",
      text: `Are you sure you want to permanently delete this application for ${hostelName || "this hostel"}? This action cannot be undone.`,
      html: undefined,
      customClass: {
        confirmButton: "px-4 py-2 rounded-md font-medium",
        cancelButton: "px-4 py-2 rounded-md font-medium",
      },
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_ENDPOINTS.APPLICATIONS}/${appId}/permanent`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire({
          title: "Deleted!",
          text: "Application has been permanently deleted.",
          icon: "success",
          confirmButtonColor: "#23817A",
          timer: 2000,
        });
        fetchApps();
      } catch (err) {
        Swal.fire({
          title: "Error",
          text: err.response?.data?.error || "Failed to delete application",
          icon: "error",
          confirmButtonColor: "#ef4444",
        });
      }
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "approved":
        return "bg-[#173b35] text-[#f6deb1]";
      case "rejected":
        return "bg-red-600 text-white";
      case "approved_for_payment":
        return "bg-[#c96e32] text-white";
      case "paid_awaiting_final":
        return "bg-[#c96e32]/80 text-white";
      default:
        return "bg-[#173b35]/10 text-[#173b35]";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "approved_for_payment":
        return "Ready to Pay";
      case "paid_awaiting_final":
        return "Payment Received";
      default:
        return status?.replace(/_/g, " ") || "Pending";
    }
  };

  return (
    <div className="min-h-screen student-workspace bg-[#f8f6f0] py-8 sm:py-10">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 rounded-2xl px-6 py-3.5 shadow-2xl text-sm font-bold tracking-wide transition-all ${
            toast.type === "success"
              ? "bg-[#173b35] text-[#f6deb1] border border-[#f6deb1]/20"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Hero Header — floating rounded-3xl container */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[#173b35] p-8 sm:p-12 lg:p-14 text-white shadow-[0_20px_50px_rgba(23,59,53,0.16)]">
          {/* Subtle decorative background circles */}
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[#f6deb1]/5 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[#c96e32]/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#f6deb1] backdrop-blur-sm">
                Student dashboard
              </span>
              <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] sm:text-5xl lg:text-6xl text-white">
                My Applications
              </h1>
              <p className="mt-3 max-w-lg text-base leading-7 text-white/80 sm:text-lg">
                Track approvals, payment status, and final access details in one
                unified space.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/change-password"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white hover:text-[#173b35]"
              >
                <KeyRound className="w-4 h-4" />
                Change Password
              </Link>
              <FilterTabGroup
                tabs={[
                  { value: 'active', label: 'Active' },
                  { value: 'history', label: 'History' },
                ]}
                activeTab={viewMode}
                onChange={(val) => {
                  setViewMode(val);
                  setSelectedApps([]);
                }}
              />
            </div>
          </div>
        </div>

        {/* Bulk action bar */}
        {selectedApps.length > 0 && (
          <div className="rounded-3xl border border-[#173b35]/15 bg-[#e6eadf] p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#173b35] text-xs font-bold text-[#f6deb1]">
                  {selectedApps.length}
                </span>
                <span className="text-sm font-bold text-[#173b35]">
                  {selectedApps.length === 1
                    ? "application selected"
                    : "applications selected"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {viewMode === "active" ? (
                  <button
                    onClick={async () => {
                      try {
                        await Promise.all(
                          selectedApps.map((id) =>
                            axios.patch(
                              `${API_ENDPOINTS.APPLICATIONS}/${id}/archive`,
                              { archive: true },
                              { headers: { Authorization: `Bearer ${token}` } },
                            ),
                          ),
                        );
                        showToast("Applications moved to history", "success");
                        setSelectedApps([]);
                        fetchApps();
                      } catch (err) {
                        showToast("Some operations failed", "error");
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-[#173b35]/30 bg-white px-5 py-2.5 text-sm font-bold text-[#173b35] shadow-sm transition-all hover:bg-[#173b35] hover:text-white"
                  >
                    Move Selected to History
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      const result = await Swal.fire({
                        title: "Delete Permanently?",
                        html: `<p>Are you sure you want to <strong>permanently delete ${selectedApps.length} application(s)</strong>?</p>
                                                <p class="text-red-600 font-semibold mt-3">⚠️ This action cannot be undone!</p>`,
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#ef4444",
                        cancelButtonColor: "#6b7280",
                        confirmButtonText: "Yes, Delete Permanently",
                        cancelButtonText: "Cancel",
                        text: `Are you sure you want to permanently delete ${selectedApps.length} application(s)? This action cannot be undone.`,
                        html: undefined,
                      });
                      if (result.isConfirmed) {
                        try {
                          await Promise.all(
                            selectedApps.map((id) =>
                              axios.delete(
                                `${API_ENDPOINTS.APPLICATIONS}/${id}/permanent`,
                                { headers: { Authorization: `Bearer ${token}` } },
                              ),
                            ),
                          );
                          Swal.fire({
                            title: "Deleted!",
                            text: "Applications permanently deleted.",
                            icon: "success",
                            confirmButtonColor: "#23817A",
                            timer: 2000,
                          });
                          setSelectedApps([]);
                          fetchApps();
                        } catch (err) {
                          Swal.fire({
                            title: "Error",
                            text: "Some deletions failed",
                            icon: "error",
                            confirmButtonColor: "#ef4444",
                          });
                        }
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-red-700"
                  >
                    Delete Selected Permanently
                  </button>
                )}
                <button
                  onClick={() => setSelectedApps([])}
                  className="inline-flex items-center gap-2 rounded-full border border-[#173b35]/20 bg-transparent px-5 py-2.5 text-sm font-bold text-[#173b35] transition-all hover:bg-[#173b35]/10"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <LoadingSpinner message="Loading your applications..." fullScreen />
        ) : applications.length === 0 ? (
          /* Empty state */
          <div className="rounded-[2.5rem] border border-[#deddd4] bg-[#e6eadf]/70 p-10 text-center sm:p-16">
            <span className="inline-flex items-center rounded-full bg-[#c96e32]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#c96e32]">
              No applications yet
            </span>
            <h2 className="mt-4 text-2xl font-black tracking-[-0.04em] text-[#173b35] sm:text-4xl">
              Your journey starts with a hostel.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base leading-7 text-[#526960]">
              Browse verified rooms, compare options, and apply when you are ready.
              Payment is only requested after approval.
            </p>
            <Link
              to="/hostels"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#c96e32] px-8 py-4 text-sm font-bold text-white shadow-lg shadow-[#c96e32]/20 transition-all hover:bg-[#ad5926] hover:-translate-y-0.5"
            >
              Browse hostels
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Select All Bar — soft rounded card */}
            {applications.length > 0 && (
              <div className="flex items-center gap-3 rounded-2xl border border-[#deddd4]/80 bg-white/80 px-5 py-3.5 shadow-sm backdrop-blur-sm">
                <input
                  type="checkbox"
                  checked={selectedApps.length === applications.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedApps(applications.map((a) => a._id));
                    } else {
                      setSelectedApps([]);
                    }
                  }}
                  className="h-4 w-4 rounded-md border-[#173b35]/30 text-[#173b35] focus:ring-[#173b35]"
                />
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#526960]">
                  Select All Applications
                </span>
              </div>
            )}

            {/* Application cards */}
            {applications.map((app) => (
              <div
                key={app._id}
                className="group rounded-[2rem] border border-[#deddd4]/80 bg-white p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-200 hover:shadow-[0_12px_35px_rgba(23,59,53,0.08)] hover:border-[#173b35]/20"
              >
                <div className="flex items-start gap-4 sm:gap-5">
                  <input
                    type="checkbox"
                    checked={selectedApps.includes(app._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedApps([...selectedApps, app._id]);
                      } else {
                        setSelectedApps(
                          selectedApps.filter((id) => id !== app._id),
                        );
                      }
                    }}
                    className="mt-1.5 h-4 w-4 rounded-md border-[#173b35]/30 text-[#173b35] focus:ring-[#173b35]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-black tracking-[-0.02em] text-[#173b35]">
                          {app.hostelId?.name}
                        </h3>
                        <p className="mt-1 text-sm font-medium text-[#526960]">
                          {app.semester}
                        </p>
                      </div>
                      <span
                        className={`inline-flex self-start rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider shadow-sm ${getStatusStyle(app.status)}`}
                      >
                        {getStatusLabel(app.status)}
                      </span>
                    </div>

                    {/* Pay Now + Move to History — approved_for_payment */}
                    {app.status === "approved_for_payment" &&
                      viewMode === "active" && (
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                          <button
                            onClick={() => handleProceedToPayment(app)}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#c96e32] px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-[#c96e32]/20 transition-all hover:bg-[#ad5926] hover:-translate-y-0.5"
                          >
                            <CreditCard size={16} /> Pay Now
                          </button>
                          <button
                            onClick={() => handleMoveToHistory(app._id)}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#173b35]/25 bg-white px-6 py-3.5 text-sm font-bold text-[#173b35] transition-all hover:bg-[#173b35] hover:text-white"
                          >
                            <Archive size={16} /> Move to History
                          </button>
                        </div>
                      )}

                    {/* Move to History — pending/rejected */}
                    {(app.status === "pending" || app.status === "rejected") &&
                      viewMode === "active" && (
                        <div className="mt-6">
                          <button
                            onClick={() => handleMoveToHistory(app._id)}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-[#173b35]/25 bg-white px-6 py-3 text-sm font-bold text-[#173b35] transition-all hover:bg-[#173b35] hover:text-white sm:w-auto"
                          >
                            <Archive size={16} /> Move to History
                          </button>
                        </div>
                      )}

                    {/* History view — Restore & Delete */}
                    {viewMode === "history" && (
                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <button
                          onClick={() => handleRestoreFromHistory(app._id)}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-[#173b35]/25 bg-white px-6 py-3 text-sm font-bold text-[#173b35] transition-all hover:bg-[#173b35] hover:text-white"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() =>
                            handlePermanentDelete(app._id, app.hostelId?.name)
                          }
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-red-700"
                        >
                          Delete Permanently
                        </button>
                      </div>
                    )}

                    {/* Approved details — rounded sage green panel */}
                    {app.status === "approved" && (
                      <div className="mt-6 rounded-2xl border border-[#173b35]/10 bg-[#e6eadf]/80 p-5 sm:p-6">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#173b35]">
                          Final Approval Details
                        </p>
                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                          <div className="rounded-xl bg-white/70 p-3.5 border border-white/60">
                            <p className="text-xs font-medium text-[#526960]">Student</p>
                            <p className="mt-0.5 text-sm font-bold text-[#173b35]">
                              {app.studentName || user?.name || "Student"}
                            </p>
                          </div>
                          <div className="rounded-xl bg-white/70 p-3.5 border border-white/60">
                            <p className="text-xs font-medium text-[#526960]">Semester</p>
                            <p className="mt-0.5 text-sm font-bold text-[#173b35]">
                              {app.semester}
                            </p>
                          </div>
                          <div className="rounded-xl bg-white/70 p-3.5 border border-white/60">
                            <p className="text-xs font-medium text-[#526960]">Access Code</p>
                            <p className="mt-0.5 text-sm font-bold text-[#173b35]">
                              {app.accessCode || "Pending issuance"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
