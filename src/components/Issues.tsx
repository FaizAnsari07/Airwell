import { useState } from "react";
import { leads } from "../data/crmData";
import { USERS } from "../data/usersData";
import type { User } from "../data/usersData";
import { useAppData } from "../context/AppDataContext";
import type { AppIssue, IssueStatus } from "../context/AppDataContext";
import { formatDate } from "../utils/formatDate";

const STATUS_TABS: IssueStatus[] = ["Open", "Assigned", "In Progress", "Resolved"];

const STATUS_STYLE: Record<IssueStatus, string> = {
  Open: "bg-red-50 text-red-700",
  Assigned: "bg-amber-50 text-amber-700",
  "In Progress": "bg-blue-50 text-blue-700",
  Resolved: "bg-green-50 text-green-700",
};

const PRIORITY_STYLE: Record<AppIssue["priority"], string> = {
  High: "text-red-600",
  Medium: "text-amber-600",
  Low: "text-slate-500",
};

export default function Issues({ onLeadClick }: { onLeadClick: (id: string) => void }) {
  const { currentUser, issues, addIssue, updateIssueStatus } = useAppData();
  const [filter, setFilter] = useState<"All" | IssueStatus>("All");
  const [showLog, setShowLog] = useState(false);

  const filtered = filter === "All" ? issues : issues.filter((i) => i.status === filter);

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
          <h1 className="text-sm font-semibold text-slate-900">Issues</h1>
          <p className="text-[11px] text-slate-400">
            Field-reported issues from site work and client visits — same reports filed from the mobile app
          </p>
        </div>
        <button
          onClick={() => setShowLog(true)}
          className="text-xs font-semibold text-white px-3 py-1.5 rounded"
          style={{ background: "#253580" }}
        >
          + Log Issue
        </button>
      </div>

      <div className="flex gap-1.5">
        {(["All", ...STATUS_TABS] as const).map((s) => {
          const count = s === "All" ? issues.length : issues.filter((i) => i.status === s).length;
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
              {["Category", "Description", "Project", "Owner", "Priority", "Due Date", "Reported By", "Status"].map((h) => (
                <th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((i) => {
              const owner = userFor(i.ownerId);
              const reportedBy = userFor(i.reportedById);
              return (
                <tr key={i.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{i.category}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-[280px]">{i.description}</td>
                  <td className="px-4 py-3">
                    {i.leadId ? (
                      <button onClick={() => onLeadClick(i.leadId!)} className="text-slate-600 hover:text-blue-700 hover:underline text-left">
                        {projectNameFor(i.leadId)}
                      </button>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{owner?.name ?? "Unassigned"}</td>
                  <td className={`px-4 py-3 font-medium ${PRIORITY_STYLE[i.priority]}`}>{i.priority}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">{formatDate(i.dueDate)}</td>
                  <td className="px-4 py-3 text-slate-500">{reportedBy?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <select
                      value={i.status}
                      onChange={(e) => updateIssueStatus(i.id, e.target.value as IssueStatus)}
                      className={`text-[11px] font-medium px-2 py-1 rounded border-0 focus:outline-none focus:ring-1 focus:ring-blue-300 ${STATUS_STYLE[i.status]}`}
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
                <td colSpan={8} className="px-4 py-10 text-center text-slate-400">No issues in this view.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showLog && (
        <LogIssueModal
          currentUser={currentUser}
          onClose={() => setShowLog(false)}
          onLog={(issue) => {
            addIssue(issue);
            setShowLog(false);
          }}
        />
      )}
    </div>
  );
}

function LogIssueModal({
  currentUser, onClose, onLog,
}: {
  currentUser: User;
  onClose: () => void;
  onLog: (issue: Omit<AppIssue, "id" | "createdAt">) => void;
}) {
  const [leadId, setLeadId] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<AppIssue["priority"]>("Medium");
  const [ownerId, setOwnerId] = useState(USERS[0]?.id ?? "");
  const [dueDate, setDueDate] = useState("");

  const canSave = category.trim() !== "" && description.trim() !== "" && ownerId !== "" && dueDate !== "";

  function handleSave() {
    if (!canSave) return;
    onLog({
      leadId: leadId || undefined,
      category: category.trim(),
      description: description.trim(),
      priority,
      status: "Open",
      ownerId,
      dueDate,
      reportedById: currentUser.id,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900">Log Issue</h3>
        </div>
        <div className="p-5 space-y-3">
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
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Category</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs resize-none focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Owner</label>
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400"
            >
              {USERS.map((u) => (
                <option key={u.id} value={u.id}>{u.name} · {u.role}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as AppIssue["priority"])}
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
            Log Issue
          </button>
        </div>
      </div>
    </div>
  );
}
