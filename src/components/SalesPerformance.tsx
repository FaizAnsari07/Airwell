import { useState } from "react";
import { leads, STATUS_CONFIG } from "../data/crmData";
import type { Lead, LeadStatus } from "../data/crmData";
import { USERS } from "../data/usersData";
import type { User } from "../data/usersData";
import { useAppData } from "../context/AppDataContext";
import SalesEngineerDetailModal from "./shared/SalesEngineerDetailModal";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface EngineerStats {
  user: User;
  engineerLeads: Lead[];
  wonLeads: Lead[];
  target: number;
  achieved: number;
  pipelineValue: number;
  collection: number;
  enquiries: number;
}

function inRange(dateStr: string, from: Date, to: Date): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  return d >= from && d <= to;
}

function csvCell(value: string): string {
  if (/[",\r\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function exportToExcel(fromDate: string, toDate: string, stats: EngineerStats[]) {
  const rows: string[][] = [
    ["Sales Engineer", "Target (Lakhs)", "Achieved (Lakhs)", "Won Projects", "Pipeline (Lakhs)", "Collection (Lakhs)", "Enquiries"],
  ];

  for (const s of stats) {
    rows.push([
      s.user.name,
      String(s.target),
      String(s.achieved),
      String(s.wonLeads.length),
      String(s.pipelineValue),
      String(s.collection),
      String(s.enquiries),
    ]);
  }

  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `sales-performance_${fromDate}_to_${toDate}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function SalesPerformance() {
  const { paidTotalForLead } = useAppData();
  const [fromDate, setFromDate] = useState("2026-04-01");
  const [toDate, setToDate] = useState("2026-09-30");
  const [selectedEngineer, setSelectedEngineer] = useState<User | null>(null);

  const from = new Date(fromDate);
  const to = new Date(toDate);

  const engineerUsers = USERS.filter((u) => u.role === "Sales Engineer");

  const stats: EngineerStats[] = engineerUsers.map((u) => {
    const engineerLeads = leads.filter((l) => l.salesEngineer === u.name);
    const wonLeads = engineerLeads.filter((l) => l.status === "Won");
    const activeLeads = engineerLeads.filter((l) => l.status !== "Won" && l.status !== "Lost");
    const wonInRange = wonLeads.filter((l) => inRange(l.expectedBookingDate, from, to));
    const enquiriesInRange = engineerLeads.filter((l) => inRange(l.enquiryDate, from, to));

    return {
      user: u,
      engineerLeads,
      wonLeads,
      target: u.targetAmount ?? 0,
      achieved: wonInRange.reduce((s, l) => s + l.valueLakhs, 0),
      pipelineValue: activeLeads.reduce((s, l) => s + l.valueLakhs, 0),
      collection: engineerLeads.reduce((s, l) => s + paidTotalForLead(l.id), 0),
      enquiries: enquiriesInRange.length,
    };
  });

  const ranked = [...stats].sort((a, b) => {
    const pctA = a.target > 0 ? a.achieved / a.target : 0;
    const pctB = b.target > 0 ? b.achieved / b.target : 0;
    return pctB - pctA;
  });

  const comparisonData = stats.map((s) => ({
    name: s.user.name.split(" ")[0],
    Target: s.target,
    Achieved: s.achieved,
    Pipeline: s.pipelineValue,
  }));

  const rankColors = ["text-amber-500", "text-slate-500", "text-orange-400", "text-slate-400", "text-slate-400"];

  return (
    <div className="p-5 space-y-5 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-slate-900">Sales Engineer Performance</h1>
          <p className="text-[11px] text-slate-400">FY 2026–27 · Apr–Aug 2026</p>
        </div>
      </div>

      {/* Custom Date Range + Export */}
      <div className="bg-white rounded-md border border-slate-200 p-4 flex items-end gap-3 flex-wrap">
        <div>
          <label className="block text-[11px] font-medium text-slate-600 mb-1">From Date</label>
          <input
            type="date"
            value={fromDate}
            max={toDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="text-xs border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:border-blue-400"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-slate-600 mb-1">To Date</label>
          <input
            type="date"
            value={toDate}
            min={fromDate}
            onChange={(e) => setToDate(e.target.value)}
            className="text-xs border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:border-blue-400"
          />
        </div>
        <button
          onClick={() => exportToExcel(fromDate, toDate, stats)}
          className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded"
          style={{ background: "#39B849" }}
        >
          📊 Export to Excel
        </button>
        <span className="text-[11px] text-slate-400 ml-auto">Report reflects data between the selected dates · click a team member for full details</span>
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-5 gap-3">
        {ranked.map((s, i) => {
          const pct = s.target > 0 ? Math.round((s.achieved / s.target) * 100) : 0;
          const pctColor = pct >= 80 ? "text-green-600" : pct >= 60 ? "text-amber-600" : "text-red-600";
          const ringColor = pct >= 80 ? "border-green-400" : pct >= 60 ? "border-amber-400" : "border-red-300";

          return (
            <button
              key={s.user.id}
              onClick={() => setSelectedEngineer(s.user)}
              className="bg-white rounded-md border border-slate-200 p-4 text-left hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`text-2xl font-bold ${rankColors[i] ?? "text-slate-400"}`}>#{i + 1}</div>
                <div className={`w-10 h-10 rounded-full border-2 ${ringColor} flex items-center justify-center font-bold text-sm text-slate-700 bg-slate-50`}>
                  {s.user.initials}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">{s.user.name}</div>
                  <div className={`font-mono text-lg font-bold ${pctColor}`}>{pct}%</div>
                </div>
              </div>

              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full ${pct >= 80 ? "bg-green-500" : pct >= 60 ? "bg-amber-500" : "bg-red-400"}`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>

              <div className="space-y-1.5 text-[11px]">
                <Row label="Target" value={`₹${s.target}L`} />
                <Row label="Achieved" value={`₹${s.achieved}L`} bold />
                <Row label="Won Projects" value={String(s.wonLeads.length)} />
                <Row label="Enquiries" value={String(s.enquiries)} />
                <Row label="Collection" value={`₹${s.collection}L`} />
                <Row label="Pipeline" value={`₹${s.pipelineValue}L`} muted />
              </div>
            </button>
          );
        })}
      </div>

      {/* Comparison Chart */}
      <div className="bg-white rounded-md border border-slate-200 p-5">
        <div className="text-sm font-medium text-slate-900 mb-4">Target vs Achievement Comparison (₹ Lakhs)</div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={comparisonData} barGap={4} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, border: "1px solid #E2E8F0", borderRadius: 6 }}
              formatter={(v) => [`₹${v}L`, ""]}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Target" fill="#BFDBFE" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Achieved" fill="#253580" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Pipeline" fill="#E0E7FF" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Status breakdown per SE — real pipeline mix, not a fabricated trend */}
      <div className="grid grid-cols-5 gap-3">
        {stats.map((s) => (
          <div key={s.user.id} className="bg-white rounded-md border border-slate-200 p-4">
            <div className="text-[11px] font-semibold text-slate-700 mb-3">{s.user.name.split(" ")[0]}</div>
            {s.engineerLeads.length === 0 ? (
              <div className="text-[10.5px] text-slate-400">No leads assigned</div>
            ) : (
              <div className="space-y-1.5">
                {(Object.keys(STATUS_CONFIG) as LeadStatus[])
                  .map((status) => ({ status, count: s.engineerLeads.filter((l) => l.status === status).length }))
                  .filter((row) => row.count > 0)
                  .map(({ status, count }) => (
                    <div key={status} className="flex items-center justify-between text-[10.5px]">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[status].dot}`} />
                        {status}
                      </span>
                      <span className="font-mono font-semibold text-slate-800">{count}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedEngineer && (
        <SalesEngineerDetailModal user={selectedEngineer} onClose={() => setSelectedEngineer(null)} />
      )}
    </div>
  );
}

function Row({ label, value, bold, muted }: { label: string; value: string; bold?: boolean; muted?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-400">{label}</span>
      <span className={`font-mono ${bold ? "font-semibold text-slate-900" : muted ? "text-slate-400" : "text-slate-700"}`}>{value}</span>
    </div>
  );
}
