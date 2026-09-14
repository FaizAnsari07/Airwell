import { leads, STATUS_CONFIG } from "../../data/crmData";
import type { Lead } from "../../data/crmData";
import { USERS } from "../../data/usersData";
import type { User } from "../../data/usersData";
import { useAppData } from "../../context/AppDataContext";
import { formatDate } from "../../utils/formatDate";

export default function SalesEngineerDetailModal({
  user, onClose,
}: {
  user: User;
  onClose: () => void;
}) {
  const { paidTotalForLead } = useAppData();
  const manager = USERS.find((u) => u.id === user.managerId);

  const engineerLeads = leads.filter((l) => l.salesEngineer === user.name);
  const wonLeads = engineerLeads.filter((l) => l.status === "Won");
  const negotiationLeads = engineerLeads.filter((l) => l.status === "Negotiation");
  const lostLeads = engineerLeads.filter((l) => l.status === "Lost");
  const otherActiveLeads = engineerLeads.filter(
    (l) => l.status !== "Won" && l.status !== "Negotiation" && l.status !== "Lost"
  );

  const target = user.targetAmount ?? 0;
  const achieved = wonLeads.reduce((s, l) => s + l.valueLakhs, 0);
  const pipelineValue = [...negotiationLeads, ...otherActiveLeads].reduce((s, l) => s + l.valueLakhs, 0);
  const collection = engineerLeads.reduce((s, l) => s + paidTotalForLead(l.id), 0);
  const pct = target > 0 ? Math.round((achieved / target) * 100) : 0;
  const pctColor = pct >= 80 ? "text-green-600" : pct >= 60 ? "text-amber-600" : "text-red-600";

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[88vh] flex flex-col">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
              style={{ background: user.color }}
            >
              {user.initials}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">{user.name}</h3>
              <p className="text-[11px] text-slate-400">
                {user.role} · {manager ? `Reports to ${manager.name}` : "No manager assigned"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg leading-none">✕</button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KPI label="Target" value={`₹${target}L`} />
            <KPI label="Achieved" value={`₹${achieved}L`} valueClass={pctColor} />
            <KPI label="Pipeline" value={`₹${pipelineValue}L`} />
            <KPI label="Collection" value={`₹${collection}L`} />
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-500">Target Attainment</span>
              <span className={`font-mono font-semibold ${pctColor}`}>{pct}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${pct >= 80 ? "bg-green-500" : pct >= 60 ? "bg-amber-500" : "bg-red-400"}`}
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
          </div>

          <LeadGroupSection
            title={`Won Projects (${wonLeads.length})`}
            leads={wonLeads}
            dateLabel={(l) => `Booked ${formatDate(l.expectedBookingDate)}`}
          />
          <LeadGroupSection
            title={`In Negotiation (${negotiationLeads.length})`}
            leads={negotiationLeads}
            dateLabel={(l) => `Next follow-up ${formatDate(l.nextFollowUp)}`}
          />
          <LeadGroupSection
            title={`Other Active Leads (${otherActiveLeads.length})`}
            leads={otherActiveLeads}
            dateLabel={(l) => `Next follow-up ${formatDate(l.nextFollowUp)}`}
            showStatus
          />
          {lostLeads.length > 0 && (
            <LeadGroupSection
              title={`Lost (${lostLeads.length})`}
              leads={lostLeads}
              dateLabel={(l) => `Lost — ${formatDate(l.lastActivity)}`}
            />
          )}

          {engineerLeads.length === 0 && (
            <div className="text-center text-xs text-slate-400 py-8">
              No leads assigned to this sales engineer yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="bg-slate-50 rounded-md p-3">
      <div className="text-[10px] text-slate-400 mb-1">{label}</div>
      <div className={`font-mono text-sm font-bold ${valueClass ?? "text-slate-900"}`}>{value}</div>
    </div>
  );
}

function LeadGroupSection({
  title, leads: groupLeads, dateLabel, showStatus,
}: {
  title: string;
  leads: Lead[];
  dateLabel: (lead: Lead) => string;
  showStatus?: boolean;
}) {
  if (groupLeads.length === 0) return null;
  return (
    <div>
      <div className="text-[11px] font-semibold text-slate-700 mb-2">{title}</div>
      <div className="space-y-1.5">
        {groupLeads.map((l) => (
          <div key={l.id} className="flex items-center justify-between gap-3 border border-slate-200 rounded px-3 py-2">
            <div className="min-w-0">
              <div className="text-xs font-medium text-slate-800 truncate">{l.projectName}</div>
              <div className="text-[10.5px] text-slate-400 truncate">
                {l.clientName} · {l.application} · {l.capacity} {l.capacityUnit}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              {showStatus && (
                <span
                  className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded mb-1 ${STATUS_CONFIG[l.status].bg} ${STATUS_CONFIG[l.status].color}`}
                >
                  {l.status}
                </span>
              )}
              <div className="text-xs font-mono font-semibold text-slate-900">₹{l.valueLakhs}L</div>
              <div className="text-[10px] text-slate-400">{dateLabel(l)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
