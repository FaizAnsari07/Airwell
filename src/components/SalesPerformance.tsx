import { useState } from "react";
import { salesEngineers } from "../data/crmData";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const MONTH_YEAR: Record<string, number> = {
  Apr: 2026, May: 2026, Jun: 2026, Jul: 2026, Aug: 2026, Sep: 2026,
  Oct: 2026, Nov: 2026, Dec: 2026, Jan: 2027, Feb: 2027, Mar: 2027,
};
const MONTH_NUM: Record<string, number> = {
  Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12, Jan: 1, Feb: 2, Mar: 3,
};

function monthToDate(month: string): Date {
  return new Date(MONTH_YEAR[month], MONTH_NUM[month] - 1, 1);
}

function csvCell(value: string): string {
  if (/[",\r\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function exportToExcel(fromDate: string, toDate: string) {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const rows: string[][] = [["Sales Engineer", "Month", "Target (Lakhs)", "Achieved (Lakhs)"]];

  for (const se of salesEngineers) {
    for (const m of se.monthlyData) {
      const d = monthToDate(m.month);
      if (d < from || d > to) continue;
      rows.push([se.name, `${m.month} ${MONTH_YEAR[m.month]}`, String(m.target), String(m.achieved)]);
    }
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
  const [fromDate, setFromDate] = useState("2026-04-01");
  const [toDate, setToDate] = useState("2026-09-30");

  const from = new Date(fromDate);
  const to = new Date(toDate);

  const rangedEngineers = salesEngineers.map((se) => {
    const monthlyData = se.monthlyData.filter((m) => {
      const d = monthToDate(m.month);
      return d >= from && d <= to;
    });
    const target = monthlyData.reduce((s, m) => s + m.target, 0);
    const achieved = monthlyData.reduce((s, m) => s + m.achieved, 0);
    return { ...se, monthlyData, target, achieved };
  });

  const ranked = [...rangedEngineers].sort((a, b) => {
    const pctA = a.target > 0 ? a.achieved / a.target : 0;
    const pctB = b.target > 0 ? b.achieved / b.target : 0;
    return pctB - pctA;
  });

  const comparisonData = rangedEngineers.map(se => ({
    name: se.name.split(" ")[0],
    Target: se.target,
    Achieved: se.achieved,
    Pipeline: se.pipelineValue,
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
          onClick={() => exportToExcel(fromDate, toDate)}
          className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded"
          style={{ background: "#39B849" }}
        >
          📊 Export to Excel
        </button>
        <span className="text-[11px] text-slate-400 ml-auto">Report reflects data between the selected dates</span>
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-5 gap-3">
        {ranked.map((se, i) => {
          const pct = se.target > 0 ? Math.round((se.achieved / se.target) * 100) : 0;
          const pctColor = pct >= 80 ? "text-green-600" : pct >= 60 ? "text-amber-600" : "text-red-600";
          const ringColor = pct >= 80 ? "border-green-400" : pct >= 60 ? "border-amber-400" : "border-red-300";

          return (
            <div key={se.name} className="bg-white rounded-md border border-slate-200 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`text-2xl font-bold ${rankColors[i]}`}>#{i + 1}</div>
                <div className={`w-10 h-10 rounded-full border-2 ${ringColor} flex items-center justify-center font-bold text-sm text-slate-700 bg-slate-50`}>
                  {se.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">{se.name}</div>
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
                <Row label="Target" value={`₹${se.target}L`} />
                <Row label="Achieved" value={`₹${se.achieved}L`} bold />
                <Row label="Enquiries" value={String(se.enquiries)} />
                <Row label="Booking Val." value={`₹${se.bookingValue}L`} />
                <Row label="Collection" value={`₹${se.collection}L`} />
                <Row label="Pipeline" value={`₹${se.pipelineValue}L`} muted />
              </div>
            </div>
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

      {/* Monthly Trend per SE */}
      <div className="grid grid-cols-5 gap-3">
        {rangedEngineers.map((se) => (
          <div key={se.name} className="bg-white rounded-md border border-slate-200 p-4">
            <div className="text-[11px] font-semibold text-slate-700 mb-3">{se.name.split(" ")[0]}</div>
            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={se.monthlyData}>
                <Line type="monotone" dataKey="target" stroke="#BFDBFE" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="achieved" stroke="#253580" strokeWidth={2} dot={{ r: 2 }} />
                <XAxis dataKey="month" hide />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ fontSize: 10, border: "1px solid #E2E8F0", borderRadius: 4 }}
                  formatter={(v) => [`₹${v}L`, ""]}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>{se.monthlyData[0]?.month ?? "—"}</span><span>{se.monthlyData[se.monthlyData.length - 1]?.month ?? "—"}</span>
            </div>
          </div>
        ))}
      </div>
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
