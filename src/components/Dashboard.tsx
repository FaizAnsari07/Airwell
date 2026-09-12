import { leads, salesEngineers, monthlyData, STATUS_CONFIG } from "../data/crmData";
import { fieldEmployees } from "../data/locationData";
import { FieldActivityTimeline } from "./EmployeeTracking";
import EmployeeMap, { StatusBadge } from "./EmployeeMap";
import { formatDate } from "../utils/formatDate";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const kpiData = [
  { label: "Total Enquiries", value: "91", sub: "+12 this month", color: "text-[#253580]", bg: "bg-[#eef0f9]" },
  { label: "Active Leads", value: "68", sub: "8 high priority", color: "text-indigo-600", bg: "bg-indigo-50" },
  { label: "Booking Value", value: "₹478 L", sub: "YTD", color: "text-green-600", bg: "bg-green-50" },
  { label: "Booking Achieved", value: "₹287 L", sub: "60% of target", color: "text-green-600", bg: "bg-green-50" },
  { label: "Collection Forecast", value: "₹110 L", sub: "Sep 2026", color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Collection Achieved", value: "₹191 L", sub: "YTD", color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Billing Progress", value: "₹152 L", sub: "78% of target", color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Enquiry Gen.", value: "112", sub: "vs target 115", color: "text-slate-600", bg: "bg-slate-100" },
];

const chartData = monthlyData.slice(0, 5).map((m) => ({
  month: m.month.split(" ")[0],
  Forecast: m.bookingForecast,
  Achieved: m.bookingAchieved,
}));

const highValue = leads
  .filter((l) => l.valueLakhs >= 35 && l.status !== "Lost" && l.status !== "Won")
  .sort((a, b) => b.valueLakhs - a.valueLakhs)
  .slice(0, 5);

const upcoming = leads
  .filter((l) => l.nextFollowUp && l.status !== "Won" && l.status !== "Lost")
  .sort((a, b) => a.nextFollowUp.localeCompare(b.nextFollowUp))
  .slice(0, 6);

const recent = leads
  .slice()
  .sort((a, b) => b.lastActivity.localeCompare(a.lastActivity))
  .slice(0, 5);

const pipelineByStage = [
  "New Enquiry", "Qualified", "Site Visit", "Quotation Sent",
  "Follow-up", "Negotiation", "Booking Confirmed", "Advance Received",
].map((stage) => ({
  stage: stage.replace(" ", "\n"),
  count: leads.filter((l) => l.status === stage).length,
  value: leads.filter((l) => l.status === stage).reduce((s, l) => s + l.valueLakhs, 0),
}));

export default function Dashboard({ onLeadClick }: { onLeadClick: (id: string) => void }) {
  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Executive Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">August 2026 — FY 2026–27 Overview</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-green-50 text-green-700 rounded border border-green-200">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Live Data
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3">
        {kpiData.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-md border border-slate-200 p-4 hover:border-slate-300 transition-colors">
            <div className={`text-xs font-medium ${kpi.color} mb-1`}>{kpi.label}</div>
            <div className="font-mono text-xl font-semibold text-slate-900">{kpi.value}</div>
            <div className="text-[11px] text-slate-400 mt-1">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Booking target vs achievement */}
        <div className="col-span-2 bg-white rounded-md border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-medium text-slate-900">Booking Target vs Achievement</div>
              <div className="text-xs text-slate-400">Apr–Aug 2026 (₹ Lakhs)</div>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-blue-500 rounded-full inline-block" />Forecast</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-green-500 rounded-full inline-block" />Achieved</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barGap={4} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, border: "1px solid #E2E8F0", borderRadius: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                formatter={(v) => [`₹${v}L`, ""]}
              />
              <Bar dataKey="Forecast" fill="#BFDBFE" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Achieved" fill="#253580" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pipeline Summary */}
        <div className="bg-white rounded-md border border-slate-200 p-4">
          <div className="text-sm font-medium text-slate-900 mb-3">Lead Pipeline</div>
          <div className="space-y-2">
            {pipelineByStage.map((s) => (
              <div key={s.stage} className="flex items-center gap-2">
                <div className="text-[11px] text-slate-500 w-28 flex-shrink-0 truncate">{s.stage.replace("\n", " ")}</div>
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ background: "#253580", width: `${Math.min(100, (s.count / leads.length) * 100 * 3)}%` }}
                  />
                </div>
                <div className="font-mono text-[11px] text-slate-700 w-4 text-right">{s.count}</div>
                <div className="font-mono text-[11px] text-slate-400 w-16 text-right">₹{s.value.toFixed(0)}L</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Total Pipeline</span>
              <span className="font-mono font-semibold text-slate-900">
                ₹{leads.filter(l => l.status !== "Won" && l.status !== "Lost").reduce((s, l) => s + l.valueLakhs, 0).toFixed(1)}L
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* SE Performance */}
        <div className="bg-white rounded-md border border-slate-200 p-4">
          <div className="text-sm font-medium text-slate-900 mb-3">Sales Engineer Performance</div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100">
                <th className="text-left pb-2 font-medium">Engineer</th>
                <th className="text-right pb-2 font-medium">Target</th>
                <th className="text-right pb-2 font-medium">Ach.</th>
                <th className="text-right pb-2 font-medium">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {salesEngineers.map((se) => {
                const pct = Math.round((se.achieved / se.target) * 100);
                return (
                  <tr key={se.name} className="hover:bg-slate-50">
                    <td className="py-2 font-medium text-slate-800">{se.name.split(" ")[0]} {se.name.split(" ")[1][0]}.</td>
                    <td className="py-2 text-right font-mono text-slate-500">{se.target}L</td>
                    <td className="py-2 text-right font-mono text-slate-800">{se.achieved}L</td>
                    <td className="py-2 text-right">
                      <span className={`font-mono font-semibold ${pct >= 80 ? "text-green-600" : pct >= 60 ? "text-amber-600" : "text-red-600"}`}>
                        {pct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Upcoming Follow-ups */}
        <div className="bg-white rounded-md border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-slate-900">Upcoming Follow-ups</div>
            <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-medium">{upcoming.length} pending</span>
          </div>
          <div className="space-y-2">
            {upcoming.map((l) => (
              <button
                key={l.id}
                onClick={() => onLeadClick(l.id)}
                className="w-full text-left flex items-start gap-2.5 hover:bg-slate-50 rounded p-1.5 -mx-1.5 transition-colors"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${STATUS_CONFIG[l.status].dot}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-slate-800 truncate">{l.projectName}</div>
                  <div className="text-[11px] text-slate-400 flex gap-2">
                    <span>{l.salesEngineer.split(" ")[0]}</span>
                    <span>·</span>
                    <span className="font-mono">{formatDate(l.nextFollowUp)}</span>
                  </div>
                </div>
                <div className="font-mono text-[11px] text-slate-500 flex-shrink-0">₹{l.valueLakhs}L</div>
              </button>
            ))}
          </div>
        </div>

        {/* High Value Opportunities */}
        <div className="bg-white rounded-md border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-slate-900">High-Value Opportunities</div>
            <span className="text-[10px] text-blue-600 font-medium">Top 5</span>
          </div>
          <div className="space-y-2.5">
            {highValue.map((l, i) => (
              <button
                key={l.id}
                onClick={() => onLeadClick(l.id)}
                className="w-full text-left flex items-center gap-3 hover:bg-slate-50 rounded p-1.5 -mx-1.5 transition-colors"
              >
                <div className="w-5 h-5 rounded bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-slate-800 truncate">{l.projectName}</div>
                  <div className="text-[11px] text-slate-400">{l.location} · {l.status}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-mono text-sm font-semibold text-slate-900">₹{l.valueLakhs}L</div>
                  <div className="text-[10px] text-slate-400">{l.probability}% prob.</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-md border border-slate-200 p-4">
        <div className="text-sm font-medium text-slate-900 mb-3">Recent Activity</div>
        <div className="grid grid-cols-5 gap-2">
          {recent.map((l) => (
            <button
              key={l.id}
              onClick={() => onLeadClick(l.id)}
              className="text-left border border-slate-100 rounded p-3 hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${STATUS_CONFIG[l.status].bg} ${STATUS_CONFIG[l.status].color}`}>
                  {l.status}
                </span>
              </div>
              <div className="text-xs font-medium text-slate-800 line-clamp-2 mb-1">{l.projectName}</div>
              <div className="text-[11px] text-slate-400">{l.salesEngineer.split(" ")[0]}</div>
              <div className="font-mono text-sm font-semibold text-slate-900 mt-1">₹{l.valueLakhs}L</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Employee Location Section ─────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Employee Location & Field Activity</h2>
            <p className="text-[11px] text-slate-400">Real-time · Aug 31, 2026 · Manager view</p>
          </div>
          <span className="flex items-center gap-1.5 text-[11px] text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded font-medium">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            {fieldEmployees.filter(e => e.locationSharingEnabled).length} employees sharing location
          </span>
        </div>

        {/* Location KPIs */}
        <div className="grid grid-cols-6 gap-3 mb-4">
          {[
            { label: "Active Today", value: fieldEmployees.filter(e => e.status !== "On Leave" && e.status !== "Offline").length, color: "text-[#253580]", bg: "bg-[#eef0f9]" },
            { label: "In Field", value: fieldEmployees.filter(e => e.status === "In Field").length, color: "text-blue-700", bg: "bg-blue-50" },
            { label: "At Customer Site", value: fieldEmployees.filter(e => e.status === "At Customer Site").length, color: "text-indigo-700", bg: "bg-indigo-50" },
            { label: "Visits Today", value: fieldEmployees.reduce((s, e) => s + e.todayVisits, 0), color: "text-purple-700", bg: "bg-purple-50" },
            { label: "Visits Completed", value: fieldEmployees.reduce((s, e) => s + e.completedVisits, 0), color: "text-green-700", bg: "bg-green-50" },
            { label: "On Leave", value: fieldEmployees.filter(e => e.status === "On Leave").length, color: "text-amber-700", bg: "bg-amber-50" },
          ].map(k => (
            <div key={k.label} className={`rounded-md border border-slate-200 p-3 ${k.bg}`}>
              <div className={`font-mono text-2xl font-bold ${k.color}`}>{k.value}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{k.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Map widget */}
          <div className="col-span-2 bg-white rounded-md border border-slate-200 overflow-hidden" style={{ height: 340 }}>
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
              <div className="text-xs font-semibold text-slate-700">Live Map</div>
              <span className="text-[10px] text-slate-400">Click a marker for details</span>
            </div>
            <div style={{ height: 300 }}>
              <EmployeeMap compact />
            </div>
          </div>

          {/* Right column: employee list + timeline */}
          <div className="flex flex-col gap-3">
            {/* Employee status list */}
            <div className="bg-white rounded-md border border-slate-200 p-3 flex-1 overflow-y-auto" style={{ maxHeight: 200 }}>
              <div className="text-xs font-semibold text-slate-700 mb-2">Field Team Status</div>
              <div className="space-y-2">
                {fieldEmployees.map(emp => (
                  <div key={emp.id} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0" style={{ background: emp.color }}>
                      {emp.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-medium text-slate-800 truncate">{emp.name}</div>
                      {emp.currentActivity && <div className="text-[10px] text-slate-400 truncate">{emp.currentActivity}</div>}
                    </div>
                    <StatusBadge status={emp.status} />
                  </div>
                ))}
              </div>
            </div>

            {/* Field Activity Timeline */}
            <div className="bg-white rounded-md border border-slate-200 p-3 flex-1 overflow-y-auto" style={{ maxHeight: 160 }}>
              <div className="text-xs font-semibold text-slate-700 mb-2">Field Activity Today</div>
              <FieldActivityTimeline limit={5} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
