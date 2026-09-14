import { useState } from "react";
import { monthlyData, leads, MONTHLY_LABELS } from "../data/crmData";
import type { Lead } from "../data/crmData";
import { useAppData } from "../context/AppDataContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { formatDate } from "../utils/formatDate";

type Section = "booking-forecast" | "collection-forecast" | "booking-data" | "billing-progress" | "enquiry-gen";

interface BookingRow {
  lead: Lead;
  forecastHP: number;
  forecastTR: number;
  forecastAmt: number;
  achievedAmt: number;
}

interface CollectionRow {
  lead: Lead;
  forecast: number;
  achieved: number;
  status: "Achieved" | "Pending" | "At Risk";
}

export default function MonthlyReview({ onLeadClick }: { onLeadClick: (id: string) => void }) {
  const { paidTotalForLead } = useAppData();
  const [selectedMonth, setSelectedMonth] = useState(4); // Aug 2026 = index 4
  const [section, setSection] = useState<Section>("booking-forecast");

  const BOOKING_ROWS: BookingRow[] = leads
    .filter((l) => l.status !== "Lost")
    .map((l) => ({
      lead: l,
      forecastHP: l.capacityUnit === "HP" ? l.capacity : 0,
      forecastTR: l.capacityUnit === "TR" ? l.capacity : 0,
      forecastAmt: l.valueLakhs,
      achievedAmt: l.status === "Won" || l.status === "Booking Confirmed" || l.status === "Advance Received" ? l.valueLakhs : 0,
    }));

  const COLLECTION_ROWS: CollectionRow[] = leads
    .filter((l) => l.status === "Won")
    .map((l) => {
      const achieved = paidTotalForLead(l.id);
      return {
        lead: l,
        forecast: l.valueLakhs,
        achieved,
        status: achieved >= l.valueLakhs ? "Achieved" : achieved > 0 ? "Pending" : "At Risk",
      };
    });

  const m = monthlyData[selectedMonth];
  const bookingPct = m.bookingAchieved > 0 ? Math.round((m.bookingAchieved / m.bookingForecast) * 100) : 0;
  const collectionPct = m.collectionAchieved > 0 ? Math.round((m.collectionAchieved / m.collectionForecast) * 100) : 0;
  const billingPct = m.billingAchieved > 0 ? Math.round((m.billingAchieved / m.billingForecast) * 100) : 0;
  const enquiryPct = m.enquiryGenerated > 0 ? Math.round((m.enquiryGenerated / m.enquiryTarget) * 100) : 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-5 py-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-sm font-semibold text-slate-900">Monthly Sales Review</h1>
            <p className="text-[11px] text-slate-400">FY 2026–27 Management Reporting</p>
          </div>
        </div>

        {/* Month Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {MONTHLY_LABELS.map((label, i) => (
            <button
              key={label}
              onClick={() => setSelectedMonth(i)}
              className={`flex-shrink-0 text-[11px] font-medium px-3 py-1.5 rounded transition-colors ${
                selectedMonth === i
                  ? "text-white"
                  : "text-slate-500 bg-slate-50 border border-slate-200 hover:bg-slate-100"
              }`}
              style={selectedMonth === i ? { background: "#253580" } : {}}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Summary Strip */}
      <div className="bg-white border-b border-slate-200 px-5 py-3 flex gap-6 flex-shrink-0">
        {[
          { label: "Booking Forecast", forecast: m.bookingForecast, achieved: m.bookingAchieved, pct: bookingPct, color: "blue" },
          { label: "Collection Forecast", forecast: m.collectionForecast, achieved: m.collectionAchieved, pct: collectionPct, color: "green" },
          { label: "Billing Progress", forecast: m.billingForecast, achieved: m.billingAchieved, pct: billingPct, color: "purple" },
          { label: "Enquiry Generation", forecast: m.enquiryTarget, achieved: m.enquiryGenerated, pct: enquiryPct, color: "amber" },
        ].map((kpi) => (
          <div key={kpi.label} className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-slate-500 mb-0.5">{kpi.label}</div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-lg font-semibold text-slate-900">
                  {kpi.label.includes("Enquiry") ? kpi.achieved : `₹${kpi.achieved}L`}
                </span>
                <span className="text-xs text-slate-400">
                  / {kpi.label.includes("Enquiry") ? kpi.forecast : `₹${kpi.forecast}L`}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    kpi.pct >= 100 ? "bg-green-500" : kpi.pct >= 75 ? "bg-blue-500" : kpi.pct >= 50 ? "bg-amber-500" : "bg-red-400"
                  }`}
                  style={{ width: `${Math.min(100, kpi.pct)}%` }}
                />
              </div>
              <div className="text-[10px] font-mono mt-0.5 text-slate-400">
                {kpi.pct > 0 ? `${kpi.pct}%` : "—"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Section Tabs */}
      <div className="bg-white border-b border-slate-200 px-5 flex items-center gap-4 flex-shrink-0">
        {([
          ["booking-forecast", "Booking Forecast"],
          ["collection-forecast", "Collection Forecast"],
          ["booking-data", "Booking Data"],
          ["billing-progress", "Billing Progress"],
          ["enquiry-gen", "Enquiry Generation"],
        ] as [Section, string][]).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setSection(id)}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors ${
              section === id
                ? "border-[#253580] text-[#253580]"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Section Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {section === "booking-forecast" && (
          <BookingForecast rows={BOOKING_ROWS} onLeadClick={onLeadClick} />
        )}
        {section === "collection-forecast" && (
          <CollectionForecast rows={COLLECTION_ROWS} onLeadClick={onLeadClick} />
        )}
        {section === "booking-data" && (
          <BookingData monthLabel={MONTHLY_LABELS[selectedMonth]} onLeadClick={onLeadClick} />
        )}
        {section === "billing-progress" && (
          <BillingProgress data={monthlyData.slice(0, selectedMonth + 1)} />
        )}
        {section === "enquiry-gen" && (
          <EnquiryGeneration data={monthlyData.slice(0, selectedMonth + 1)} />
        )}
      </div>
    </div>
  );
}

function BookingForecast({ rows, onLeadClick }: { rows: BookingRow[]; onLeadClick: (id: string) => void }) {
  const totalForecast = rows.reduce((s, r) => s + r.forecastAmt, 0);
  const totalAchieved = rows.reduce((s, r) => s + r.achievedAmt, 0);

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-5">
        <SummaryCard label="Total Forecast" value={`₹${totalForecast.toFixed(1)}L`} />
        <SummaryCard label="Total Achieved" value={`₹${totalAchieved.toFixed(1)}L`} color="green" />
        <SummaryCard label="Variance" value={`₹${(totalForecast - totalAchieved).toFixed(1)}L`} color="amber" />
      </div>
      <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Project Name</th>
              <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Sales Engineer</th>
              <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Forecast HP/TR</th>
              <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Forecast Amt</th>
              <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Achieved Amt</th>
              <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Variance</th>
              <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Ach %</th>
              <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => {
              const variance = r.achievedAmt - r.forecastAmt;
              const achPct = r.achievedAmt > 0 ? Math.round((r.achievedAmt / r.forecastAmt) * 100) : 0;
              return (
                <tr key={r.lead.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">
                    <button onClick={() => onLeadClick(r.lead.id)} className="text-slate-900 hover:text-blue-700 hover:underline text-left">
                      {r.lead.projectName}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.lead.salesEngineer}</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-600">
                    {r.forecastHP > 0 ? `${r.forecastHP}HP` : `${r.forecastTR}TR`}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">₹{r.forecastAmt}L</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-green-700">
                    {r.achievedAmt > 0 ? `₹${r.achievedAmt}L` : "—"}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono ${variance >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {variance !== 0 ? `${variance > 0 ? "+" : ""}₹${variance.toFixed(1)}L` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {achPct > 0 ? (
                      <span className={`font-mono font-semibold ${achPct >= 100 ? "text-green-600" : "text-amber-600"}`}>{achPct}%</span>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{r.lead.remarks || r.lead.status}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-50 border-t border-slate-200">
            <tr>
              <td className="px-4 py-2.5 font-semibold text-slate-900 text-xs" colSpan={3}>TOTAL</td>
              <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-900">₹{totalForecast.toFixed(1)}L</td>
              <td className="px-4 py-2.5 text-right font-mono font-semibold text-green-700">₹{totalAchieved.toFixed(1)}L</td>
              <td className="px-4 py-2.5 text-right font-mono font-semibold text-amber-700">₹{(totalForecast - totalAchieved).toFixed(1)}L</td>
              <td className="px-4 py-2.5 text-right font-mono font-semibold">
                {totalAchieved > 0 ? `${Math.round((totalAchieved / totalForecast) * 100)}%` : "—"}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function CollectionForecast({ rows, onLeadClick }: { rows: CollectionRow[]; onLeadClick: (id: string) => void }) {
  const totalForecast = rows.reduce((s, r) => s + r.forecast, 0);
  const totalAchieved = rows.reduce((s, r) => s + r.achieved, 0);

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-5">
        <SummaryCard label="Collection Forecast" value={`₹${totalForecast.toFixed(2)}L`} />
        <SummaryCard label="Collection Achieved" value={`₹${totalAchieved.toFixed(2)}L`} color="green" />
        <SummaryCard label="Outstanding" value={`₹${(totalForecast - totalAchieved).toFixed(2)}L`} color="red" />
      </div>
      <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Project Name</th>
              <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Sales Engineer</th>
              <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Forecast</th>
              <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Achieved</th>
              <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Variance</th>
              <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => {
              const variance = r.achieved - r.forecast;
              const statusColor = r.status === "Achieved" ? "text-green-700 bg-green-50" :
                r.status === "At Risk" ? "text-red-700 bg-red-50" : "text-amber-700 bg-amber-50";
              return (
                <tr key={r.lead.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">
                    <button onClick={() => onLeadClick(r.lead.id)} className="text-slate-900 hover:text-blue-700 hover:underline text-left">
                      {r.lead.projectName}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.lead.salesEngineer}</td>
                  <td className="px-4 py-3 text-right font-mono">₹{r.forecast.toFixed(2)}L</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-green-700">
                    {r.achieved > 0 ? `₹${r.achieved.toFixed(2)}L` : "—"}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono ${variance >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {variance !== 0 ? `${variance > 0 ? "+" : ""}₹${variance.toFixed(2)}L` : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${statusColor}`}>{r.status}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BookingData({ monthLabel, onLeadClick }: { monthLabel: string; onLeadClick: (id: string) => void }) {
  const won = leads.filter(l => l.status === "Won" || l.status === "Booking Confirmed" || l.status === "Advance Received");
  return (
    <div>
      <div className="text-xs font-medium text-slate-500 mb-3">Booking Data — {monthLabel}</div>
      <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Project", "Client", "Sales Engineer", "System", "HP/TR", "Value (₹L)", "Stage", "Expected Date"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {won.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">
                  <button onClick={() => onLeadClick(l.id)} className="text-slate-900 hover:text-blue-700 hover:underline text-left">
                    {l.projectName}
                  </button>
                </td>
                <td className="px-4 py-3 text-slate-600">{l.clientName}</td>
                <td className="px-4 py-3 text-slate-600">{l.salesEngineer}</td>
                <td className="px-4 py-3 text-slate-500">{l.systemType}</td>
                <td className="px-4 py-3 font-mono text-slate-600">{l.capacity}{l.capacityUnit}</td>
                <td className="px-4 py-3 font-mono font-semibold text-slate-900">₹{l.valueLakhs}</td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                    l.status === "Won" ? "bg-green-50 text-green-700" : "bg-indigo-50 text-indigo-700"
                  }`}>
                    {l.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-slate-500">{formatDate(l.expectedBookingDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BillingProgress({ data }: { data: typeof monthlyData }) {
  const chartData = data.map(m => ({
    month: m.month.split(" ")[0],
    Target: m.billingForecast,
    Achieved: m.billingAchieved,
  }));

  return (
    <div>
      <div className="bg-white rounded-md border border-slate-200 p-5 mb-4">
        <div className="text-sm font-medium text-slate-900 mb-4">Billing Progress — Apr–Aug 2026</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barGap={4} barCategoryGap="35%">
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, border: "1px solid #E2E8F0", borderRadius: 6 }}
              formatter={(v) => [`₹${v}L`, ""]}
            />
            <Bar dataKey="Target" fill="#BFDBFE" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Achieved" fill="#7C3AED" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function EnquiryGeneration({ data }: { data: typeof monthlyData }) {
  const chartData = data.map(m => ({
    month: m.month.split(" ")[0],
    Target: m.enquiryTarget,
    Generated: m.enquiryGenerated,
  }));

  return (
    <div>
      <div className="bg-white rounded-md border border-slate-200 p-5">
        <div className="text-sm font-medium text-slate-900 mb-4">Enquiry Generation — Apr–Aug 2026</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barGap={4} barCategoryGap="35%">
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, border: "1px solid #E2E8F0", borderRadius: 6 }}
              formatter={(v) => [v, ""]}
            />
            <Bar dataKey="Target" fill="#FDE68A" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Generated" fill="#D97706" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color?: "green" | "red" | "amber" }) {
  const cls = color === "green" ? "bg-green-50 border-green-200 text-green-700" :
    color === "red" ? "bg-red-50 border-red-200 text-red-700" :
    color === "amber" ? "bg-amber-50 border-amber-200 text-amber-700" :
    "bg-white border-slate-200 text-slate-900";
  return (
    <div className={`rounded-md border p-4 ${cls}`}>
      <div className="text-[11px] font-medium opacity-70 mb-1">{label}</div>
      <div className="font-mono text-xl font-semibold">{value}</div>
    </div>
  );
}
