import { useState } from "react";

type Role = "Super Admin" | "Sales Manager" | "Sales Engineer" | "Field Support" | "Viewer";

interface Permission {
  module: string;
  key: string;
  actions: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    export: boolean;
  };
}

type RoleMatrix = Record<Role, Permission[]>;

const MODULES = [
  { module: "Dashboard", key: "dashboard" },
  { module: "Leads & Enquiries", key: "leads" },
  { module: "Lead Pipeline", key: "pipeline" },
  { module: "Projects", key: "projects" },
  { module: "Follow-ups", key: "followups" },
  { module: "Monthly Review", key: "monthly_review" },
  { module: "Sales Performance", key: "sales_perf" },
  { module: "Employee Tracking", key: "emp_tracking" },
  { module: "User Management", key: "user_mgmt" },
  { module: "Access Management", key: "access_mgmt" },
  { module: "Reports & Export", key: "reports" },
];

const DEFAULT_PERMS: Record<Role, Partial<Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean; export: boolean }>>> = {
  "Super Admin": {},   // all true
  "Sales Manager": {
    user_mgmt:   { view: true,  create: false, edit: false, delete: false, export: false },
    access_mgmt: { view: true,  create: false, edit: false, delete: false, export: false },
  },
  "Sales Engineer": {
    dashboard:    { view: true,  create: false, edit: false, delete: false, export: false },
    leads:        { view: true,  create: true,  edit: true,  delete: false, export: false },
    pipeline:     { view: true,  create: false, edit: true,  delete: false, export: false },
    projects:     { view: true,  create: false, edit: false, delete: false, export: false },
    followups:    { view: true,  create: true,  edit: true,  delete: false, export: false },
    monthly_review: { view: true,  create: false, edit: false, delete: false, export: false },
    sales_perf:   { view: false, create: false, edit: false, delete: false, export: false },
    emp_tracking: { view: false, create: false, edit: false, delete: false, export: false },
    user_mgmt:    { view: false, create: false, edit: false, delete: false, export: false },
    access_mgmt:  { view: false, create: false, edit: false, delete: false, export: false },
    reports:      { view: false, create: false, edit: false, delete: false, export: false },
  },
  "Field Support": {
    dashboard:    { view: true,  create: false, edit: false, delete: false, export: false },
    leads:        { view: true,  create: false, edit: false, delete: false, export: false },
    pipeline:     { view: true,  create: false, edit: false, delete: false, export: false },
    projects:     { view: true,  create: false, edit: false, delete: false, export: false },
    followups:    { view: true,  create: true,  edit: true,  delete: false, export: false },
    monthly_review: { view: false, create: false, edit: false, delete: false, export: false },
    sales_perf:   { view: false, create: false, edit: false, delete: false, export: false },
    emp_tracking: { view: false, create: false, edit: false, delete: false, export: false },
    user_mgmt:    { view: false, create: false, edit: false, delete: false, export: false },
    access_mgmt:  { view: false, create: false, edit: false, delete: false, export: false },
    reports:      { view: false, create: false, edit: false, delete: false, export: false },
  },
  "Viewer": {
    dashboard:    { view: true,  create: false, edit: false, delete: false, export: false },
    leads:        { view: true,  create: false, edit: false, delete: false, export: false },
    pipeline:     { view: true,  create: false, edit: false, delete: false, export: false },
    projects:     { view: true,  create: false, edit: false, delete: false, export: false },
    followups:    { view: true,  create: false, edit: false, delete: false, export: false },
    monthly_review: { view: true,  create: false, edit: false, delete: false, export: false },
    sales_perf:   { view: true,  create: false, edit: false, delete: false, export: false },
    emp_tracking: { view: false, create: false, edit: false, delete: false, export: false },
    user_mgmt:    { view: false, create: false, edit: false, delete: false, export: false },
    access_mgmt:  { view: false, create: false, edit: false, delete: false, export: false },
    reports:      { view: true,  create: false, edit: false, delete: false, export: true  },
  },
};

type Action = "view" | "create" | "edit" | "delete" | "export";
const ALL_ACTIONS: Action[] = ["view", "create", "edit", "delete", "export"];

function getDefault(role: Role, key: string, action: Action): boolean {
  if (role === "Super Admin") return true;
  const override = DEFAULT_PERMS[role][key];
  if (override) return override[action] ?? false;
  // Sales Manager gets almost everything
  if (role === "Sales Manager") {
    if (key === "user_mgmt" || key === "access_mgmt") return action === "view";
    if (action === "delete") return false;
    return true;
  }
  return false;
}

const ROLES: Role[] = ["Super Admin", "Sales Manager", "Sales Engineer", "Field Support", "Viewer"];

const ROLE_COLORS: Record<Role, string> = {
  "Super Admin":    "bg-red-50 text-red-700 border-red-200",
  "Sales Manager":  "bg-[#eef0f9] text-[#253580] border-[#c5cbea]",
  "Sales Engineer": "bg-blue-50 text-blue-700 border-blue-200",
  "Field Support":  "bg-cyan-50 text-cyan-700 border-cyan-200",
  "Viewer":         "bg-slate-100 text-slate-600 border-slate-200",
};

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  "Super Admin":    "Full system access. Can manage users, roles, and all data.",
  "Sales Manager":  "Manages sales team, views all reports, manages leads and pipeline.",
  "Sales Engineer": "Manages own leads and follow-ups. Limited reporting access.",
  "Field Support":  "Views leads and projects. Manages own follow-ups and visits.",
  "Viewer":         "Read-only access to dashboard, leads, pipeline, and reports.",
};

type PermMatrix = Record<Role, Record<string, Record<Action, boolean>>>;

function buildInitialMatrix(): PermMatrix {
  const m = {} as PermMatrix;
  for (const role of ROLES) {
    m[role] = {};
    for (const mod of MODULES) {
      m[role][mod.key] = {} as Record<Action, boolean>;
      for (const action of ALL_ACTIONS) {
        m[role][mod.key][action] = getDefault(role, mod.key, action);
      }
    }
  }
  return m;
}

export default function AccessManagement() {
  const [matrix, setMatrix] = useState<PermMatrix>(buildInitialMatrix);
  const [selectedRole, setSelectedRole] = useState<Role>("Sales Engineer");
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggle(role: Role, moduleKey: string, action: Action) {
    if (role === "Super Admin") return; // immutable
    setMatrix(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [moduleKey]: {
          ...prev[role][moduleKey],
          [action]: !prev[role][moduleKey][action],
        },
      },
    }));
    setHasChanges(true);
    setSaved(false);
  }

  function toggleAll(moduleKey: string, action: Action) {
    if (selectedRole === "Super Admin") return;
    const currentVal = matrix[selectedRole][moduleKey][action];
    setMatrix(prev => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [moduleKey]: {
          ...prev[selectedRole][moduleKey],
          [action]: !currentVal,
        },
      },
    }));
    setHasChanges(true);
    setSaved(false);
  }

  function saveChanges() {
    setHasChanges(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const perms = matrix[selectedRole];
  const totalGranted = Object.values(perms).reduce((s, mod) =>
    s + Object.values(mod).filter(Boolean).length, 0
  );
  const totalPossible = MODULES.length * ALL_ACTIONS.length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-5 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-slate-900">Access Management</h1>
            <p className="text-[11px] text-slate-400">Configure role-based permissions for each module</p>
          </div>
          <div className="flex items-center gap-2">
            {saved && (
              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                ✓ Changes saved
              </span>
            )}
            {hasChanges && (
              <button
                onClick={saveChanges}
                className="text-xs font-semibold text-white px-3 py-1.5 rounded"
                style={{ background: "#253580" }}
              >
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Role selector */}
        <div className="w-64 flex-shrink-0 bg-white border-r border-slate-200 overflow-y-auto">
          <div className="p-3 border-b border-slate-100">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Roles</div>
            <div className="space-y-1">
              {ROLES.map(role => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`w-full text-left px-3 py-2.5 rounded transition-colors ${
                    selectedRole === role
                      ? "bg-[#eef0f9] border border-[#c5cbea]"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-800">{role}</span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${ROLE_COLORS[role]}`}>
                      {role === "Super Admin" ? "All" : `${Object.values(matrix[role]).reduce((s, m) => s + Object.values(m).filter(Boolean).length, 0)}/${MODULES.length * ALL_ACTIONS.length}`}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{ROLE_DESCRIPTIONS[role]}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Role summary */}
          <div className="p-3">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
              {selectedRole} — Summary
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Permissions granted</span>
                <span className="font-mono font-semibold text-[#253580]">{totalGranted} / {totalPossible}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ background: "#253580", width: `${(totalGranted / totalPossible) * 100}%` }} />
              </div>
              {selectedRole === "Super Admin" && (
                <p className="text-[10px] text-slate-400 mt-2">Super Admin permissions are system-defined and cannot be modified.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Permissions matrix */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 bg-white border-b border-slate-200 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider w-44">Module</th>
                {ALL_ACTIONS.map(action => (
                  <th key={action} className="px-4 py-3 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider capitalize">
                    {action}
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider">All</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MODULES.map((mod, i) => {
                const modPerms = perms[mod.key];
                const allOn = ALL_ACTIONS.every(a => modPerms[a]);
                const anyOn = ALL_ACTIONS.some(a => modPerms[a]);
                const isSuperAdmin = selectedRole === "Super Admin";

                return (
                  <tr key={mod.key} className={`${i % 2 === 0 ? "bg-white" : "bg-slate-50/40"} hover:bg-[#f5f7ff] transition-colors`}>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      <div>{mod.module}</div>
                      {anyOn && !allOn && (
                        <div className="text-[10px] text-slate-400 font-normal">
                          {ALL_ACTIONS.filter(a => modPerms[a]).join(", ")}
                        </div>
                      )}
                    </td>
                    {ALL_ACTIONS.map(action => (
                      <td key={action} className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggle(selectedRole, mod.key, action)}
                          disabled={isSuperAdmin}
                          className={`w-5 h-5 rounded flex items-center justify-center mx-auto transition-all ${
                            modPerms[action]
                              ? "text-white"
                              : "bg-slate-100 text-slate-300"
                          } ${isSuperAdmin ? "cursor-not-allowed opacity-80" : "hover:scale-110 cursor-pointer"}`}
                          style={modPerms[action] ? { background: "#253580" } : {}}
                          title={`${modPerms[action] ? "Revoke" : "Grant"} ${action} on ${mod.module}`}
                        >
                          {modPerms[action] ? (
                            <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          ) : (
                            <svg width="8" height="8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          )}
                        </button>
                      </td>
                    ))}
                    {/* Toggle all */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => {
                          if (isSuperAdmin) return;
                          ALL_ACTIONS.forEach(a => {
                            setMatrix(prev => ({
                              ...prev,
                              [selectedRole]: {
                                ...prev[selectedRole],
                                [mod.key]: {
                                  ...prev[selectedRole][mod.key],
                                  [a]: !allOn,
                                },
                              },
                            }));
                          });
                          setHasChanges(true);
                          setSaved(false);
                        }}
                        disabled={isSuperAdmin}
                        className={`text-[10px] font-medium px-2 py-0.5 rounded border transition-colors ${
                          allOn
                            ? "bg-[#eef0f9] text-[#253580] border-[#c5cbea] hover:bg-[#dce0f5]"
                            : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                        } ${isSuperAdmin ? "cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        {allOn ? "All ✓" : "Grant all"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Legend */}
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center gap-6 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded flex items-center justify-center" style={{ background: "#253580" }}>
                <svg width="8" height="8" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}><path d="M20 6L9 17l-5-5"/></svg>
              </span>
              Permission granted
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-slate-100 flex items-center justify-center">
                <svg width="6" height="6" fill="none" viewBox="0 0 24 24" stroke="#cbd5e1" strokeWidth={2.5}><path d="M18 6L6 18M6 6l12 12"/></svg>
              </span>
              Permission denied
            </span>
            <span className="ml-auto text-slate-400">
              Click any cell to toggle · Changes apply on save
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
