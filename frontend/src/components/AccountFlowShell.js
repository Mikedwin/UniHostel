import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Logo from "./Logo";

const AccountFlowShell = ({
  icon: Icon,
  title,
  description,
  asideTitle,
  asideCopy,
  notes = [],
  backTo = "/",
  backLabel = "Back to UniHostel",
  children,
}) => {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return undefined;
    setReady(true);
  }, []);
  return (
    <div ref={ref} className={`account-flow ${ready ? "is-ready" : ""}`}>
      <aside className="account-flow-story">
        <img
          src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1800&q=85"
          alt="Student accommodation in Ghana"
        />
        <div className="account-flow-story-veil" />
        <div className="account-flow-story-content">
          <Link to="/" className="account-flow-brand inline-flex items-center gap-2.5">
            <Logo reverse className="h-7 w-7" />
            <span>UniHostel</span>
          </Link>
          <div>
            <span className="account-flow-rule" />
            <h1>{asideTitle}</h1>
            <p>{asideCopy}</p>
            <div className="account-flow-notes">
              {notes.map((note) => (
                <span key={note}>{note}</span>
              ))}
            </div>
          </div>
          <small>Verified student housing across Ghana.</small>
        </div>
      </aside>
      <main className="account-flow-main">
        <div className="account-flow-card">
          <Link to={backTo} className="account-flow-back">
            <ArrowLeft />
            {backLabel}
          </Link>
          <div className="account-flow-icon">
            <Icon />
          </div>
          <h2>{title}</h2>
          <p className="account-flow-description">{description}</p>
          {children}
          <Link to="/" className="account-flow-home inline-flex items-center gap-2">
            <Logo className="h-4 w-4" /> UniHostel home
          </Link>
        </div>
      </main>
    </div>
  );
};

export default AccountFlowShell;
