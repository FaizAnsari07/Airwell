import { useState, useCallback } from "react";
import { fieldEmployees, STATUS_STYLE } from "../data/locationData";
import type { FieldEmployee, EmployeeStatus, RouteStop } from "../data/locationData";

// ── Projection ────────────────────────────────────────────────────────────────
// Bounding box covers Pune / Mumbai / Nashik / Hyderabad / Bangalore / Chennai
const BOUNDS = { latMin: 11.5, latMax: 21.5, lngMin: 72.0, lngMax: 81.5 };

function project(lat: number, lng: number, w: number, h: number) {
  const x = ((lng - BOUNDS.lngMin) / (BOUNDS.lngMax - BOUNDS.lngMin)) * w;
  const y = ((BOUNDS.latMax - lat) / (BOUNDS.latMax - BOUNDS.latMin)) * h;
  return { x, y };
}

// ── City labels (decorative background) ──────────────────────────────────────
const CITIES = [
  { name: "Pune",       lat: 18.52, lng: 73.85 },
  { name: "Mumbai",     lat: 19.08, lng: 72.88 },
  { name: "Nashik",     lat: 20.00, lng: 73.79 },
  { name: "Hyderabad",  lat: 17.39, lng: 78.49 },
  { name: "Bangalore",  lat: 12.97, lng: 77.59 },
  { name: "Chennai",    lat: 13.08, lng: 80.27 },
  { name: "Nagpur",     lat: 21.15, lng: 79.08 },
  { name: "Vadodara",   lat: 22.30, lng: 73.19 },
];

// Simplified India coastline points (lat,lng pairs) for decorative outline
const INDIA_POLY: [number, number][] = [
  [21.5, 72.6], [20.9, 72.7], [20.3, 72.8], [19.5, 72.8], [19.0, 72.8],
  [18.5, 73.0], [18.0, 73.2], [17.4, 74.1], [16.9, 73.7], [16.0, 73.4],
  [15.0, 73.9], [14.3, 74.4], [13.5, 74.8], [12.9, 74.8], [12.3, 74.7],
  [11.9, 75.4], [11.5, 76.5], [11.5, 77.5], [11.7, 78.2], [12.0, 79.5],
  [12.6, 80.0], [13.0, 80.3], [13.6, 80.3], [14.5, 79.9], [15.3, 80.0],
  [16.1, 80.3], [16.8, 81.0], [17.4, 81.5], [18.2, 81.5], [18.8, 81.2],
  [19.5, 80.5], [20.0, 80.2], [20.4, 79.8], [20.7, 79.2], [21.1, 79.0],
  [21.5, 79.5], [21.5, 78.5], [21.5, 77.0], [21.5, 75.5], [21.5, 74.0],
  [21.5, 72.6],
];

interface Props {
  selectedEmployeeId?: string | null;
  onEmployeeClick?: (emp: FieldEmployee) => void;
  compact?: boolean;
}

export default function EmployeeMap({ selectedEmployeeId, onEmployeeClick, compact = false }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const W = 800;
  const H = 520;

  const empToShow = fieldEmployees.filter(e => {
    if (!e.locationSharingEnabled || !e.currentPosition) return false;
    if (filterStatus && e.status !== filterStatus) return false;
    if (searchQuery && !e.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Route stops for selected employee
  const selectedEmp = selectedEmployeeId ? fieldEmployees.find(e => e.id === selectedEmployeeId) : null;
  const routeStops = selectedEmp?.todayRoute.filter(s => s.position) ?? [];

  const dotColorMap: Record<string, string> = {
    "bg-green-500": "#22c55e", "bg-blue-500": "#3b82f6", "bg-indigo-500": "#6366f1",
    "bg-slate-500": "#64748b", "bg-amber-400": "#fbbf24", "bg-slate-300": "#cbd5e1",
    "bg-slate-400": "#94a3b8",
  };

  function statusDotColor(status: EmployeeStatus) {
    return dotColorMap[STATUS_STYLE[status].dot] ?? "#94a3b8";
  }

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden" style={{ background: "#F0F4FA" }}>
      {/* Controls overlay */}
      {!compact && (
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
          <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100">
              <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search employee…"
                className="text-xs focus:outline-none w-40 bg-transparent"
              />
            </div>
            <div className="flex gap-2 px-3 py-2">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="text-xs border border-slate-200 rounded px-2 py-1 bg-white focus:outline-none"
              >
                <option value="">All Status</option>
                {["In Field", "At Customer Site", "In Office", "Online"].map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow border border-slate-200 px-3 py-2 text-[10px] text-slate-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0 animate-pulse" />
            Location sharing active · Manager view
          </div>
        </div>
      )}

      {/* SVG Map */}
      <div className="flex-1 relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-full"
          style={{ display: "block" }}
        >
          {/* Background */}
          <rect width={W} height={H} fill="#E8EEF8" />

          {/* Grid lines */}
          {Array.from({ length: 12 }, (_, i) => (
            <line key={`vg${i}`} x1={(i / 11) * W} y1={0} x2={(i / 11) * W} y2={H}
              stroke="#D4DCF0" strokeWidth={0.5} />
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <line key={`hg${i}`} x1={0} y1={(i / 7) * H} x2={W} y2={(i / 7) * H}
              stroke="#D4DCF0" strokeWidth={0.5} />
          ))}

          {/* India outline */}
          <polygon
            points={INDIA_POLY.map(([lat, lng]) => {
              const p = project(lat, lng, W, H);
              return `${p.x},${p.y}`;
            }).join(" ")}
            fill="#D6DFF5"
            stroke="#B8C5E8"
            strokeWidth={1.5}
            opacity={0.7}
          />

          {/* City dots + labels */}
          {CITIES.map(city => {
            const p = project(city.lat, city.lng, W, H);
            return (
              <g key={city.name}>
                <circle cx={p.x} cy={p.y} r={2.5} fill="#9AAAD4" />
                <text x={p.x + 5} y={p.y + 4} fontSize={8} fill="#7A8EC0" fontFamily="Inter,sans-serif">
                  {city.name}
                </text>
              </g>
            );
          })}

          {/* Route polyline for selected employee */}
          {selectedEmp && routeStops.length > 1 && (() => {
            const pts = routeStops.map(s => project(s.position.lat, s.position.lng, W, H));
            const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
            return (
              <path
                d={d}
                fill="none"
                stroke={selectedEmp.color}
                strokeWidth={2}
                strokeDasharray="6 3"
                opacity={0.7}
              />
            );
          })()}

          {/* Route stop markers */}
          {selectedEmp && routeStops.map((stop, i) => {
            const p = project(stop.position.lat, stop.position.lng, W, H);
            const isLast = i === routeStops.length - 1;
            return (
              <g key={stop.id}>
                <circle cx={p.x} cy={p.y} r={10} fill={isLast ? selectedEmp.color : "#fff"}
                  stroke={selectedEmp.color} strokeWidth={2} />
                <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize={9} fontWeight="700"
                  fill={isLast ? "#fff" : selectedEmp.color} fontFamily="Inter,sans-serif">
                  {stop.index}
                </text>
              </g>
            );
          })}

          {/* Employee markers */}
          {empToShow.map(emp => {
            if (!emp.currentPosition) return null;
            const p = project(emp.currentPosition.lat, emp.currentPosition.lng, W, H);
            const isSelected = emp.id === selectedEmployeeId;
            const isHovered = emp.id === hovered;
            const r = isSelected ? 20 : isHovered ? 18 : 16;
            const dotR = isSelected ? 5 : 4;
            const dotColor = statusDotColor(emp.status);

            return (
              <g
                key={emp.id}
                style={{ cursor: "pointer" }}
                onClick={() => onEmployeeClick?.(emp)}
                onMouseEnter={() => setHovered(emp.id)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Pulse ring for selected */}
                {isSelected && (
                  <circle cx={p.x} cy={p.y} r={r + 8} fill={emp.color} opacity={0.15} />
                )}
                {/* Shadow */}
                <circle cx={p.x} cy={p.y + 2} r={r} fill="rgba(0,0,0,0.12)" />
                {/* Avatar circle */}
                <circle cx={p.x} cy={p.y} r={r} fill={emp.color}
                  stroke="#fff" strokeWidth={isSelected ? 3 : 2} />
                {/* Initials */}
                <text x={p.x} y={p.y + (r > 16 ? 5 : 4)} textAnchor="middle"
                  fontSize={r > 16 ? 9 : 8} fontWeight="700" fill="#fff" fontFamily="Inter,sans-serif">
                  {emp.initials}
                </text>
                {/* Status dot */}
                <circle cx={p.x + r * 0.65} cy={p.y - r * 0.65} r={dotR}
                  fill={dotColor} stroke="#fff" strokeWidth={1.5} />
                {/* Name label when selected or hovered */}
                {(isSelected || isHovered) && (
                  <g>
                    <rect
                      x={p.x - 30} y={p.y + r + 4}
                      width={60} height={14} rx={7}
                      fill="#253580"
                    />
                    <text x={p.x} y={p.y + r + 14} textAnchor="middle"
                      fontSize={8} fontWeight="600" fill="#fff" fontFamily="Inter,sans-serif">
                      {emp.name.split(" ")[0]}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover tooltip card */}
        {hovered && !selectedEmployeeId && (() => {
          const emp = fieldEmployees.find(e => e.id === hovered);
          if (!emp || !emp.currentPosition) return null;
          return (
            <div className="absolute top-3 right-3 bg-white rounded-lg border border-slate-200 shadow-lg p-3 w-56 pointer-events-none z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: emp.color }}>
                  {emp.initials}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">{emp.name}</div>
                  <div className="text-[10px] text-slate-400">{emp.designation}</div>
                </div>
              </div>
              <StatusBadge status={emp.status} />
              {emp.currentActivity && (
                <div className="text-[11px] text-slate-500 mt-1.5">{emp.currentActivity}</div>
              )}
              {emp.currentAddress && (
                <div className="text-[10px] text-slate-400 mt-1">📍 {emp.currentAddress}</div>
              )}
              <div className="text-[10px] text-slate-300 mt-1 font-mono">{emp.lastUpdated}</div>
            </div>
          );
        })()}

        {/* Legend */}
        {!compact && (
          <div className="absolute bottom-3 left-3 bg-white/90 rounded-lg border border-slate-200 px-3 py-2 flex items-center gap-4 text-[10px] text-slate-500">
            {[
              { label: "In Field", color: "#3b82f6" },
              { label: "At Site", color: "#6366f1" },
              { label: "In Office", color: "#64748b" },
              { label: "On Leave", color: "#fbbf24" },
            ].map(l => (
              <span key={l.label} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: l.color }} />
                {l.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: EmployeeStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded ${s.bg} ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} flex-shrink-0`} />
      {status}
    </span>
  );
}
