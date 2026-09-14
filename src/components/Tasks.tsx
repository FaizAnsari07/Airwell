import { useState } from "react";
import { leads } from "../data/crmData";
import { USERS, visibleUsersFor } from "../data/usersData";
import type { User } from "../data/usersData";
import { useAppData } from "../context/AppDataContext";
import type { AppTask, TaskStatus } from "../context/AppDataContext";
import { formatDate } from "../utils/formatDate";

const STATUS_TABS: TaskStatus[] = ["To Do", "In Progress", "Blocked", "Completed"];

const STATUS_STYLE: Record<TaskStatus, string> = {
  "To Do": "bg-slate-100 text-slate-700",
  "In Progress": "bg-blue-50 text-blue-700",
  "Blocked": "bg-red-50 text-red-700",
  "Completed": "bg-green-50 text-green-700",
};

const PRIORITY_STYLE: Record<AppTask["priority"], string> = {
  High: "text-red-600",
  Medium: "text-amber-600",
  Low: "text-slate-500",
};

export default function Tasks({ onLeadClick }: { onLeadClick: (id: string) => void }) {
  const { currentUser, tasks, addTask, updateTaskStatus } = useAppData();
  const [filter, setFilter] = useState<"All" | TaskStatus>("All");
  const [showAssign, setShowAssign] = useState(false);

  const canAssign = currentUser.role === "Super Admin" || currentUser.role === "Sales Manager";
  const visibleUserIds = new Set(visibleUsersFor(currentUser, USERS).map((u) => u.id));
  const visibleTasks = tasks.filter(
    (t) => visibleUserIds.has(t.assigneeId) || t.assignedById === currentUser.id
  );
  const filtered = filter === "All" ? visibleTasks : visibleTasks.filter((t) => t.status === filter);

  function userFor(id: string): User | undefined {
    return USERS.find((u) => u.id === id);
  }

  function projectNameFor(leadId?: string): string {
    if (!leadId) return "—";
    return leads.find((l) => l.id === leadId)?.projectName ?? "—";
  }

  return (
    <div className="p-5 space-y-4 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-slate-900">Tasks</h1>
          <p className="text-[11px] text-slate-400">Field work assigned across the team</p>
        </div>
        {canAssign && (
          <button
            onClick={() => setShowAssign(true)}
            className="text-xs font-semibold text-white px-3 py-1.5 rounded"
            style={{ background: "#253580" }}
          >
            + Assign Task
          </button>
        )}
      </div>

      <div className="flex gap-1.5">
        {(["All", ...STATUS_TABS] as const).map((s) => {
          const count = s === "All" ? visibleTasks.length : visibleTasks.filter((t) => t.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-[11px] font-medium px-3 py-1.5 rounded transition-colors ${
                filter === s
                  ? "text-white"
                  : "text-slate-500 bg-slate-50 border border-slate-200 hover:bg-slate-100"
              }`}
              style={filter === s ? { background: "#253580" } : {}}
            >
              {s} <span className="opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Task", "Project", "Assignee", "Priority", "Due Date", "Assigned By", "Status"].map((h) => (
                <th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((t) => {
              const assignee = userFor(t.assigneeId);
              const assignedBy = userFor(t.assignedById);
              return (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{t.title}</td>
                  <td className="px-4 py-3">
                    {t.leadId ? (
                      <button onClick={() => onLeadClick(t.leadId!)} className="text-slate-600 hover:text-blue-700 hover:underline text-left">
                        {projectNameFor(t.leadId)}
                      </button>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{assignee?.name ?? "Unassigned"}</td>
                  <td className={`px-4 py-3 font-medium ${PRIORITY_STYLE[t.priority]}`}>{t.priority}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">{formatDate(t.dueDate)}</td>
                  <td className="px-4 py-3 text-slate-500">{assignedBy?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <select
                      value={t.status}
                      onChange={(e) => updateTaskStatus(t.id, e.target.value as TaskStatus)}
                      className={`text-[11px] font-medium px-2 py-1 rounded border-0 focus:outline-none focus:ring-1 focus:ring-blue-300 ${STATUS_STYLE[t.status]}`}
                    >
                      {STATUS_TABS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400">No tasks in this view.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAssign && (
        <AssignTaskModal
          currentUser={currentUser}
          onClose={() => setShowAssign(false)}
          onAssign={(task) => {
            addTask(task);
            setShowAssign(false);
          }}
        />
      )}
    </div>
  );
}

function AssignTaskModal({
  currentUser, onClose, onAssign,
}: {
  currentUser: User;
  onClose: () => void;
  onAssign: (task: Omit<AppTask, "id" | "createdAt">) => void;
}) {
  const assignableUsers = visibleUsersFor(currentUser, USERS).filter((u) => u.id !== currentUser.id);
  const [title, setTitle] = useState("");
  const [leadId, setLeadId] = useState("");
  const [assigneeId, setAssigneeId] = useState(assignableUsers[0]?.id ?? "");
  const [priority, setPriority] = useState<AppTask["priority"]>("Medium");
  const [dueDate, setDueDate] = useState("");

  const canSave = title.trim() !== "" && assigneeId !== "" && dueDate !== "";

  function handleSave() {
    if (!canSave) return;
    onAssign({
      title: title.trim(),
      leadId: leadId || undefined,
      assigneeId,
      assignedById: currentUser.id,
      priority,
      dueDate,
      status: "To Do",
    });
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900">Assign Task</h3>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Task Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Project (optional)</label>
            <select
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400"
            >
              <option value="">No specific project</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>{l.projectName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Assign To</label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400"
            >
              {assignableUsers.length === 0 && <option value="">No team members available</option>}
              {assignableUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.name} · {u.role}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as AppTask["priority"])}
                className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-200">
          <button onClick={onClose} className="px-4 py-1.5 text-xs text-slate-600 border border-slate-200 rounded hover:bg-slate-50">Cancel</button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="px-4 py-1.5 text-xs font-semibold text-white rounded disabled:opacity-40"
            style={{ background: "#253580" }}
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}
