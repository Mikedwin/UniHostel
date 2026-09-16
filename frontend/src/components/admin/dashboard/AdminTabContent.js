import React, { Suspense, useState } from "react";
import {
  Building2,
  Clock3,
  ShieldCheck,
  UserPlus,
  Users,
  Shield,
  UserCheck,
  UserX,
  Key,
  Trash2,
  Eye,
  Mail,
  Phone,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

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
  const [showManagerCreateForm, setShowManagerCreateForm] = useState(false);
  const [managerSearch, setManagerSearch] = useState("");

  const safeManagers = Array.isArray(managers) ? managers : [];
  const safeHostels = Array.isArray(hostels) ? hostels : [];
  const safeLogs = Array.isArray(logs) ? logs : [];

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
  if (activeTab === "managers") {
    const filteredManagers = safeManagers.filter((m) => {
      if (!managerSearch) return true;
      const q = managerSearch.toLowerCase();
      return (
        m.name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.hostelName?.toLowerCase().includes(q) ||
        m.phone?.toLowerCase().includes(q)
      );
    });

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-[#173b35]" />
              Hostel Managers ({safeManagers.length})
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              View, verify, manage accounts, or create credentials for hostel managers.
            </p>
          </div>
          <button
            onClick={() => setShowManagerCreateForm(!showManagerCreateForm)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#173b35] text-white text-sm font-semibold hover:bg-[#122e29] transition shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            {showManagerCreateForm ? "View Managers List" : "Register New Manager"}
          </button>
        </div>

        {showManagerCreateForm ? (
          <Suspense fallback={tabFallback("Loading manager registration form…")}>
            <ManagerRegistrationForm
              token={token}
              onSuccess={() => {
                setShowManagerCreateForm(false);
                if (refreshDashboard) refreshDashboard();
              }}
            />
          </Suspense>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <input
                type="text"
                value={managerSearch}
                onChange={(e) => setManagerSearch(e.target.value)}
                placeholder="Search managers by name, email, or hostel..."
                className="w-full sm:max-w-md px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#173b35]/20 focus:border-[#173b35]"
              />
              <span className="text-xs text-slate-500 font-medium">
                Showing {filteredManagers.length} of {safeManagers.length} managers
              </span>
            </div>

            {filteredManagers.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-700">No managers found</h3>
                <p className="text-sm text-slate-500 mt-1 mb-4">
                  {managerSearch ? "No managers matched your search query." : "No managers have been registered yet."}
                </p>
                <button
                  onClick={() => setShowManagerCreateForm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#173b35] text-white text-sm font-medium hover:bg-[#122e29] transition"
                >
                  <UserPlus className="w-4 h-4" />
                  Create First Manager
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Manager</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Hostel</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredManagers.map((manager) => {
                      const isPending = manager.accountStatus === "pending_verification" || !manager.isVerified;
                      const isSuspended = manager.accountStatus === "suspended" || manager.accountStatus === "banned";

                      return (
                        <tr key={manager._id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{manager.name}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3" /> {manager.email}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-600">
                            {manager.phone ? (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" /> {manager.phone}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">No phone</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-800 text-xs">
                            {manager.hostelName || (
                              <span className="text-slate-400 italic">Unassigned</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {manager.isVerified ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3" /> Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                  <AlertTriangle className="w-3 h-3" /> Unverified
                                </span>
                              )}
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                                  isSuspended
                                    ? "bg-red-50 text-red-700 border border-red-200"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {(manager.accountStatus || "active").replace("_", " ")}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onUserAction && onUserAction("view", manager)}
                                className="p-1.5 text-slate-500 hover:text-[#173b35] hover:bg-slate-100 rounded-lg transition"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {isPending && onUserAction && (
                                <button
                                  onClick={() => onUserAction("verify", manager)}
                                  className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition"
                                  title="Verify Manager"
                                >
                                  <Shield className="w-4 h-4" />
                                </button>
                              )}
                              {onUserAction && (
                                <>
                                  {manager.accountStatus === "active" ? (
                                    <button
                                      onClick={() => onUserAction("suspend", manager)}
                                      className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition"
                                      title="Suspend Manager"
                                    >
                                      <UserX className="w-4 h-4" />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => onUserAction("activate", manager)}
                                      className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition"
                                      title="Activate Manager"
                                    >
                                      <UserCheck className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => onUserAction("reset-password", manager)}
                                    className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                                    title="Reset Password"
                                  >
                                    <Key className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => onUserAction("delete", manager)}
                                    className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
                                    title="Delete Manager"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
  if (activeTab === "hostels")
    return (
      <section className="admin-listing-review">
        <div className="workspace-panel-heading">
          <div>
            <span>Listing review</span>
            <h2>Homes on the platform</h2>
          </div>
        </div>
        {safeHostels.length ? (
          safeHostels.map((hostel) => (
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
              safeManagers.filter(
                (manager) => manager.accountStatus === "pending_verification" || !manager.isVerified,
              ).length
            }
          </strong>
          <p>Managers awaiting verification</p>
        </article>
        <article>
          <strong>
            {safeHostels.filter((hostel) => hostel.isActive === false).length}
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
        {safeLogs.length ? (
          safeLogs
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
