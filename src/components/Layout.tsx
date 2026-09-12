import { ReactNode, useState } from "react";
import airwellLogo from "./Airwell-Logo.webp";
import { useAppData } from "../context/AppDataContext";

export type NavPage =
  | "dashboard" | "leads" | "pipeline" | "projects" | "followups"
  | "sales-performance" | "monthly-review" | "employee-tracking"
  | "user-management" | "access-management"
  | "reports" | "settings";

interface LayoutProps {
  children: ReactNode;
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
}

function UsersIcon() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
function GridIcon_() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  );
}
function LeadsIcon_() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function PipelineIcon_() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
    </svg>
  );
}
function ProjectsIcon_() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    </svg>
  );
}
function FollowIcon_() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.82 12"/>
      <path d="M16 2a4 4 0 0 1 0 8"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
function PerfIcon_() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  );
}
function ReviewIcon_() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  );
}
function ReportsIcon_() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  );
}
function SettingsIcon_() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}
function LocationIcon_() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { id: "dashboard", icon: <GridIcon_ />, label: "Dashboard" },
    ],
  },
  {
    label: "CRM",
    items: [
      { id: "leads",     icon: <LeadsIcon_ />,    label: "Leads" },
      { id: "pipeline",  icon: <PipelineIcon_ />, label: "Pipeline" },
      { id: "projects",  icon: <ProjectsIcon_ />, label: "Projects" },
      { id: "followups", icon: <FollowIcon_ />,   label: "Follow-ups", badge: 7 },
    ],
  },
  {
    label: "Field",
    items: [
      { id: "employee-tracking", icon: <LocationIcon_ />, label: "Employee Tracking", badge: 5 },
    ],
  },
  {
    label: "Reports",
    items: [
      { id: "sales-performance", icon: <PerfIcon_ />,    label: "Sales Performance" },
      { id: "monthly-review",    icon: <ReviewIcon_ />,  label: "Monthly Review" },
      { id: "reports",           icon: <ReportsIcon_ />, label: "Reports" },
    ],
  },
  {
    label: "Admin",
    items: [
      { id: "user-management",   icon: <UsersIcon />,    label: "User Management" },
      { id: "access-management", icon: <ShieldIcon />,   label: "Access Management" },
      { id: "settings",          icon: <SettingsIcon_ />, label: "Settings" },
    ],
  },
];

export default function Layout({ children, activePage, onNavigate }: LayoutProps) {
  const { currentUser, notificationsForCurrentUser, markNotificationRead } = useAppData();
  const [searchQuery, setSearchQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const notifications = notificationsForCurrentUser();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex h-full bg-slate-100 overflow-hidden">
      {/* Sidebar */}
      {sidebarOpen && (
      <aside className="w-56 flex-shrink-0 flex flex-col text-slate-300 overflow-y-auto" style={{ background: "#0D1550" }}>
        {/* Logo */}
        <div className="px-4 py-4 border-b border-white/10 flex flex-col items-center text-center">
          <img
            src={airwellLogo}
            alt="STAR Airwell"
            className="h-16 w-auto rounded"
            style={{ background: "white", padding: "6px 10px", borderRadius: 6 }}
          />
          <div className="text-[10px] mt-2 font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>CRM Platform</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <div className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
                {section.label}
              </div>
              {section.items.map((item) => {
                const active = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id as NavPage)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded text-sm font-medium transition-colors mb-0.5`}
                    style={active
                      ? { background: "#39B849", color: "#fff" }
                      : { color: "rgba(255,255,255,0.55)" }
                    }
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                    onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)"; } }}
                  >
                    <span className="flex-shrink-0 opacity-80">
                      {item.icon}
                    </span>
                    <span className="flex-1 text-left">{item.label}</span>
                    {"badge" in item && item.badge ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#39B849", color: "#fff" }}>
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: "#39B849" }}>
              SM
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-medium truncate">Sales Manager</div>
              <div className="text-slate-500 text-[10px] truncate">admin@starairwell.com</div>
            </div>
          </div>
        </div>
      </aside>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center h-12 bg-white border-b border-slate-200 px-5 gap-4 flex-shrink-0">
          {/* Sidebar toggle */}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-500 flex-shrink-0"
          >
            <MenuIcon className="w-4 h-4" />
          </button>

          {/* Search */}
          <div className="relative w-72">
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search leads, projects, clients…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
            />
          </div>

          <div className="flex-1" />

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-500"
            >
              <BellIcon className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-10 w-80 bg-white rounded-md shadow-xl border border-slate-200 z-50 max-h-96 overflow-y-auto">
                <div className="px-3 py-2 border-b border-slate-100 text-xs font-semibold text-slate-700">
                  Notifications {unreadCount > 0 && <span className="text-red-500">({unreadCount} new)</span>}
                </div>
                {notifications.length === 0 && (
                  <div className="px-3 py-6 text-center text-xs text-slate-400">No notifications yet</div>
                )}
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`w-full text-left px-3 py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50 ${n.read ? "opacity-60" : ""}`}
                  >
                    <div className="text-xs text-slate-700">{n.message}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{n.date}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: currentUser.color }}>
            {currentUser.initials}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
