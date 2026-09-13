import React from "react";
const ManagerApplicationDetailsModal = ({
  application,
  isOpen,
  onClose,
  onStatusUpdate,
}) =>
  !isOpen || !application ? null : (
    <div className="workspace-modal-backdrop" onClick={onClose}>
      <section className="workspace-modal" onClick={(e) => e.stopPropagation()}>
        <span>Application detail</span>
        <h2>{application.studentName || "Student"}</h2>
        <p>
          {application.hostelId?.name || "Hostel request"} ·{" "}
          {application.semester || "Current term"}
        </p>
        <p className="workspace-modal-status">
          {String(application.status || "pending").replaceAll("_", " ")}
        </p>
        {application.status === "pending" && (
          <button
            className="workspace-primary"
            onClick={() =>
              onStatusUpdate(application._id, "approve_for_payment")
            }
          >
            Approve for payment
          </button>
        )}
        <button className="workspace-secondary" onClick={onClose}>
          Close
        </button>
      </section>
    </div>
  );
export default ManagerApplicationDetailsModal;
