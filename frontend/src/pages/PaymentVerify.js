import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { CheckCircle, XCircle, Loader, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API_URL from "../config";
import AccountFlowShell from "../components/AccountFlowShell";

const PaymentVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [status, setStatus] = useState("verifying"); // verifying, success, failed
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get("reference");

      if (!reference) {
        setStatus("failed");
        setMessage("Invalid payment reference");
        return;
      }

      try {
        const response = await axios.get(
          `${API_URL}/api/payment/verify/${reference}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.data.success) {
          setStatus("success");
          setMessage(
            "Payment successful! Your application has been submitted.",
          );
          setTimeout(() => navigate("/student-dashboard"), 3000);
        } else {
          setStatus("failed");
          setMessage("Payment verification failed. Please contact support.");
        }
      } catch (error) {
        setStatus("failed");
        setMessage(
          error.response?.data?.message || "Payment verification failed",
        );
      }
    };

    verifyPayment();
  }, [searchParams, token, navigate]);

  return (
    <AccountFlowShell
      icon={ShieldCheck}
      title="Payment check"
      description="We are matching your payment to your accommodation application."
      asideTitle="A clear path from approval to move-in."
      asideCopy="Payments are only requested after a manager has approved your application."
      notes={["Approval first", "Secure payment", "Application tracked"]}
      backTo="/student-dashboard"
      backLabel="Back to my applications"
    >
      <div
        className={`payment-state payment-state--${status}`}
        aria-live="polite"
      >
        {status === "verifying" && (
          <>
            <span className="payment-state-orbit">
              <Loader />
            </span>
            <h3>Checking your payment</h3>
            <p>{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <span className="payment-state-orbit">
              <CheckCircle />
            </span>
            <h3>Payment confirmed</h3>
            <p>{message}</p>
            <small>Taking you back to your applications…</small>
          </>
        )}

        {status === "failed" && (
          <>
            <span className="payment-state-orbit">
              <XCircle />
            </span>
            <h3>We could not confirm it</h3>
            <p>{message}</p>
            <button
              onClick={() => navigate("/hostels")}
              className="payment-state-action"
            >
              Browse hostels
            </button>
          </>
        )}
      </div>
    </AccountFlowShell>
  );
};

export default PaymentVerify;
