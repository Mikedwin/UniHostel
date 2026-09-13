import React, { Suspense } from "react";
import { Building2, Clock3, ShieldCheck } from "lucide-react";

const AdminTabContent = ({
  activeTab,
  token,
  stats,
  hostels = [],
  managers = [],
  logs = [],
  onApplicationAction,
  onUserAction,
  onDeleteHostel,
  onFlagHostel,
  onToggleHostelActive,
  tabFallback,
  UserManagementTable,
  AnalyticsDashboard,
  ApplicationManagementTable,
  ManagerRegistrationForm,
  WaitlistManagementTable,
  refreshDashboard,
}) => {
  if (activeTab === "waitlist")
    return (
      <Suspense fallback={tabFallback("Loading waitlist leads…")}>
        <WaitlistManagementTable token={token} />
      </Suspense>
    );
  if (activeTab === "users")
    return (
      <Suspense fallback={tabFallback("Loading people…")}>
        <UserManagementTable token={token} onAction={onUserAction} />
      </Suspense>
    );
  if (activeTab === "applications")
    return (
      <Suspense fallback={tabFallback("Loading applications…")}>
        <ApplicationManagementTable
          token={token}
          onAction={onApplicationAction}
        />
      </Suspense>
    );
  if (activeTab === "analytics")
    return (
      <Suspense fallback={tabFallback("Loading platform signals…")}>
        <AnalyticsDashboard token={token} />
      </Suspense>
    );
  if (activeTab === "managers")
    return (
      <Suspense fallback={tabFallback("Loading manager tools…")}>
        <ManagerRegistrationForm token={token} onSuccess={refreshDashboard} />
      </Suspense>
    );
  if (activeTab === "hostels")
    return (
      <section className="admin-listing-review">
        <div className="workspace-panel-heading">
          <div>
            <span>Listing review</span>
            <h2>Homes on the platform</h2>
          </div>
        </div>
        {hostels.length ? (
          hostels.map((hostel) => (
            <article key={hostel._id}>
              <div>
                <strong>{hostel.name}</strong>
                <p>
                  {hostel.location || "No location added"} ·{" "}
                  {hostel.managerId?.name || "Manager"}
                </p>
              </div>
              <div>
                <button onClick={() => onToggleHostelActive(hostel._id)}>
                  {hostel.isActive === false ? "Activate" : "Pause"}
                </button>
                <button onClick={() => onFlagHostel(hostel._id)}>Flag</button>
                <button
                  className="is-danger"
                  onClick={() => onDeleteHostel(hostel._id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="workspace-empty">
            <Building2 />
            <p>No hostels to review.</p>
          </div>
        )}
      </section>
    );
  return (
    <section className="admin-overview">
      <div className="workspace-panel-heading">
        <div>
          <span>Platform pulse</span>
          <h2>What needs your attention</h2>
        </div>
        <ShieldCheck />
      </div>
      <div className="admin-overview-grid">
        <article>
          <strong>
            {
              managers.filter(
                (manager) => manager.accountStatus === "pending_verification",
              ).length
            }
          </strong>
          <p>Managers awaiting verification</p>
        </article>
        <article>
          <strong>
            {hostels.filter((hostel) => hostel.isActive === false).length}
          </strong>
          <p>Listings currently paused</p>
        </article>
        <article>
          <strong>{stats?.totalApplications ?? 0}</strong>
          <p>Applications in the system</p>
        </article>
      </div>
      <div className="admin-activity">
        <span>
          <Clock3 /> Recent platform activity
        </span>
        {logs.length ? (
          logs
            .slice(0, 6)
            .map((log, index) => (
              <p key={log._id || index}>
                {log.action || log.message || "Platform activity recorded"}
              </p>
            ))
        ) : (
          <p>No recent activity recorded.</p>
        )}
      </div>
    </section>
  );
};
export default AdminTabContent;
