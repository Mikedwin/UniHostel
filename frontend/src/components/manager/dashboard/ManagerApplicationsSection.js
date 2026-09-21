import React from "react";
import { Check, ChevronRight, Inbox, X } from "lucide-react";
const ManagerApplicationsSection = ({
  filteredApplications = [],
  setSelectedApp,
  setShowDetailsModal,
  onStatusUpdate,
  statusFilter,
  setStatusFilter,
}) => (
  <section className="manager-requests-panel">
    <div className="workspace-panel-heading">
      <div>
        <span>Application desk</span>
        <h2>Student requests</h2>
      </div>
      <div className="manager-filter">
        <button
          className={statusFilter === "all" ? "is-active" : ""}
          onClick={() => setStatusFilter("all")}
        >
          All
        </button>
        <button
          className={statusFilter === "pending" ? "is-active" : ""}
          onClick={() => setStatusFilter("pending")}
        >
          Pending
        </button>
      </div>
    </div>
    {filteredApplications.length ? (
      <div className="manager-application-list">
        {filteredApplications.slice(0, 8).map((app) => (
          <article key={app._id}>
            <button
              className="manager-application-open"
              onClick={() => {
                setSelectedApp(app);
                setShowDetailsModal(true);
              }}
            >
              <span className="manager-app-avatar">
                {(app.studentName || "S").charAt(0)}
              </span>
              <span>
                <strong>{app.studentName || "Student application"}</strong>
                <small>
                  {app.hostelId?.name || "Hostel request"} ·{" "}
                  {app.semester || "Current term"}
                </small>
                {app.status === "approved" && app.accessCode && (
                  <small>Access code: {app.accessCode}</small>
                )}
              </span>
              <em>{String(app.status || "pending").replaceAll("_", " ")}</em>
              <ChevronRight />
            </button>
            {app.status === "pending" && (
              <div className="manager-quick-actions">
                <button
                  onClick={() => onStatusUpdate(app._id, "approve_for_payment")}
                >
                  <Check /> Approve for payment
                </button>
                <button onClick={() => onStatusUpdate(app._id, "reject")}>
                  <X /> Decline
                </button>
              </div>
            )}
            {app.status === "paid_awaiting_final" && (
              <div className="manager-quick-actions">
                <button onClick={() => onStatusUpdate(app._id, "final_approve")}>
                  <Check /> Confirm payment & approve
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    ) : (
      <div className="workspace-empty">
        <Inbox />
        <p>No applications in this view.</p>
      </div>
    )}
  </section>
);
export default ManagerApplicationsSection;
