import { useState } from "react";

type Role = "Super Admin" | "Sales Manager" | "Sales Engineer" | "Field Support" | "Viewer";
type UserStatus = "Active" | "Inactive" | "Suspended" | "Invited";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  department: string;
  status: UserStatus;
  lastLogin: string;
  createdAt: string;
  locationSharing: boolean;
  initials: string;
  color: string;
  managerId?: string;
  targetAmount?: number;
}

const USERS: User[] = [
  { id: "U001", name: "Sunil Mehta", email: "sunil.mehta@starairwell.com", phone: "+91 98765 00001", role: "Super Admin", department: "Management", status: "Active", lastLogin: "2026-08-31 09:12", createdAt: "2024-01-15", locationSharing: false, initials: "SM", color: "#253580" },
  { id: "U002", name: "Anita Rao", email: "anita.rao@starairwell.com", phone: "+91 98765 00002", role: "Sales Manager", department: "Sales", status: "Active", lastLogin: "2026-08-31 08:45", createdAt: "2024-03-10", locationSharing: false, initials: "AR", color: "#3D50A0", targetAmount: 500 },
  { id: "U003", name: "Rajan Mehta", email: "rajan.mehta@starairwell.com", phone: "+91 98765 43210", role: "Sales Engineer", department: "Sales", status: "Active", lastLogin: "2026-08-31 08:50", createdAt: "2024-04-01", locationSharing: true, initials: "RM", color: "#253580", managerId: "U002", targetAmount: 180 },
  { id: "U004", name: "Priya Desai", email: "priya.desai@starairwell.com", phone: "+91 87654 32109", role: "Sales Engineer", department: "Sales", status: "Active", lastLogin: "2026-08-31 08:30", createdAt: "2024-04-01", locationSharing: true, initials: "PD", color: "#39B849", managerId: "U002", targetAmount: 180 },
  { id: "U005", name: "Amit Kulkarni", email: "amit.kulkarni@starairwell.com", phone: "+91 76543 21098", role: "Sales Engineer", department: "Sales", status: "Active", lastLogin: "2026-08-30 17:22", createdAt: "2024-05-15", locationSharing: true, initials: "AK", color: "#7C3AED", managerId: "U002", targetAmount: 160 },
  { id: "U006", name: "Suresh Pillai", email: "suresh.pillai@starairwell.com", phone: "+91 65432 10987", role: "Sales Engineer", department: "Sales", status: "Active", lastLogin: "2026-08-31 09:00", createdAt: "2024-05-15", locationSharing: true, initials: "SP", color: "#D97706", managerId: "U002", targetAmount: 160 },
  { id: "U007", name: "Deepak Verma", email: "deepak.verma@starairwell.com", phone: "+91 54321 09876", role: "Sales Engineer", department: "Sales", status: "Active", lastLogin: "2026-08-31 07:55", createdAt: "2024-06-01", locationSharing: true, initials: "DV", color: "#DC2626", managerId: "U002", targetAmount: 150 },
  { id: "U008", name: "Kavya Sharma", email: "kavya.sharma@starairwell.com", phone: "+91 43210 98765", role: "Field Support", department: "Service", status: "Active", lastLogin: "2026-08-31 07:30", createdAt: "2024-07-01", locationSharing: true, initials: "KS", color: "#0891B2", managerId: "U002" },
  { id: "U009", name: "Nikhil Patil", email: "nikhil.patil@starairwell.com", phone: "+91 32109 87654", role: "Field Support", department: "Service", status: "Inactive", lastLogin: "2026-08-25 16:00", createdAt: "2024-07-15", locationSharing: false, initials: "NP", color: "#64748B", managerId: "U002" },
  { id: "U010", name: "Meera Joshi", email: "meera.joshi@starairwell.com", phone: "+91 21098 76543", role: "Viewer", department: "Finance", status: "Invited", lastLogin: "Never", createdAt: "2026-08-28", locationSharing: false, initials: "MJ", color: "#9333EA" },
];

const ROLE_COLORS: Record<Role, string> = {
  "Super Admin":    "bg-red-50 text-red-700 border-red-200",
  "Sales Manager":  "bg-[#eef0f9] text-[#253580] border-[#c5cbea]",
  "Sales Engineer": "bg-blue-50 text-blue-700 border-blue-200",
  "Field Support":  "bg-cyan-50 text-cyan-700 border-cyan-200",
  "Viewer":         "bg-slate-100 text-slate-600 border-slate-200",
};

const STATUS_COLORS: Record<UserStatus, string> = {
  "Active":    "bg-green-50 text-green-700",
  "Inactive":  "bg-slate-100 text-slate-500",
  "Suspended": "bg-red-50 text-red-600",
  "Invited":   "bg-amber-50 text-amber-700",
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(USERS);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<Role | "">("");
  const [filterStatus, setFilterStatus] = useState<UserStatus | "">("");
  const [selected, setSelected] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");

  const filtered = users.filter(u => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterRole && u.role !== filterRole) return false;
    if (filterStatus && u.status !== filterStatus) return false;
    return true;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === "Active").length,
    invited: users.filter(u => u.status === "Invited").length,
    locationOn: users.filter(u => u.locationSharing).length,
  };

  function openAdd() { setModalMode("add"); setSelected(null); setShowModal(true); }
  function openEdit(u: User) { setModalMode("edit"); setSelected(u); setShowModal(true); }

  function toggleStatus(id: string) {
    setUsers(prev => prev.map(u => u.id === id
      ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" }
      : u
    ));
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-5 py-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-sm font-semibold text-slate-900">User Management</h1>
            <p className="text-[11px] text-slate-400">Manage CRM users, roles, and account status</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded"
            style={{ background: "#253580" }}
          >
            + Invite User
          </button>
        </div>

        {/* Stats strip */}
        <div className="flex gap-6">
          {[
            { label: "Total Users", value: stats.total, color: "text-[#253580]" },
            { label: "Active", value: stats.active, color: "text-green-600" },
            { label: "Invited", value: stats.invited, color: "text-amber-600" },
            { label: "Location Sharing On", value: stats.locationOn, color: "text-blue-600" },
          ].map(s => (
            <div key={s.label} className="flex items-baseline gap-2">
              <span className={`font-mono text-xl font-bold ${s.color}`}>{s.value}</span>
              <span className="text-[11px] text-slate-400">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 px-5 py-2.5 flex items-center gap-3 flex-shrink-0">
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded bg-slate-50 w-52 focus:outline-none focus:border-blue-400" />
        </div>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value as Role | "")}
          className="text-xs border border-slate-200 rounded px-2 py-1.5 bg-slate-50 focus:outline-none">
          <option value="">All Roles</option>
          {(["Super Admin","Sales Manager","Sales Engineer","Field Support","Viewer"] as Role[]).map(r => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as UserStatus | "")}
          className="text-xs border border-slate-200 rounded px-2 py-1.5 bg-slate-50 focus:outline-none">
          <option value="">All Status</option>
          {(["Active","Inactive","Suspended","Invited"] as UserStatus[]).map(s => (
            <option key={s}>{s}</option>
          ))}
        </select>
        {(filterRole || filterStatus || search) && (
          <button onClick={() => { setFilterRole(""); setFilterStatus(""); setSearch(""); }}
            className="text-xs text-[#253580] hover:underline">Clear</button>
        )}
        <span className="ml-auto text-xs text-slate-400">{filtered.length} users</span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
            <tr>
              {["User", "Role", "Department", "Status", "Location Sharing", "Last Login", "Created", "Actions"].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: u.color }}>
                      {u.initials}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${ROLE_COLORS[u.role]}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{u.department}</td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${STATUS_COLORS[u.status]}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setUsers(prev => prev.map(p => p.id === u.id ? { ...p, locationSharing: !p.locationSharing } : p))}
                    className={`w-9 h-5 rounded-full transition-colors relative ${u.locationSharing ? "bg-[#39B849]" : "bg-slate-200"}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${u.locationSharing ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </td>
                <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">{u.lastLogin}</td>
                <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">{u.createdAt}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(u)} className="text-[11px] text-[#253580] font-medium hover:underline">Edit</button>
                    <span className="text-slate-200">|</span>
                    <button onClick={() => toggleStatus(u.id)}
                      className={`text-[11px] font-medium hover:underline ${u.status === "Active" ? "text-red-500" : "text-green-600"}`}>
                      {u.status === "Active" ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && <UserModal mode={modalMode} user={selected} users={users} onClose={() => setShowModal(false)} />}
    </div>
  );
}

function UserModal({ mode, user, users, onClose }: { mode: "add" | "edit"; user: User | null; users: User[]; onClose: () => void }) {
  const managers = users.filter((u) => u.role === "Sales Manager");

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">{mode === "add" ? "Invite New User" : "Edit User"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-lg leading-none">×</button>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4">
          {[
            { label: "Full Name", type: "text", defaultValue: user?.name ?? "", span: 2 },
            { label: "Email Address", type: "email", defaultValue: user?.email ?? "" },
            { label: "Phone", type: "tel", defaultValue: user?.phone ?? "" },
          ].map(f => (
            <div key={f.label} className={f.span === 2 ? "col-span-2" : ""}>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">{f.label}</label>
              <input type={f.type} defaultValue={f.defaultValue}
                className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400" />
            </div>
          ))}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Role</label>
            <select defaultValue={user?.role ?? "Sales Engineer"}
              className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400">
              {["Super Admin","Sales Manager","Sales Engineer","Field Support","Viewer"].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Department</label>
            <select defaultValue={user?.department ?? "Sales"}
              className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400">
              {["Management","Sales","Service","Finance","Operations"].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Reports to</label>
            <select defaultValue={user?.managerId ?? ""}
              className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400">
              <option value="">— None —</option>
              {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Target Amount (₹ Lakhs)</label>
            <input type="number" defaultValue={user?.targetAmount ?? ""}
              className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400" />
          </div>
          <div className="col-span-2 flex items-center gap-3 p-3 bg-slate-50 rounded border border-slate-200">
            <div className="flex-1">
              <div className="text-xs font-medium text-slate-700">Location Sharing</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Allow this user's location to be visible to managers</div>
            </div>
            <div className={`w-9 h-5 rounded-full cursor-pointer relative ${user?.locationSharing ? "bg-[#39B849]" : "bg-slate-200"}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${user?.locationSharing ? "translate-x-4" : "translate-x-0.5"}`} />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-200">
          <button onClick={onClose} className="px-4 py-1.5 text-xs text-slate-600 border border-slate-200 rounded hover:bg-slate-50">Cancel</button>
          <button className="px-4 py-1.5 text-xs font-semibold text-white rounded" style={{ background: "#253580" }}>
            {mode === "add" ? "Send Invite" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
