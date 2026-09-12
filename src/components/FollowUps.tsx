import { useState } from "react";
import { leads, STATUS_CONFIG } from "../data/crmData";
import type { Lead } from "../data/crmData";
import { formatDate } from "../utils/formatDate";

const TODAY = "2026-08-31";

function classifyFollowUp(lead: Lead) {
  if (!lead.nextFollowUp || lead.status === "Won" || lead.status === "Lost") return null;
  if (lead.nextFollowUp < TODAY) return "overdue";
  if (lead.nextFollowUp === TODAY) return "today";
  if (lead.nextFollowUp <= "2026-09-07") return "upcoming";
  return "future";
}

export default function FollowUps({ onLeadClick }: { onLeadClick: (id: string) => void }) {
  const [activeFilter, setActiveFilter] = useState<"all" | "today" | "overdue" | "upcoming" | "no-activity">("all");

  const today = leads.filter(l => classifyFollowUp(l) === "today");
  const overdue = leads.filter(l => classifyFollowUp(l) === "overdue");
  const upcoming = leads.filter(l => classifyFollowUp(l) === "upcoming");
  const noActivity = leads.filter(l => {
    if (l.status === "Won" || l.status === "Lost") return false;
    return l.lastActivity < "2026-08-24";
  });
  const highPriority = leads.filter(l => l.valueLakhs >= 45 && l.status !== "Won" && l.status !== "Lost");

  const getList = () => {
    if (activeFilter === "today") return today;
    if (activeFilter === "overdue") return overdue;
    if (activeFilter === "upcoming") return upcoming;
    if (activeFilter === "no-activity") return noActivity;
    return [...overdue, ...today, ...upcoming];
  };

  const list = getList();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-5 py-3 flex-shrink-0">
        <h1 className="text-sm font-semibold text-slate-900">Follow-up Center</h1>
        <p className="text-[11px] text-slate-400">Aug 31, 2026 — Manage all your pending follow-ups</p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border-b border-slate-200 px-5 flex items-center gap-2 py-2 flex-shrink-0">
        {([
          ["all", "All Active", overdue.length + today.length + upcoming.length, ""],
          ["overdue", "Overdue", overdue.length, "text-red-600 bg-red-50 border-red-200"],
          ["today", "Today", today.length, "text-amber-600 bg-amber-50 border-amber-200"],
          ["upcoming", "This Week", upcoming.length, "text-blue-600 bg-blue-50 border-blue-200"],
          ["no-activity", "No Activity 7d+", noActivity.length, "text-slate-600 bg-slate-100 border-slate-200"],
        ] as [typeof activeFilter, string, number, string][]).map(([key, label, count, badgeCls]) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeFilter === key
                ? "text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
            style={activeFilter === key ? { background: "#253580" } : {}}
          >
            {label}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${activeFilter === key ? "bg-white/20 border-white/20 text-white" : badgeCls || "bg-slate-100 border-slate-200"}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Main List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          {list.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="text-5xl mb-3">✅</div>
              <div className="text-sm font-medium">All clear!</div>
              <div className="text-xs mt-1">No follow-ups in this category</div>
            </div>
          )}

          {list.map((lead) => {
            const cls = classifyFollowUp(lead);
            const isOverdue = cls === "overdue";
            const isToday = cls === "today";
            const isNoActivity = activeFilter === "no-activity";

            return (
              <div
                key={lead.id}
                className={`bg-white rounded-md border transition-colors hover:border-slate-300 ${
                  isOverdue ? "border-red-200" : isToday ? "border-amber-200" : "border-slate-200"
                }`}
              >
                <div className="flex items-start gap-4 p-4">
                  {/* Priority indicator */}
                  <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${
                    isOverdue ? "bg-red-500" : isToday ? "bg-amber-400" : "bg-blue-400"
                  }`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => onLeadClick(lead.id)}
                          className="text-sm font-semibold text-slate-900 hover:text-blue-700 text-left truncate block"
                        >
                          {lead.projectName}
                        </button>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                          <span>{lead.clientName}</span>
                          <span>·</span>
                          <span>{lead.salesEngineer}</span>
                          <span>·</span>
                          <span>{lead.location}</span>
                          <span>·</span>
                          <span className="font-mono font-semibold text-slate-700">₹{lead.valueLakhs}L</span>
                        </div>
                      </div>

                      <div className="flex-shrink-0 text-right">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded ${
                          isOverdue ? "bg-red-50 text-red-700 border border-red-200" :
                          isToday ? "bg-amber-50 text-amber-700 border border-amber-200" :
                          "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}>
                          {isOverdue ? "⚠️ Overdue" : isToday ? "🔔 Today" : "📅 Upcoming"}
                        </span>
                        <div className="font-mono text-xs text-slate-400 mt-1">
                          {isNoActivity ? `Last: ${formatDate(lead.lastActivity)}` : formatDate(lead.nextFollowUp)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_CONFIG[lead.status].bg} ${STATUS_CONFIG[lead.status].color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[lead.status].dot}`} />
                        {lead.status}
                      </span>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-1 ml-2">
                        <QuickAction icon="📞" label="Call" />
                        <QuickAction icon="💬" label="WhatsApp" />
                        <QuickAction icon="✉️" label="Email" />
                        <QuickAction icon="📝" label="Note" onClick={() => onLeadClick(lead.id)} />
                        <QuickAction icon="📅" label="Reschedule" />
                      </div>
                    </div>

                    {lead.remarks && (
                      <p className="text-[11px] text-slate-400 mt-2 italic">{lead.remarks}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Panel — High Priority */}
        <div className="w-64 flex-shrink-0 border-l border-slate-200 bg-white overflow-y-auto p-4">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">High-Priority Leads</div>
          <div className="space-y-2">
            {highPriority.map((l) => (
              <button
                key={l.id}
                onClick={() => onLeadClick(l.id)}
                className="w-full text-left p-3 rounded border border-slate-100 hover:border-amber-200 hover:bg-amber-50/30 transition-colors"
              >
                <div className="text-xs font-medium text-slate-800 truncate">{l.projectName}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{l.salesEngineer.split(" ")[0]}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-mono text-sm font-semibold text-slate-900">₹{l.valueLakhs}L</span>
                  <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-medium">
                    {l.probability}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, onClick }: { icon: string; label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-900 px-2 py-1 rounded border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
    >
      <span>{icon}</span>
      <span className="hidden xl:inline">{label}</span>
    </button>
  );
}
