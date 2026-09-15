import { useState } from "react";
import { useAppData } from "../context/AppDataContext";
import { formatDate } from "../utils/formatDate";

export default function Notifications({ onLeadClick }: { onLeadClick: (id: string) => void }) {
  const { notificationsForCurrentUser, markNotificationRead, markAllNotificationsRead } = useAppData();
  const [filter, setFilter] = useState<"All" | "Unread">("All");

  const all = notificationsForCurrentUser();
  const unreadCount = all.filter((n) => !n.read).length;
  const list = filter === "Unread" ? all.filter((n) => !n.read) : all;

  function handleOpen(id: string, read: boolean, leadId?: string) {
    if (!read) markNotificationRead(id);
    if (leadId) onLeadClick(leadId);
  }

  return (
    <div className="p-5 space-y-4 max-w-[900px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-slate-900">Notifications</h1>
          <p className="text-[11px] text-slate-400">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="text-xs font-semibold text-slate-600 px-3 py-1.5 rounded border border-slate-200 hover:bg-slate-50"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex gap-1.5">
        {(["All", "Unread"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[11px] font-medium px-3 py-1.5 rounded transition-colors ${
              filter === f
                ? "text-white"
                : "text-slate-500 bg-slate-50 border border-slate-200 hover:bg-slate-100"
            }`}
            style={filter === f ? { background: "#253580" } : {}}
          >
            {f} {f === "Unread" && unreadCount > 0 ? `(${unreadCount})` : ""}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
        {list.length === 0 ? (
          <div className="px-4 py-14 text-center">
            <div className="text-3xl mb-2">🔔</div>
            <div className="text-xs text-slate-400">
              {filter === "Unread" ? "No unread notifications." : "No notifications yet."}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {list.map((n) => (
              <button
                key={n.id}
                onClick={() => handleOpen(n.id, n.read, n.leadId)}
                className={`w-full text-left px-4 py-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors ${
                  n.leadId ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <span
                  className={`mt-1.5 size-2 rounded-full flex-shrink-0 ${n.read ? "bg-slate-200" : "bg-blue-500"}`}
                />
                <div className="min-w-0 flex-1">
                  <div className={`text-xs leading-relaxed ${n.read ? "text-slate-500" : "text-slate-800 font-medium"}`}>
                    {n.message}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <span>{formatDate(n.date)}</span>
                    {n.leadId && <span className="text-blue-600 font-sans font-semibold">View project →</span>}
                  </div>
                </div>
                {!n.read && (
                  <span className="text-[9px] font-bold uppercase tracking-wide text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded flex-shrink-0">
                    New
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
