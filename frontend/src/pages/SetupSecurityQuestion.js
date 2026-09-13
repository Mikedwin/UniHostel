import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API_URL from "../config";
import AccountFlowShell from "../components/AccountFlowShell";

const questions = [
  "What was the name of your first pet?",
  "What city were you born in?",
  "What is your mother's maiden name?",
  "What was the name of your elementary school?",
  "What is your favorite book?",
  "What was your childhood nickname?",
  "In what city did you meet your spouse/partner?",
  "What is the name of your favorite childhood friend?",
];
const SetupSecurityQuestion = () => {
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!securityQuestion || !securityAnswer)
      return setError("Select a question and provide an answer");
    if (securityAnswer.trim().length < 2)
      return setError("Answer must be at least 2 characters");
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/auth/set-security-question`,
        { securityQuestion, securityAnswer },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSuccess("Security question set successfully!");
      setTimeout(() => navigate(-1), 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to set security question",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <AccountFlowShell
      icon={ShieldCheck}
      title="Set security question."
      description="One familiar answer gives you another safe way back into your account."
      asideTitle="A fallback you can trust."
      asideCopy="Create an answer you will remember but nobody else can easily guess."
      notes={[
        "Private recovery detail",
        "Answer is case-insensitive",
        "Saved to your account",
      ]}
      backTo="/student-dashboard"
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
      <form onSubmit={submit} className="account-flow-form">
        <label className="account-flow-field">
          Security question
          <select
            required
            value={securityQuestion}
            onChange={(e) => setSecurityQuestion(e.target.value)}
          >
            <option value="">Choose a question</option>
            {questions.map((question) => (
              <option key={question} value={question}>
                {question}
              </option>
            ))}
          </select>
        </label>
        <label className="account-flow-field">
          Your answer
          <input
            type="text"
            required
            placeholder="Enter your answer"
            value={securityAnswer}
            onChange={(e) => setSecurityAnswer(e.target.value)}
          />
          <small>Remember this answer. It is case-insensitive.</small>
        </label>
        <button
          type="submit"
          className="account-flow-submit"
          disabled={loading}
        >
          {loading ? (
            "Saving..."
          ) : (
            <>
              Save security question <ArrowRight />
            </>
          )}
        </button>
      </form>
    </AccountFlowShell>
  );
};
export default SetupSecurityQuestion;
