import { salesEngineers } from "../data/crmData";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

export default function SalesPerformance() {
  const ranked = [...salesEngineers].sort((a, b) => {
    const pctA = a.achieved / a.target;
    const pctB = b.achieved / b.target;
    return pctB - pctA;
  });

  const comparisonData = salesEngineers.map(se => ({
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

      {/* Rankings */}
      <div className="grid grid-cols-5 gap-3">
        {ranked.map((se, i) => {
          const pct = Math.round((se.achieved / se.target) * 100);
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
        {salesEngineers.map((se) => (
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
              <span>Apr</span><span>Sep</span>
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
