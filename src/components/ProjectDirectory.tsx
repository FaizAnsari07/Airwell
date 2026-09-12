import { useState, useMemo } from "react";
import { leads, STATUS_CONFIG } from "../data/crmData";
import type { LeadStatus } from "../data/crmData";

export default function ProjectDirectory({ onLeadClick }: { onLeadClick: (id: string) => void }) {
  const [search, setSearch] = useState("");
  const [filterSE, setFilterSE] = useState("");
  const [filterLoc, setFilterLoc] = useState("");

  const projects = useMemo(() => {
    return leads.filter(l => {
      if (search && !l.projectName.toLowerCase().includes(search.toLowerCase()) &&
          !l.clientName.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterSE && l.salesEngineer !== filterSE) return false;
      if (filterLoc && l.location !== filterLoc) return false;
      return true;
    });
  }, [search, filterSE, filterLoc]);

  const locations = [...new Set(leads.map(l => l.location))];
  const engineers = [...new Set(leads.map(l => l.salesEngineer))];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center gap-3 flex-shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-slate-900">Project & Customer Directory</h1>
          <p className="text-[11px] text-slate-400">{projects.length} projects</p>
        </div>
        <div className="flex-1" />
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects, clients…"
            className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded bg-slate-50 w-56 focus:outline-none focus:border-blue-400"
          />
        </div>
        <select
          value={filterSE} onChange={e => setFilterSE(e.target.value)}
          className="text-xs border border-slate-200 rounded px-2 py-1.5 bg-slate-50 focus:outline-none"
        >
          <option value="">All Engineers</option>
          {engineers.map(e => <option key={e}>{e}</option>)}
        </select>
        <select
          value={filterLoc} onChange={e => setFilterLoc(e.target.value)}
          className="text-xs border border-slate-200 rounded px-2 py-1.5 bg-slate-50 focus:outline-none"
        >
          <option value="">All Locations</option>
          {locations.map(l => <option key={l}>{l}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs border-collapse min-w-[1000px]">
          <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
            <tr>
              {["Project", "Client", "Location", "Sales Engineer", "Application", "System", "HP/TR", "Value (₹L)", "Stage", "Last Activity", "Next Follow-up"].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projects.map(p => (
              <tr
                key={p.id}
                onClick={() => onLeadClick(p.id)}
                className="hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 font-medium text-slate-900 max-w-[180px]">
                  <div className="truncate">{p.projectName}</div>
                </td>
                <td className="px-4 py-3 text-slate-600 max-w-[140px]">
                  <div className="truncate">{p.clientName}</div>
                </td>
                <td className="px-4 py-3 text-slate-500">{p.location}</td>
                <td className="px-4 py-3 text-slate-600">{p.salesEngineer}</td>
                <td className="px-4 py-3 text-slate-500">{p.application}</td>
                <td className="px-4 py-3 text-slate-500">{p.systemType}</td>
                <td className="px-4 py-3 font-mono text-slate-600">{p.capacity}{p.capacityUnit}</td>
                <td className="px-4 py-3 font-mono font-semibold text-slate-900">₹{p.valueLakhs}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_CONFIG[p.status].bg} ${STATUS_CONFIG[p.status].color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[p.status].dot}`} />
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-slate-400">{p.lastActivity}</td>
                <td className="px-4 py-3 font-mono text-slate-400">
                  {p.nextFollowUp || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
