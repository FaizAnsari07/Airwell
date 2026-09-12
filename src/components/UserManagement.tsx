import { useState } from "react";
import { USERS, ROLE_COLORS, STATUS_COLORS, visibleUsersFor } from "../data/usersData";
import type { Role, UserStatus, User } from "../data/usersData";
import { useAppData } from "../context/AppDataContext";

export default function UserManagement() {
  const { currentUser } = useAppData();
  const [users, setUsers] = useState<User[]>(USERS);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<Role | "">("");
  const [filterStatus, setFilterStatus] = useState<UserStatus | "">("");
  const [selected, setSelected] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [teamManager, setTeamManager] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  const visibleUsers = visibleUsersFor(currentUser, users);

  const filtered = visibleUsers.filter(u => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterRole && u.role !== filterRole) return false;
    if (filterStatus && u.status !== filterStatus) return false;
    return true;
  });

  const stats = {
    total: visibleUsers.length,
    active: visibleUsers.filter(u => u.status === "Active").length,
    invited: visibleUsers.filter(u => u.status === "Invited").length,
    locationOn: visibleUsers.filter(u => u.locationSharing).length,
  };

  function openAdd() { setModalMode("add"); setSelected(null); setShowModal(true); }
  function openEdit(u: User) { setModalMode("edit"); setSelected(u); setShowModal(true); }

  function handleRowClick(u: User) {
    if (u.role === "Sales Manager") {
      setTeamManager(u);
    } else {
      setViewingUser(u);
    }
  }

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
          {(["Super Admin","Sales Manager","Sales Engineer","Site Engineer","Field Support","Viewer"] as Role[]).map(r => (
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
              <tr key={u.id} onClick={() => handleRowClick(u)} className="hover:bg-slate-50 transition-colors cursor-pointer">
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
                <td className="px-4 py-3 text-slate-500">{u.role === "Super Admin" ? "—" : u.department}</td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${STATUS_COLORS[u.status]}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setUsers(prev => prev.map(p => p.id === u.id ? { ...p, locationSharing: !p.locationSharing } : p))}
                    className={`w-9 h-5 rounded-full transition-colors relative ${u.locationSharing ? "bg-[#39B849]" : "bg-slate-200"}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${u.locationSharing ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </td>
                <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">{u.lastLogin}</td>
                <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">{u.createdAt}</td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
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

      {teamManager && (
        <TeamModal
          manager={teamManager}
          staff={users.filter((u) => u.managerId === teamManager.id)}
          onClose={() => setTeamManager(null)}
          onSelectStaff={(staffUser) => { setTeamManager(null); setViewingUser(staffUser); }}
        />
      )}

      {viewingUser && (
        <UserDetailModal
          user={viewingUser}
          manager={users.find((u) => u.id === viewingUser.managerId)}
          onClose={() => setViewingUser(null)}
          onEdit={() => { setViewingUser(null); openEdit(viewingUser); }}
        />
      )}
    </div>
  );
}

function TeamModal({
  manager, staff, onClose, onSelectStaff,
}: {
  manager: User;
  staff: User[];
  onClose: () => void;
  onSelectStaff: (u: User) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{manager.name}'s Team</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">{staff.length} staff member{staff.length === 1 ? "" : "s"}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-lg leading-none">×</button>
        </div>
        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
          {staff.length === 0 && (
            <div className="px-5 py-8 text-center text-xs text-slate-400">No staff assigned to this manager yet.</div>
          )}
          {staff.map((u) => (
            <button
              key={u.id}
              onClick={() => onSelectStaff(u)}
              className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 text-left"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: u.color }}>
                {u.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-slate-900 truncate">{u.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{u.role} · {u.email}</div>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded flex-shrink-0 ${STATUS_COLORS[u.status]}`}>{u.status}</span>
            </button>
          ))}
        </div>
        <div className="flex justify-end px-5 py-4 border-t border-slate-200">
          <button onClick={onClose} className="px-4 py-1.5 text-xs text-slate-600 border border-slate-200 rounded hover:bg-slate-50">Close</button>
        </div>
      </div>
    </div>
  );
}

function UserDetailModal({
  user, manager, onClose, onEdit,
}: {
  user: User;
  manager: User | undefined;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">User Details</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-lg leading-none">×</button>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ background: user.color }}>
              {user.initials}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">{user.name}</div>
              <span className={`inline-block mt-0.5 text-[11px] font-medium px-2 py-0.5 rounded border ${ROLE_COLORS[user.role]}`}>{user.role}</span>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <DetailRow label="Email" value={user.email} />
            <DetailRow label="Phone" value={user.phone} />
            {user.role !== "Super Admin" && <DetailRow label="Department" value={user.department} />}
            <DetailRow label="Status" value={user.status} />
            <DetailRow label="Reports To" value={manager?.name ?? "— None —"} />
            {user.targetAmount !== undefined && <DetailRow label="Target Amount" value={`₹${user.targetAmount}L`} />}
            <DetailRow label="Location Sharing" value={user.locationSharing ? "Enabled" : "Disabled"} />
            <DetailRow label="Last Login" value={user.lastLogin} />
            <DetailRow label="Created" value={user.createdAt} />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-200">
          <button onClick={onClose} className="px-4 py-1.5 text-xs text-slate-600 border border-slate-200 rounded hover:bg-slate-50">Close</button>
          <button onClick={onEdit} className="px-4 py-1.5 text-xs font-semibold text-white rounded" style={{ background: "#253580" }}>Edit</button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 py-1 border-b border-slate-50 last:border-0">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-slate-800 text-right">{value}</span>
    </div>
  );
}

function UserModal({ mode, user, users, onClose }: { mode: "add" | "edit"; user: User | null; users: User[]; onClose: () => void }) {
  const managers = users.filter((u) => u.role === "Sales Manager");
  const [role, setRole] = useState<Role>(user?.role ?? "Sales Engineer");

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
            <select value={role} onChange={(e) => setRole(e.target.value as Role)}
              className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400">
              {["Super Admin","Sales Manager","Sales Engineer","Site Engineer","Field Support","Viewer"].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          {role !== "Super Admin" && (
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Department</label>
              <select defaultValue={user?.department ?? "Sales"}
                className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400">
                {["Management","Sales","Service","Finance","Operations"].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          )}
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
