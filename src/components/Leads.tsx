import { useState, useMemo } from "react";
import { leads, STATUS_CONFIG, SALES_ENGINEERS } from "../data/crmData";
import type { Lead, LeadStatus, ClientType, Application, SystemType } from "../data/crmData";

const ALL_STATUSES: LeadStatus[] = [
  "New Enquiry", "Qualified", "Site Visit", "Quotation Sent",
  "Follow-up", "Negotiation", "Booking Confirmed", "Advance Received", "Won", "Lost",
];

const LOCATIONS = ["Pune", "Mumbai", "Hyderabad", "Bangalore", "Chennai", "Nagpur", "Nashik", "Vadodara"];
const APPLICATIONS: Application[] = ["Process Cooling", "Comfort AC", "Data Center Cooling", "Cold Storage", "Industrial HVAC", "Pharma"];
const SYSTEM_TYPES: SystemType[] = ["Chiller", "VRF", "AHU", "DX Split", "Package Unit", "Cooling Tower"];
const CLIENT_TYPES: ClientType[] = ["Industrial", "Commercial", "Institutional", "Government"];

export default function Leads({ onLeadClick }: { onLeadClick: (id: string) => void }) {
  const [search, setSearch] = useState("");
  const [filterSE, setFilterSE] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterClient, setFilterClient] = useState("");
  const [filterApp, setFilterApp] = useState("");
  const [filterLoc, setFilterLoc] = useState("");
  const [filterSystem, setFilterSystem] = useState("");
  const [sortCol, setSortCol] = useState<keyof Lead>("srNo");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = useMemo(() => {
    return leads
      .filter((l) => {
        if (search && !l.projectName.toLowerCase().includes(search.toLowerCase()) &&
            !l.clientName.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterSE && l.salesEngineer !== filterSE) return false;
        if (filterStatus && l.status !== filterStatus) return false;
        if (filterClient && l.clientType !== filterClient) return false;
        if (filterApp && l.application !== filterApp) return false;
        if (filterLoc && l.location !== filterLoc) return false;
        if (filterSystem && l.systemType !== filterSystem) return false;
        return true;
      })
      .sort((a, b) => {
        const av = a[sortCol] as string | number;
        const bv = b[sortCol] as string | number;
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
  }, [search, filterSE, filterStatus, filterClient, filterApp, filterLoc, filterSystem, sortCol, sortDir]);

  function toggleSort(col: keyof Lead) {
    if (sortCol === col) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const activeFilters = [filterSE, filterStatus, filterClient, filterApp, filterLoc, filterSystem].filter(Boolean).length;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center gap-3 flex-shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-slate-900">Leads & Enquiries</h1>
          <p className="text-[11px] text-slate-400">{filtered.length} of {leads.length} leads</p>
        </div>
        <div className="flex-1" />

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads…"
            className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded bg-slate-50 w-52 focus:outline-none focus:border-blue-400"
          />
        </div>

        {/* Filters */}
        <FilterSelect value={filterSE} onChange={setFilterSE} options={SALES_ENGINEERS} placeholder="Sales Engineer" />
        <FilterSelect value={filterStatus} onChange={setFilterStatus} options={ALL_STATUSES} placeholder="Status" />
        <FilterSelect value={filterClient} onChange={setFilterClient} options={CLIENT_TYPES} placeholder="Client Type" />
        <FilterSelect value={filterLoc} onChange={setFilterLoc} options={LOCATIONS} placeholder="Location" />

        {activeFilters > 0 && (
          <button
            onClick={() => { setFilterSE(""); setFilterStatus(""); setFilterClient(""); setFilterApp(""); setFilterLoc(""); setFilterSystem(""); }}
            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
          >
            Clear ({activeFilters})
          </button>
        )}

        <button
          onClick={() => setShowAddModal(true)}
          className="ml-2 flex items-center gap-1.5 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors" style={{ background: "#253580" }}
        >
          <span>+</span> Add Lead
        </button>
      </div>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-5 py-2 flex items-center gap-3 text-xs">
          <span className="font-medium text-blue-800">{selected.size} selected</span>
          <button className="text-blue-600 hover:underline">Assign</button>
          <button className="text-blue-600 hover:underline">Change Status</button>
          <button className="text-red-500 hover:underline">Delete</button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-slate-500 hover:text-slate-700">Deselect all</button>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs border-collapse min-w-[1200px]">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr className="border-b border-slate-200">
              <th className="w-8 px-3 py-2.5">
                <input
                  type="checkbox"
                  className="rounded border-slate-300"
                  checked={selected.size === filtered.length && filtered.length > 0}
                  onChange={(e) => setSelected(e.target.checked ? new Set(filtered.map(l => l.id)) : new Set())}
                />
              </th>
              <SortTH col="srNo" label="#" active={sortCol} dir={sortDir} onSort={toggleSort} className="w-10" />
              <SortTH col="projectName" label="Project Name" active={sortCol} dir={sortDir} onSort={toggleSort} className="min-w-[180px]" />
              <SortTH col="salesEngineer" label="Sales Engineer" active={sortCol} dir={sortDir} onSort={toggleSort} />
              <SortTH col="clientType" label="Client Type" active={sortCol} dir={sortDir} onSort={toggleSort} />
              <SortTH col="enquirySource" label="Source" active={sortCol} dir={sortDir} onSort={toggleSort} />
              <SortTH col="application" label="Application" active={sortCol} dir={sortDir} onSort={toggleSort} />
              <SortTH col="location" label="Location" active={sortCol} dir={sortDir} onSort={toggleSort} />
              <SortTH col="systemType" label="System" active={sortCol} dir={sortDir} onSort={toggleSort} />
              <SortTH col="tr" label="HP/TR" active={sortCol} dir={sortDir} onSort={toggleSort} className="text-right" />
              <SortTH col="valueLakhs" label="Value (₹L)" active={sortCol} dir={sortDir} onSort={toggleSort} className="text-right" />
              <SortTH col="status" label="Status" active={sortCol} dir={sortDir} onSort={toggleSort} />
              <SortTH col="expectedBookingDate" label="Exp. Booking" active={sortCol} dir={sortDir} onSort={toggleSort} />
              <SortTH col="nextFollowUp" label="Next Follow-up" active={sortCol} dir={sortDir} onSort={toggleSort} />
              <th className="px-3 py-2.5 text-left font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((l) => (
              <tr
                key={l.id}
                className={`hover:bg-slate-50 cursor-pointer transition-colors ${selected.has(l.id) ? "bg-blue-50/50" : ""}`}
                onClick={() => onLeadClick(l.id)}
              >
                <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="rounded border-slate-300"
                    checked={selected.has(l.id)}
                    onChange={() => toggleSelect(l.id)}
                  />
                </td>
                <td className="px-3 py-2 font-mono text-slate-400">{l.srNo}</td>
                <td className="px-3 py-2 font-medium text-slate-900 max-w-[180px]">
                  <div className="truncate">{l.projectName}</div>
                  <div className="text-[10px] text-slate-400 truncate">{l.clientName}</div>
                </td>
                <td className="px-3 py-2 text-slate-600">{l.salesEngineer}</td>
                <td className="px-3 py-2 text-slate-500">{l.clientType}</td>
                <td className="px-3 py-2 text-slate-500">{l.enquirySource}</td>
                <td className="px-3 py-2 text-slate-500">{l.application}</td>
                <td className="px-3 py-2 text-slate-500">{l.location}</td>
                <td className="px-3 py-2 text-slate-500">{l.systemType}</td>
                <td className="px-3 py-2 text-right font-mono text-slate-600">
                  {l.capacity}{l.capacityUnit}
                </td>
                <td className="px-3 py-2 text-right font-mono font-semibold text-slate-900">₹{l.valueLakhs}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={l.status} />
                </td>
                <td className="px-3 py-2 font-mono text-slate-500">{l.expectedBookingDate || "—"}</td>
                <td className="px-3 py-2 font-mono text-slate-500">
                  {l.nextFollowUp ? (
                    <span className={isOverdue(l.nextFollowUp) ? "text-red-600 font-semibold" : ""}>{l.nextFollowUp}</span>
                  ) : "—"}
                </td>
                <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                  <button className="text-blue-600 hover:text-blue-800 text-[11px] font-medium">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="text-4xl mb-3">🔍</div>
            <div className="text-sm font-medium">No leads match your filters</div>
            <div className="text-xs mt-1">Try adjusting your search or filter criteria</div>
          </div>
        )}
      </div>

      {/* Add Lead Modal */}
      {showAddModal && <AddLeadModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

function StatusBadge({ status }: { status: LeadStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${cfg.bg} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`} />
      {status}
    </span>
  );
}

function SortTH({
  col, label, active, dir, onSort, className = "",
}: {
  col: keyof Lead; label: string; active: keyof Lead; dir: "asc" | "desc";
  onSort: (c: keyof Lead) => void; className?: string;
}) {
  return (
    <th
      className={`px-3 py-2.5 text-left font-semibold text-slate-500 uppercase tracking-wider text-[10px] cursor-pointer select-none hover:text-slate-700 whitespace-nowrap ${className}`}
      onClick={() => onSort(col)}
    >
      {label}
      {active === col && <span className="ml-1">{dir === "asc" ? "↑" : "↓"}</span>}
    </th>
  );
}

function FilterSelect({
  value, onChange, options, placeholder,
}: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-xs border border-slate-200 rounded px-2 py-1.5 bg-slate-50 text-slate-600 focus:outline-none focus:border-blue-400 max-w-[130px]"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function isOverdue(dateStr: string) {
  return dateStr < new Date().toISOString().slice(0, 10);
}

function AddLeadModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Add New Lead</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-lg leading-none">×</button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          {[
            { label: "Project Name", type: "text", span: 2 },
            { label: "Client Name", type: "text" },
            { label: "Client Contact", type: "text" },
            { label: "Client Email", type: "email" },
            { label: "Location", type: "text" },
          ].map((f) => (
            <div key={f.label} className={f.span === 2 ? "col-span-2" : ""}>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">{f.label}</label>
              <input type={f.type} className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400" />
            </div>
          ))}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Sales Engineer</label>
            <select className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400">
              {SALES_ENGINEERS.map(se => <option key={se}>{se}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">System Type</label>
            <select className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400">
              {["Chiller", "VRF", "AHU", "DX Split", "Package Unit", "Cooling Tower"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Value (₹ Lakhs)</label>
            <input type="number" className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Expected Booking Date</label>
            <input type="date" className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400" />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-200">
          <button onClick={onClose} className="px-4 py-1.5 text-xs text-slate-600 border border-slate-200 rounded hover:bg-slate-50">Cancel</button>
          <button className="px-4 py-1.5 text-xs font-semibold text-white rounded" style={{ background: "#253580" }}>Save Lead</button>
        </div>
      </div>
    </div>
  );
}
