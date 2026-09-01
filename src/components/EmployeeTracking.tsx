import { useState } from "react";
import EmployeeMap, { StatusBadge } from "./EmployeeMap";
import { fieldEmployees, STATUS_STYLE, FIELD_ACTIVITY_TIMELINE } from "../data/locationData";
import type { FieldEmployee, CustomerVisit, RouteStop } from "../data/locationData";

export default function EmployeeTracking({ onLeadClick }: { onLeadClick?: (id: string) => void }) {
  const [selectedEmp, setSelectedEmp] = useState<FieldEmployee | null>(null);
  const [rightView, setRightView] = useState<"map" | "route" | "visits">("map");
  const [filterStatus, setFilterStatus] = useState("");

  const displayed = fieldEmployees.filter(e =>
    !filterStatus || e.status === filterStatus
  );

  const kpis = {
    activeToday: fieldEmployees.filter(e => e.status !== "On Leave" && e.status !== "Offline").length,
    inField: fieldEmployees.filter(e => e.status === "In Field" || e.status === "At Customer Site").length,
    totalVisits: fieldEmployees.reduce((s, e) => s + e.todayVisits, 0),
    completedVisits: fieldEmployees.reduce((s, e) => s + e.completedVisits, 0),
    atSite: fieldEmployees.filter(e => e.status === "At Customer Site").length,
    onLeave: fieldEmployees.filter(e => e.status === "On Leave").length,
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-5 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-slate-900">Employee Location Tracking</h1>
            <p className="text-[11px] text-slate-400">Real-time field activity · Aug 31, 2026 · Manager view only</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[11px] text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded font-medium">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Location sharing active
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded">
              🔒 Authorized managers only
            </span>
          </div>
        </div>

        {/* KPIs */}
        <div className="flex gap-4 mt-3">
          {[
            { label: "Active Today", value: kpis.activeToday, color: "text-[#253580]" },
            { label: "In Field", value: kpis.inField, color: "text-blue-600" },
            { label: "Customer Visits Today", value: kpis.totalVisits, color: "text-indigo-600" },
            { label: "Visits Completed", value: kpis.completedVisits, color: "text-green-600" },
            { label: "At Customer Sites", value: kpis.atSite, color: "text-purple-600" },
            { label: "On Leave", value: kpis.onLeave, color: "text-amber-600" },
          ].map(k => (
            <div key={k.label} className="flex items-baseline gap-2">
              <span className={`font-mono text-lg font-bold ${k.color}`}>{k.value}</span>
              <span className="text-[11px] text-slate-400">{k.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Employee List */}
        <div className="w-72 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-100 flex-shrink-0">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 bg-slate-50 focus:outline-none"
            >
              <option value="">All Employees ({fieldEmployees.length})</option>
              {["In Field", "At Customer Site", "In Office", "On Leave", "Offline"].map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {displayed.map(emp => {
              const isSelected = selectedEmp?.id === emp.id;
              return (
                <button
                  key={emp.id}
                  onClick={() => { setSelectedEmp(isSelected ? null : emp); setRightView("map"); }}
                  className={`w-full text-left px-3 py-3 transition-colors ${isSelected ? "bg-[#eef0f9] border-l-2 border-[#253580]" : "hover:bg-slate-50"}`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="relative flex-shrink-0">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: emp.color }}>
                        {emp.initials}
                      </div>
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${STATUS_STYLE[emp.status].dot}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-slate-900 truncate">{emp.name}</span>
                        {!emp.locationSharingEnabled && (
                          <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded flex-shrink-0">🔒 Off</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{emp.designation}</div>
                      <div className="mt-1">
                        <StatusBadge status={emp.status} />
                      </div>
                      {emp.currentActivity && (
                        <div className="text-[10px] text-slate-500 mt-1 truncate">{emp.currentActivity}</div>
                      )}
                      {emp.currentAddress && (
                        <div className="text-[10px] text-slate-400 truncate">📍 {emp.currentAddress}</div>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                        <span>🏃 {emp.distanceTravelled} km</span>
                        <span>📍 {emp.todayVisits} visits</span>
                        <span className="font-mono">{emp.lastUpdated}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Map / Route / Visits */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Sub-tab bar when employee is selected */}
          {selectedEmp && (
            <div className="bg-white border-b border-slate-200 flex items-center gap-0 flex-shrink-0 px-4">
              {([
                ["map", "📍 Live Location"],
                ["route", "🗺️ Today's Route"],
                ["visits", "📋 Customer Visits"],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setRightView(key)}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                    rightView === key ? "border-[#253580] text-[#253580]" : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {label}
                </button>
              ))}
              <div className="ml-auto pr-2 py-2">
                <EmployeeQuickActions emp={selectedEmp} onLeadClick={onLeadClick} />
              </div>
            </div>
          )}

          {/* Map view */}
          {(rightView === "map" || !selectedEmp) && (
            <div className="flex-1 relative overflow-hidden">
              <EmployeeMap
                selectedEmployeeId={selectedEmp?.id}
                onEmployeeClick={(emp) => { setSelectedEmp(emp); setRightView("map"); }}
              />
              {/* Selected employee detail card */}
              {selectedEmp && (
                <div className="absolute bottom-4 right-4 z-[1000] w-72">
                  <EmployeeDetailCard emp={selectedEmp} onLeadClick={onLeadClick} onClose={() => setSelectedEmp(null)} />
                </div>
              )}
            </div>
          )}

          {/* Route view */}
          {rightView === "route" && selectedEmp && (
            <div className="flex-1 overflow-hidden flex">
              <div className="flex-1 relative">
                <EmployeeMap
                  selectedEmployeeId={selectedEmp.id}
                  onEmployeeClick={() => {}}
                />
              </div>
              <div className="w-72 flex-shrink-0 bg-white border-l border-slate-200 overflow-y-auto p-4">
                <RouteTimeline emp={selectedEmp} />
              </div>
            </div>
          )}

          {/* Visits view */}
          {rightView === "visits" && selectedEmp && (
            <div className="flex-1 overflow-y-auto p-5">
              <VisitsList emp={selectedEmp} onLeadClick={onLeadClick} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmployeeDetailCard({ emp, onLeadClick, onClose }: {
  emp: FieldEmployee;
  onLeadClick?: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-100" style={{ background: emp.color + "12" }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: emp.color }}>
          {emp.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-900">{emp.name}</div>
          <div className="text-[11px] text-slate-500">{emp.designation} · {emp.department}</div>
          <div className="mt-1"><StatusBadge status={emp.status} /></div>
        </div>
        <button onClick={onClose} className="text-slate-300 hover:text-slate-500 text-lg leading-none flex-shrink-0">×</button>
      </div>

      <div className="p-4 space-y-2.5 text-xs">
        {emp.currentActivity && <InfoRow icon="⚡" label="Activity" value={emp.currentActivity} />}
        {emp.currentAddress && <InfoRow icon="📍" label="Location" value={emp.currentAddress} />}
        {emp.currentProjectName && <InfoRow icon="🏗️" label="Project" value={emp.currentProjectName} />}
        <InfoRow icon="🕐" label="Last update" value={emp.lastUpdated} mono />
        {emp.firstCheckIn && <InfoRow icon="🟢" label="First check-in" value={emp.firstCheckIn} mono />}
        {emp.lastCheckIn && <InfoRow icon="📌" label="Last check-in" value={emp.lastCheckIn} mono />}

        <div className="grid grid-cols-3 gap-2 pt-1">
          <StatPill label="Distance" value={`${emp.distanceTravelled}km`} />
          <StatPill label="Visits" value={String(emp.todayVisits)} />
          <StatPill label="Done" value={String(emp.completedVisits)} />
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-2 px-4 pb-4">
        <button className="text-[11px] font-medium text-white py-1.5 rounded" style={{ background: "#253580" }}>
          📞 Contact
        </button>
        {emp.currentLeadId && (
          <button
            onClick={() => onLeadClick?.(emp.currentLeadId!)}
            className="text-[11px] font-medium text-[#253580] bg-[#eef0f9] py-1.5 rounded border border-[#c5cbea]"
          >
            🔗 View Lead
          </button>
        )}
      </div>
    </div>
  );
}

function EmployeeQuickActions({ emp, onLeadClick }: { emp: FieldEmployee; onLeadClick?: (id: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <button className="text-[11px] font-medium text-white px-3 py-1 rounded" style={{ background: "#253580" }}>
        📞 {emp.phone.slice(-10, -6)}…
      </button>
      {emp.currentLeadId && (
        <button
          onClick={() => onLeadClick?.(emp.currentLeadId!)}
          className="text-[11px] font-medium px-3 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          🔗 View Lead
        </button>
      )}
    </div>
  );
}

function RouteTimeline({ emp }: { emp: FieldEmployee }) {
  return (
    <div>
      <div className="text-xs font-semibold text-slate-700 mb-4">
        Today's Route — {emp.name.split(" ")[0]}
      </div>
      <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-4">
        <span>🚗 {emp.distanceTravelled} km</span>
        <span>·</span>
        <span>📍 {emp.todayVisits} stops</span>
        {emp.firstCheckIn && <><span>·</span><span>From {emp.firstCheckIn}</span></>}
      </div>

      <div className="relative">
        <div className="absolute left-3.5 top-4 bottom-4 w-px" style={{ background: emp.color + "40" }} />
        <div className="space-y-4">
          {emp.todayRoute.map((stop, i) => {
            const isLast = i === emp.todayRoute.length - 1;
            const typeIcon = stop.type === "office" ? "🏢" : stop.type === "customer" ? "📍" : stop.type === "break" ? "☕" : "🚗";
            return (
              <div key={stop.id} className="flex gap-3">
                <div className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold flex-shrink-0 z-10" style={{
                  background: isLast ? emp.color : "#fff",
                  borderColor: emp.color,
                  color: isLast ? "#fff" : emp.color,
                }}>
                  {stop.index}
                </div>
                <div className={`flex-1 rounded border p-2.5 text-[11px] ${isLast ? "border-[#c5cbea] bg-[#eef0f9]" : "border-slate-100 bg-white"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900">{typeIcon} {stop.label}</span>
                    {isLast && !stop.departureTime && (
                      <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-medium">Current</span>
                    )}
                  </div>
                  <div className="text-slate-400 text-[10px] mt-0.5">{stop.address}</div>
                  <div className="flex items-center gap-2 mt-1 font-mono text-[10px] text-slate-500">
                    <span>In: {stop.arrivalTime}</span>
                    {stop.departureTime && <><span>·</span><span>Out: {stop.departureTime}</span></>}
                    {stop.duration && <><span>·</span><span>{stop.duration}</span></>}
                  </div>
                  {stop.purpose && <div className="text-slate-500 mt-1">{stop.purpose}</div>}
                  {stop.notes && <div className="text-slate-400 mt-0.5 italic">{stop.notes}</div>}
                  {stop.followUpRequired && (
                    <div className="mt-1 text-amber-600 text-[10px] font-medium">⚠️ Follow-up required</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function VisitsList({ emp, onLeadClick }: { emp: FieldEmployee; onLeadClick?: (id: string) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold text-slate-900">Customer Visits — {emp.name}</div>
        <div className="text-xs text-slate-400">{emp.todayVisits} visits today · {emp.completedVisits} completed</div>
      </div>

      {emp.customerVisits.length === 0 && (
        <div className="flex flex-col items-center py-16 text-slate-400">
          <div className="text-4xl mb-3">📋</div>
          <div className="text-sm">No visits today</div>
        </div>
      )}

      <div className="space-y-3">
        {emp.customerVisits.map((visit) => (
          <VisitCard key={visit.id} visit={visit} empColor={emp.color} onLeadClick={onLeadClick} />
        ))}
      </div>
    </div>
  );
}

function VisitCard({ visit, empColor, onLeadClick }: {
  visit: CustomerVisit;
  empColor: string;
  onLeadClick?: (id: string) => void;
}) {
  const statusColor = visit.status === "Completed" ? "bg-green-50 text-green-700 border-green-200" :
    visit.status === "Ongoing" ? "bg-blue-50 text-blue-700 border-blue-200" :
    "bg-red-50 text-red-700 border-red-200";

  return (
    <div className="bg-white rounded-md border border-slate-200 p-4 hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">{visit.customerName}</div>
          <div className="text-xs text-slate-500">{visit.projectName}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">📍 {visit.address}</div>
        </div>
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded border flex-shrink-0 ${statusColor}`}>
          {visit.status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 text-[11px]">
        <div>
          <div className="text-slate-400">Check-in</div>
          <div className="font-mono font-semibold text-slate-700">{visit.checkIn}</div>
        </div>
        <div>
          <div className="text-slate-400">Check-out</div>
          <div className="font-mono font-semibold text-slate-700">{visit.checkOut || "—"}</div>
        </div>
        <div>
          <div className="text-slate-400">Duration</div>
          <div className="font-mono font-semibold text-slate-700">{visit.duration || "Ongoing"}</div>
        </div>
      </div>

      <div className="mt-3 border-t border-slate-100 pt-3 space-y-1.5">
        <div className="text-[11px]">
          <span className="text-slate-400">Purpose: </span>
          <span className="text-slate-700">{visit.purpose}</span>
        </div>
        {visit.notes && (
          <div className="text-[11px] text-slate-500 italic">{visit.notes}</div>
        )}
        {visit.followUpRequired && (
          <div className="text-[11px] text-amber-600 font-medium">⚠️ Follow-up required</div>
        )}
      </div>

      {visit.leadId && (
        <button
          onClick={() => onLeadClick?.(visit.leadId!)}
          className="mt-3 w-full text-[11px] font-medium text-[#253580] bg-[#eef0f9] border border-[#c5cbea] py-1.5 rounded hover:bg-[#dce0f5] transition-colors"
        >
          🔗 View CRM Lead
        </button>
      )}
    </div>
  );
}

// Mini components
function InfoRow({ icon, label, value, mono }: { icon: string; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <span className="flex-shrink-0">{icon}</span>
      <span className="text-slate-400 flex-shrink-0">{label}</span>
      <span className={`text-slate-700 ml-auto text-right ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center bg-slate-50 rounded p-2">
      <div className="font-mono font-bold text-sm text-slate-900">{value}</div>
      <div className="text-[10px] text-slate-400">{label}</div>
    </div>
  );
}

// Export timeline for dashboard use
export function FieldActivityTimeline({ limit = 6 }: { limit?: number }) {
  const items = FIELD_ACTIVITY_TIMELINE.slice(-limit).reverse();
  const typeColor = (type: string) =>
    type === "checkin" ? "text-green-600" :
    type === "complete" ? "text-blue-600" : "text-slate-500";

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2.5 text-xs">
          <div className="font-mono text-[10px] text-slate-400 w-14 flex-shrink-0 mt-0.5">{item.time}</div>
          <div className="w-5 flex-shrink-0 text-center">{item.icon}</div>
          <div className="flex-1 min-w-0">
            <span className={`font-semibold ${typeColor(item.type)}`}>{item.employee.split(" ")[0]}</span>
            <span className="text-slate-500"> {item.event}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
