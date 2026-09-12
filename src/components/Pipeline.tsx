import { useState } from "react";
import { leads as initialLeads, STATUS_CONFIG, PIPELINE_STAGES } from "../data/crmData";
import type { Lead, LeadStatus } from "../data/crmData";
import StatusChangeModal from "./shared/StatusChangeModal";
import WonModal from "./shared/WonModal";
import { USERS, visibleUsersFor } from "../data/usersData";
import { useAppData } from "../context/AppDataContext";

const STAGE_COLORS: Record<LeadStatus, string> = {
  "New Enquiry":       "border-t-slate-400",
  "Qualified":         "border-t-blue-400",
  "Site Visit":        "border-t-purple-400",
  "Quotation Sent":    "border-t-cyan-400",
  "Follow-up":         "border-t-amber-400",
  "Negotiation":       "border-t-orange-400",
  "Booking Confirmed": "border-t-indigo-400",
  "Advance Received":  "border-t-teal-400",
  "Won":               "border-t-green-500",
  "Lost":              "border-t-red-400",
};

export default function Pipeline({ onLeadClick }: { onLeadClick: (id: string) => void }) {
  const { currentUser } = useAppData();
  const [cards, setCards] = useState<Lead[]>(initialLeads);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<LeadStatus | null>(null);
  const [pendingMove, setPendingMove] = useState<{ leadId: string; targetStatus: LeadStatus } | null>(null);
  const [filterEmployee, setFilterEmployee] = useState("");

  const employeeOptions = visibleUsersFor(currentUser, USERS).filter(
    (u) => u.role === "Sales Engineer" || u.role === "Field Support"
  );

  function handleDragStart(id: string) {
    setDragging(id);
  }

  function handleDrop(status: LeadStatus) {
    if (!dragging) return;
    const leadId = dragging;
    setDragging(null);
    setDragOver(null);
    if (status === cards.find((c) => c.id === leadId)?.status) return;
    setPendingMove({ leadId, targetStatus: status });
  }

  const pendingLead = pendingMove ? cards.find((c) => c.id === pendingMove.leadId) : undefined;

  function applyStatusChange(newStatus: LeadStatus) {
    if (!pendingMove) return;
    setCards((prev) => prev.map((c) => c.id === pendingMove.leadId ? { ...c, status: newStatus } : c));
    setPendingMove(null);
  }

  function applyWon(finalValueLakhs: number) {
    if (!pendingMove) return;
    setCards((prev) => prev.map((c) => c.id === pendingMove.leadId ? { ...c, status: "Won", valueLakhs: finalValueLakhs } : c));
    setPendingMove(null);
  }

  const visibleNames = new Set(employeeOptions.map((u) => u.name));
  const scopedCards = currentUser.role === "Super Admin" ? cards : cards.filter((c) => visibleNames.has(c.salesEngineer));
  const displayCards = filterEmployee ? scopedCards.filter((c) => c.salesEngineer === filterEmployee) : scopedCards;

  const totalValue = displayCards.filter(c => c.status !== "Lost").reduce((s, c) => s + c.valueLakhs, 0);
  const wonValue = displayCards.filter(c => c.status === "Won").reduce((s, c) => s + c.valueLakhs, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center gap-4 flex-shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-slate-900">Lead Pipeline</h1>
          <p className="text-[11px] text-slate-400">Kanban view · Drag cards to move stages</p>
        </div>
        <div className="flex-1" />
        <select
          value={filterEmployee}
          onChange={(e) => setFilterEmployee(e.target.value)}
          className="text-xs border border-slate-200 rounded px-2 py-1.5 bg-slate-50 text-slate-600 focus:outline-none max-w-[180px]"
        >
          <option value="">All Employees</option>
          {employeeOptions.map((u) => (
            <option key={u.id} value={u.name}>{u.name} — {u.status}</option>
          ))}
        </select>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Active Pipeline: <span className="font-mono font-semibold text-slate-900 ml-1">₹{totalValue.toFixed(1)}L</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Won YTD: <span className="font-mono font-semibold text-slate-900 ml-1">₹{wonValue.toFixed(1)}L</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            Total Leads: <span className="font-mono font-semibold text-slate-900 ml-1">{displayCards.length}</span>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-3 p-4 h-full" style={{ minWidth: `${PIPELINE_STAGES.length * 230}px` }}>
          {PIPELINE_STAGES.map((stage) => {
            const stageCards = displayCards.filter((c) => c.status === stage);
            const stageValue = stageCards.reduce((s, c) => s + c.valueLakhs, 0);
            const cfg = STATUS_CONFIG[stage];
            const isDragTarget = dragOver === stage;

            return (
              <div
                key={stage}
                className="flex flex-col w-52 flex-shrink-0"
                onDragOver={(e) => { e.preventDefault(); setDragOver(stage); }}
                onDrop={() => handleDrop(stage)}
                onDragLeave={() => setDragOver(null)}
              >
                {/* Column Header */}
                <div className={`flex-shrink-0 bg-white rounded-t-md border-t-2 border-x border-slate-200 px-3 py-2.5 ${STAGE_COLORS[stage]}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-semibold ${cfg.color}`}>{stage}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                      {stageCards.length}
                    </span>
                  </div>
                  {stageCards.length > 0 && (
                    <div className="font-mono text-[10px] text-slate-400 mt-0.5">₹{stageValue.toFixed(1)}L</div>
                  )}
                </div>

                {/* Cards */}
                <div
                  className={`flex-1 overflow-y-auto rounded-b-md border border-t-0 border-slate-200 p-2 space-y-2 transition-colors ${
                    isDragTarget ? "bg-[#eef0f9]/80 border-[#7B8FCC]" : "bg-slate-50/60"
                  }`}
                  style={{ minHeight: 200 }}
                >
                  {stageCards.map((card) => (
                    <KanbanCard
                      key={card.id}
                      card={card}
                      onDragStart={() => handleDragStart(card.id)}
                      onClick={() => onLeadClick(card.id)}
                    />
                  ))}
                  {stageCards.length === 0 && (
                    <div className={`flex items-center justify-center h-16 text-[11px] text-slate-400 border-2 border-dashed rounded ${isDragTarget ? "border-blue-300 text-blue-400" : "border-slate-200"}`}>
                      {isDragTarget ? "Drop here" : "No leads"}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {pendingMove && pendingLead && pendingMove.targetStatus !== "Won" && (
        <StatusChangeModal
          lead={pendingLead}
          targetStatus={pendingMove.targetStatus}
          onCancel={() => setPendingMove(null)}
          onConfirm={applyStatusChange}
        />
      )}
      {pendingMove && pendingLead && pendingMove.targetStatus === "Won" && (
        <WonModal
          lead={pendingLead}
          onCancel={() => setPendingMove(null)}
          onConfirm={applyWon}
        />
      )}
    </div>
  );
}

function KanbanCard({
  card, onDragStart, onClick,
}: {
  card: Lead; onDragStart: () => void; onClick: () => void;
}) {
  const isHighValue = card.valueLakhs >= 50;
  const isOverdue = card.nextFollowUp && card.nextFollowUp < new Date().toISOString().slice(0, 10);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={`bg-white rounded border cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow text-xs select-none ${
        isHighValue ? "border-amber-200" : "border-slate-200"
      }`}
    >
      {isHighValue && (
        <div className="bg-amber-50 text-amber-700 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 border-b border-amber-100 rounded-t">
          High Value
        </div>
      )}
      <div className="p-2.5">
        <div className="font-medium text-slate-800 text-[11px] leading-tight mb-2 line-clamp-2">
          {card.projectName}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <span>👤</span> {card.salesEngineer.split(" ")[0]}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <span>🏢</span> <span className="truncate">{card.clientName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <span>❄️</span> {card.systemType} · {card.capacity}{card.capacityUnit}
          </div>
        </div>

        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100">
          <span className="font-mono font-semibold text-slate-900">₹{card.valueLakhs}L</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
            card.probability >= 70 ? "bg-green-50 text-green-700" :
            card.probability >= 40 ? "bg-amber-50 text-amber-700" :
            "bg-slate-100 text-slate-500"
          }`}>
            {card.probability}%
          </span>
        </div>

        {card.nextFollowUp && (
          <div className={`flex items-center gap-1 mt-1.5 text-[10px] font-mono ${isOverdue ? "text-red-500" : "text-slate-400"}`}>
            {isOverdue ? "⚠️" : "📅"} {card.nextFollowUp}
          </div>
        )}
      </div>
    </div>
  );
}
