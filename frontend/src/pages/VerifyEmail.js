import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { CheckCircle2, Loader, MailCheck, XCircle } from "lucide-react";
import { API_ENDPOINTS } from "../config/api";
import AccountFlowShell from "../components/AccountFlowShell";

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("Verifying your email address...");
  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("failed");
        setMessage("Invalid verification link.");
        return;
      }
      try {
        const response = await axios.get(API_ENDPOINTS.VERIFY_EMAIL(token));
        setStatus("success");
        setMessage(
          response.data?.message ||
            "Email verified successfully. You can now sign in.",
        );
      } catch (error) {
        setStatus("failed");
        setMessage(
          error.response?.data?.message || "Email verification failed.",
        );
      }
    };
    verify();
  }, [token]);
  const Icon =
    status === "verifying"
      ? Loader
      : status === "success"
        ? CheckCircle2
        : XCircle;
  return (
    <AccountFlowShell
      icon={Icon}
      title={
        status === "verifying"
          ? "Checking your email."
          : status === "success"
            ? "Email verified."
            : "Link did not work."
      }
      description={
        status === "verifying"
          ? "Hold on while we confirm this address."
          : message
      }
      asideTitle="One small check. Then you are in."
      asideCopy="Email verification keeps student housing decisions tied to real accounts."
      notes={[
        "Secure account access",
        "Verified contact details",
        "Clear next steps",
      ]}
      backTo="/"
      backLabel="Back to UniHostel"
    >
      <div className="account-flow-complete">
        {status === "verifying" ? (
          <>
            <strong className="flex items-center gap-2">
              <Loader className="unihostel-button-loader" /> Verifying email
            </strong>
            <p>{message}</p>
          </>
        ) : status === "success" ? (
          <>
            <strong>Ready to sign in</strong>
            <p>{message}</p>
            <Link className="account-flow-submit mt-5" to="/login">
              Go to sign in
            </Link>
          </>
        ) : (
          <>
            <strong>Verification failed</strong>
            <p>{message}</p>
            <Link className="account-flow-submit mt-5" to="/student-register">
              Return to registration
            </Link>
          </>
        )}
      </div>
    </AccountFlowShell>
  );
};
export default VerifyEmail;
