import { useState } from "react";
import { leads, STATUS_CONFIG, ACTIVITY_ICONS, PIPELINE_STAGES } from "../data/crmData";
import type { Lead, LeadStatus, Activity } from "../data/crmData";
import { USERS } from "../data/usersData";
import { useAppData } from "../context/AppDataContext";
import type { ProjectUpdatePhoto, Payment, LeadDocument } from "../context/AppDataContext";
import StatusChangeModal from "./shared/StatusChangeModal";
import WonModal from "./shared/WonModal";
import PaymentModal from "./shared/PaymentModal";
import FileUploadButton from "./shared/FileUploadButton";
import { formatDate } from "../utils/formatDate";
import { formatRupees, lakhsToRupees } from "../utils/formatCurrency";

function csvCell(value: string): string {
  if (/[",\r\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function monthLabel(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Unknown";
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function exportProjectReport(lead: Lead, updates: ProjectUpdatePhoto[], payments: Payment[]) {
  const rows: string[][] = [];

  rows.push(["Project Report", lead.projectName]);
  rows.push(["Client", lead.clientName]);
  rows.push(["Sales Engineer", lead.salesEngineer]);
  rows.push(["Status", lead.status]);
  rows.push(["Value (₹ Lakhs)", String(lead.valueLakhs)]);
  rows.push(["System", `${lead.systemType} · ${lead.capacity}${lead.capacityUnit}`]);
  rows.push(["Location", lead.location]);
  rows.push([]);

  const monthKeys = new Set<string>();
  for (const u of updates) monthKeys.add(monthLabel(u.date));
  for (const p of payments) monthKeys.add(monthLabel(p.date));
  const sortedMonths = [...monthKeys].sort(
    (a, b) => new Date(`01 ${a}`).getTime() - new Date(`01 ${b}`).getTime()
  );

  rows.push(["Monthly Summary — Year to Date"]);
  rows.push(["Month", "Site Updates Logged", "Photos Uploaded", "Payments Received (₹L)"]);
  for (const month of sortedMonths) {
    const monthUpdates = updates.filter((u) => monthLabel(u.date) === month);
    const monthPayments = payments.filter((p) => monthLabel(p.date) === month);
    rows.push([
      month,
      String(monthUpdates.length),
      String(monthUpdates.length),
      monthPayments.reduce((s, p) => s + p.amount, 0).toFixed(2),
    ]);
  }
  rows.push([]);

  rows.push(["Daily Work Log"]);
  rows.push(["Date", "Engineer", "Update", "Photo"]);
  const sortedUpdates = [...updates].sort((a, b) => (a.date < b.date ? -1 : 1));
  for (const u of sortedUpdates) {
    rows.push([formatDate(u.date), u.engineerName, u.caption ?? "", u.imageName]);
  }

  if (payments.length > 0) {
    rows.push([]);
    rows.push(["Payment Ledger"]);
    rows.push(["Date", "Method", "Amount (₹L)", "Note"]);
    const sortedPayments = [...payments].sort((a, b) => (a.date < b.date ? -1 : 1));
    for (const p of sortedPayments) {
      rows.push([formatDate(p.date), p.method, String(p.amount), p.note ?? ""]);
    }
  }

  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${lead.projectName.replace(/[^a-z0-9]+/gi, "-")}_report.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function LeadDetail({ leadId, onBack }: { leadId: string; onBack: () => void }) {
  const {
    currentUser, paidTotalForLead, paymentsForLead, documentsForLead, addNotification,
    assignProject, assignmentForLead, projectUpdatesForLead, addProjectUpdate,
  } = useAppData();
  const [lead, setLead] = useState<Lead | undefined>(() => leads.find((l) => l.id === leadId));
  const [activeTab, setActiveTab] = useState<"timeline" | "details" | "notes" | "updates" | "payments">("timeline");
  const [noteText, setNoteText] = useState("");
  const [activityType, setActivityType] = useState<Activity["type"]>("Note");
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpType, setFollowUpType] = useState("Call");
  const [followUpNote, setFollowUpNote] = useState("");
  const [pendingStatus, setPendingStatus] = useState<LeadStatus | null>(null);
  const [showWonModal, setShowWonModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  if (!lead) return <div className="p-6 text-slate-500">Lead not found</div>;

  function updateLead(patch: Partial<Lead>) {
    setLead((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  const cfg = STATUS_CONFIG[lead.status];
  const stageIdx = PIPELINE_STAGES.indexOf(lead.status);
  const paidTotal = paidTotalForLead(lead.id);
  const remaining = Math.max(lead.valueLakhs - paidTotal, 0);
  const payments = paymentsForLead(lead.id);
  const documents = documentsForLead(lead.id);
  const assignment = assignmentForLead(lead.id);
  const updates = projectUpdatesForLead(lead.id);
  const managers = USERS.filter((u) => u.role === "Sales Manager");

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Panel */}
      <div className="w-72 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
        {/* Back + Header */}
        <div className="p-4 border-b border-slate-100">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-3 transition-colors"
          >
            <span>←</span> Back to Leads
          </button>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm flex-shrink-0">
              {lead.projectName[0]}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 leading-tight">{lead.projectName}</h2>
              <div className="text-[11px] text-slate-400 mt-0.5">{lead.clientName}</div>
            </div>
          </div>
          <div className="mt-3">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${cfg.bg} ${cfg.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {lead.status}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-0 border-b border-slate-100">
          <InfoCell label="Value" value={`₹${lead.valueLakhs}L`} mono />
          <InfoCell label="Probability" value={`${lead.probability}%`} mono />
          <InfoCell label="System" value={lead.systemType} />
          <InfoCell label="Capacity" value={`${lead.capacity}${lead.capacityUnit}`} mono />
        </div>

        {/* Details */}
        <div className="p-4 space-y-3 border-b border-slate-100 text-xs">
          <DetailRow label="Sales Engineer" value={lead.salesEngineer} />
          <DetailRow label="Lead Owner" value={lead.leadOwner} />
          <DetailRow label="Application" value={lead.application} />
          <DetailRow label="Location" value={lead.location} />
          <DetailRow label="Client Type" value={lead.clientType} />
          <DetailRow label="Enquiry Source" value={lead.enquirySource} />
          <DetailRow label="Source Contact" value={lead.sourceName} />
        </div>

        {/* Dates */}
        <div className="p-4 space-y-3 border-b border-slate-100 text-xs">
          <DetailRow label="Enquiry Date" value={formatDate(lead.enquiryDate)} mono />
          <DetailRow label="Expected Booking" value={lead.expectedBookingDate ? formatDate(lead.expectedBookingDate) : "—"} mono />
          <DetailRow label="Next Follow-up" value={lead.nextFollowUp ? formatDate(lead.nextFollowUp) : "—"} mono highlight={!!lead.nextFollowUp && lead.nextFollowUp < new Date().toISOString().slice(0, 10)} />
          <DetailRow label="Last Activity" value={formatDate(lead.lastActivity)} mono />
        </div>

        {/* Contact */}
        <div className="p-4 text-xs">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Client Contact</div>
          <div className="font-medium text-slate-700">{lead.clientContact}</div>
          <div className="text-slate-500 mt-0.5">{lead.clientEmail}</div>
        </div>

        {/* Payment Progress — Won leads only; full ledger lives in the Payment History tab */}
        {lead.status === "Won" && (
          <button
            onClick={() => setActiveTab("payments")}
            className="p-4 border-t border-slate-100 text-xs text-left hover:bg-slate-50"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Payment Progress</div>
              <span className="text-[10px] font-semibold text-[#253580]">View History →</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#39B849]"
                style={{ width: `${lead.valueLakhs > 0 ? Math.min((paidTotal / lead.valueLakhs) * 100, 100) : 0}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-[11px]">
              <span className="text-slate-500">Paid <span className="font-mono font-semibold text-slate-800">{formatRupees(lakhsToRupees(paidTotal))}</span></span>
              <span className="text-slate-500">
                {remaining > 0 ? "Due" : "Balance"} <span className={`font-mono font-semibold ${remaining > 0 ? "text-red-600" : "text-slate-800"}`}>{formatRupees(lakhsToRupees(remaining))}</span>
              </span>
            </div>
          </button>
        )}

        {/* Quick Actions */}
        <div className="p-4 border-t border-slate-100 mt-auto space-y-2">
          {lead.status === "Won" && (
            <button
              onClick={() => setShowPaymentModal(true)}
              disabled={remaining <= 0}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-white rounded py-1.5 disabled:opacity-40"
              style={{ background: "#39B849" }}
            >
              💳 Record Payment
            </button>
          )}
          <button className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-white rounded py-1.5" style={{ background: "#253580" }}>
            📞 Add Call
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button className="text-xs font-medium text-slate-600 border border-slate-200 rounded py-1.5 hover:bg-slate-50">📅 Schedule</button>
            <button className="text-xs font-medium text-slate-600 border border-slate-200 rounded py-1.5 hover:bg-slate-50">📄 Quote</button>
          </div>
          <button
            onClick={() => setShowFollowUpModal(true)}
            className="w-full text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded py-1.5 hover:bg-amber-100"
          >
            🔔 Schedule Follow-up
          </button>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Pipeline Progress */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
          <div className="text-xs font-medium text-slate-500 mb-3">Pipeline Stage</div>
          <div className="flex items-center gap-0">
            {PIPELINE_STAGES.map((s, i) => {
              const passed = i < stageIdx;
              const active = i === stageIdx;
              const future = i > stageIdx;
              return (
                <div key={s} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${
                        active ? "text-white ring-2 ring-blue-200" :
                        passed ? "bg-green-500 text-white" :
                        "bg-slate-200 text-slate-400"
                      }`}
                      style={active ? { background: "#253580" } : {}}
                    >
                      {passed ? "✓" : i + 1}
                    </div>
                    <div className={`text-[9px] mt-1 text-center leading-tight max-w-[52px] ${
                      active ? "text-[#253580] font-semibold" : passed ? "text-green-600" : "text-slate-400"
                    }`}>
                      {s}
                    </div>
                  </div>
                  {i < PIPELINE_STAGES.length - 1 && (
                    <div className={`flex-1 h-0.5 mt-[-14px] mx-1 ${passed ? "bg-green-400" : "bg-slate-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-slate-200 px-6 flex items-center gap-5 flex-shrink-0">
          {(lead.status === "Won"
            ? (["timeline", "details", "notes", "updates", "payments"] as const)
            : (["timeline", "details", "notes"] as const)
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-xs font-semibold capitalize border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-[#253580] text-[#253580]"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab === "timeline" ? "Activity Timeline" : tab === "details" ? "Full Details" : tab === "notes" ? "Notes & Tasks" : tab === "updates" ? "Project Updates" : "Payment History"}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2 pb-1">
            <button
              onClick={() => exportProjectReport(lead, updates, payments)}
              className="text-xs font-semibold text-slate-600 px-3 py-1 rounded border border-slate-200 hover:bg-slate-50"
            >
              📊 Export Report
            </button>
            {lead.status !== "Won" && (
              <button
                onClick={() => setShowWonModal(true)}
                className="text-xs font-semibold text-white px-3 py-1 rounded"
                style={{ background: "#39B849" }}
              >
                🏆 Mark as Won
              </button>
            )}
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) setPendingStatus(e.target.value as LeadStatus);
              }}
              className="text-xs border border-slate-200 rounded px-2 py-1 bg-slate-50 focus:outline-none"
            >
              <option value="">Change Status</option>
              {PIPELINE_STAGES.filter((s) => s !== "Won" && s !== lead.status).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "timeline" && (
            <div>
              {/* Add Note */}
              <div className="bg-white rounded-md border border-slate-200 p-4 mb-5">
                <div className="text-xs font-medium text-slate-700 mb-2">Add Activity</div>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note, call summary, or update…"
                  rows={3}
                  className="w-full text-xs border border-slate-200 rounded p-2.5 resize-none focus:outline-none focus:border-blue-400 text-slate-700 placeholder-slate-400"
                />
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex gap-1.5">
                    {(["Call", "Site Visit", "Note", "Quotation", "Follow-up"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setActivityType(type)}
                        className={`text-[11px] px-2 py-1 border rounded hover:bg-slate-50 ${
                          activityType === type ? "border-[#253580] text-[#253580] bg-[#eef0f9]" : "border-slate-200 text-slate-600"
                        }`}
                      >
                        {ACTIVITY_ICONS[type]} {type}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      if (!noteText.trim()) return;
                      const activity: Activity = {
                        id: `n${Date.now()}`,
                        type: activityType,
                        date: new Date().toISOString().slice(0, 10),
                        description: noteText,
                        by: currentUser.name,
                      };
                      updateLead({ activities: [...lead.activities, activity], lastActivity: activity.date });
                      addNotification(`New ${activityType.toLowerCase()} logged on ${lead.projectName}: ${noteText}`);
                      setNoteText("");
                    }}
                    disabled={!noteText.trim()}
                    className="ml-auto text-xs font-semibold text-white px-3 py-1.5 rounded disabled:opacity-40"
                    style={{ background: "#253580" }}
                  >
                    Log Activity
                  </button>
                </div>
              </div>

              {/* Timeline */}
              <div className="relative">
                <div className="absolute left-[18px] top-0 bottom-0 w-px bg-slate-200" />
                <div className="space-y-4">
                  {[...lead.activities].reverse().map((act) => (
                    <div key={act.id} className="flex gap-4 relative">
                      <div className="w-9 h-9 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-base flex-shrink-0 z-10">
                        {ACTIVITY_ICONS[act.type]}
                      </div>
                      <div className="flex-1 bg-white rounded-md border border-slate-100 p-3 hover:border-slate-200 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-slate-800">{act.type}</span>
                          <span className="text-[10px] text-slate-400">·</span>
                          <span className="font-mono text-[11px] text-slate-400">{formatDate(act.date)}</span>
                          <span className="text-[10px] text-slate-400">·</span>
                          <span className="text-[11px] text-slate-500">{act.by}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{act.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "details" && (
            <div className="grid grid-cols-2 gap-4">
              <DetailCard title="Project Information">
                <DetailRow label="Project Name" value={lead.projectName} />
                <DetailRow label="Application" value={lead.application} />
                <DetailRow label="System Type" value={lead.systemType} />
                <DetailRow label="Capacity" value={`${lead.capacity} ${lead.capacityUnit}`} mono />
                <DetailRow label="Estimated Value" value={`₹${lead.valueLakhs} Lakhs`} mono />
                <DetailRow label="Location" value={lead.location} />
              </DetailCard>
              <DetailCard title="Client Information">
                <DetailRow label="Client Name" value={lead.clientName} />
                <DetailRow label="Client Type" value={lead.clientType} />
                <DetailRow label="Contact Person" value={lead.clientContact} />
                <DetailRow label="Email" value={lead.clientEmail} />
                <DetailRow label="Enquiry Source" value={lead.enquirySource} />
                <DetailRow label="Source / Referral" value={lead.sourceName} />
              </DetailCard>
              <DetailCard title="Sales Information">
                <DetailRow label="Sales Engineer" value={lead.salesEngineer} />
                <DetailRow label="Lead Owner" value={lead.leadOwner} />
                <DetailRow label="Current Stage" value={lead.status} />
                <DetailRow label="Probability" value={`${lead.probability}%`} mono />
              </DetailCard>
              <DetailCard title="Timeline">
                <DetailRow label="Enquiry Received" value={formatDate(lead.enquiryDate)} mono />
                <DetailRow label="Expected Booking" value={lead.expectedBookingDate ? formatDate(lead.expectedBookingDate) : "Not set"} mono />
                <DetailRow label="Next Follow-up" value={lead.nextFollowUp ? formatDate(lead.nextFollowUp) : "Not set"} mono />
                <DetailRow label="Last Activity" value={formatDate(lead.lastActivity)} mono />
              </DetailCard>
              {lead.remarks && (
                <div className="col-span-2 bg-white rounded-md border border-slate-200 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Remarks</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{lead.remarks}</p>
                </div>
              )}

              <div className="col-span-2 bg-white rounded-md border border-slate-200 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Documents</div>
                {documents.length === 0 && <p className="text-xs text-slate-400">No documents attached yet.</p>}
                {documents.length > 0 && (
                  <div className="space-y-1.5">
                    {documents.map((d) => (
                      <div key={d.id} className="flex items-center justify-between text-xs border-b border-slate-50 last:border-0 py-1.5">
                        <div className="flex items-center gap-2">
                          <span>📎</span>
                          <span className="font-medium text-slate-700">{d.name}</span>
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{d.category}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{formatDate(d.uploadedAt)} · {d.uploadedBy}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {lead.status === "Won" && (
                <AssignmentPanel
                  managers={managers}
                  assignment={assignment}
                  currentUserRole={currentUser.role}
                  onAssign={(managerId, staffIds) => {
                    assignProject(lead.id, managerId, staffIds);
                    addNotification(`You've been assigned to ${lead.projectName}`, managerId);
                    staffIds?.forEach((id) => addNotification(`You've been assigned to ${lead.projectName}`, id));
                  }}
                />
              )}
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-700">Tasks & Follow-ups</h3>
                <button
                  onClick={() => setShowFollowUpModal(true)}
                  className="text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded hover:bg-blue-100"
                >
                  + Schedule Follow-up
                </button>
              </div>
              <div className="bg-white rounded-md border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="rounded" />
                  <div>
                    <div className="text-xs font-medium text-slate-800">Follow-up call — price decision</div>
                    <div className="text-[11px] text-slate-400 font-mono">{formatDate(lead.nextFollowUp)}</div>
                  </div>
                  <span className="ml-auto text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-medium">Upcoming</span>
                </div>
              </div>
              <div className="bg-white rounded-md border border-slate-100 p-4 opacity-60">
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked className="rounded" readOnly />
                  <div>
                    <div className="text-xs font-medium text-slate-800 line-through">Send technical specifications</div>
                    <div className="text-[11px] text-slate-400 font-mono">{formatDate(lead.enquiryDate)}</div>
                  </div>
                  <span className="ml-auto text-[11px] text-green-600 bg-green-50 px-2 py-0.5 rounded font-medium">Done</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "updates" && lead.status === "Won" && (
            <ProjectUpdatesTab
              leadId={lead.id}
              updates={updates}
              engineerName={currentUser.name}
              onAdd={(update) => addProjectUpdate(update)}
            />
          )}

          {activeTab === "payments" && lead.status === "Won" && (
            <PaymentHistoryTab
              lead={lead}
              payments={payments}
              documents={documents}
              paidTotal={paidTotal}
              remaining={remaining}
              onRecordPayment={() => setShowPaymentModal(true)}
            />
          )}
        </div>
      </div>

      {showFollowUpModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-80 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Schedule Follow-up</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Type</label>
                <select
                  value={followUpType}
                  onChange={(e) => setFollowUpType(e.target.value)}
                  className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400"
                >
                  <option>Call</option><option>Meeting</option><option>Site Visit</option><option>Email</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Note</label>
                <textarea
                  value={followUpNote}
                  onChange={(e) => setFollowUpNote(e.target.value)}
                  rows={2}
                  className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowFollowUpModal(false)} className="flex-1 text-xs text-slate-600 border border-slate-200 rounded py-1.5 hover:bg-slate-50">Cancel</button>
              <button
                onClick={() => {
                  if (!followUpDate) return;
                  updateLead({ nextFollowUp: followUpDate });
                  addNotification(`Follow-up (${followUpType}) scheduled on ${lead.projectName} for ${followUpDate}${followUpNote ? ": " + followUpNote : ""}`);
                  setShowFollowUpModal(false);
                  setFollowUpDate("");
                  setFollowUpNote("");
                }}
                disabled={!followUpDate}
                className="flex-1 text-xs font-semibold text-white rounded py-1.5 disabled:opacity-40"
                style={{ background: "#253580" }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingStatus && (
        <StatusChangeModal
          lead={lead}
          targetStatus={pendingStatus}
          onCancel={() => setPendingStatus(null)}
          onConfirm={(newStatus) => {
            updateLead({ status: newStatus });
            setPendingStatus(null);
            if (activeTab === "updates" || activeTab === "payments") setActiveTab("timeline");
          }}
        />
      )}

      {showWonModal && (
        <WonModal
          lead={lead}
          onCancel={() => setShowWonModal(false)}
          onConfirm={(finalValueLakhs, startDate, endDate) => {
            updateLead({ status: "Won", valueLakhs: finalValueLakhs, projectStartDate: startDate, projectEndDate: endDate });
            setShowWonModal(false);
          }}
        />
      )}

      {showPaymentModal && (
        <PaymentModal
          lead={lead}
          alreadyPaid={paidTotal}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
}

function AssignmentPanel({
  managers, assignment, currentUserRole, onAssign,
}: {
  managers: { id: string; name: string }[];
  assignment: { managerId: string; staffIds?: string[] } | undefined;
  currentUserRole: string;
  onAssign: (managerId: string, staffIds?: string[]) => void;
}) {
  const [selectedManager, setSelectedManager] = useState(assignment?.managerId ?? "");
  const [selectedStaff, setSelectedStaff] = useState<string[]>(assignment?.staffIds ?? []);
  const staffOptions = USERS.filter((u) => u.managerId === selectedManager);

  if (currentUserRole !== "Super Admin" && !assignment) return null;

  function toggleStaff(id: string) {
    setSelectedStaff((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  return (
    <div className="col-span-2 bg-white rounded-md border border-slate-200 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Project Assignment</div>
      {assignment && (
        <div className="text-xs text-slate-600 mb-3">
          Assigned to <span className="font-medium">{USERS.find((u) => u.id === assignment.managerId)?.name ?? "—"}</span>
          {assignment.staffIds && assignment.staffIds.length > 0 && (
            <> → <span className="font-medium">
              {assignment.staffIds.map((id) => USERS.find((u) => u.id === id)?.name ?? "—").join(", ")}
            </span></>
          )}
        </div>
      )}
      {currentUserRole === "Super Admin" && (
        <div className="grid grid-cols-2 gap-3 items-start">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Manager</label>
            <select
              value={selectedManager}
              onChange={(e) => { setSelectedManager(e.target.value); setSelectedStaff([]); }}
              className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400"
            >
              <option value="">Select manager…</option>
              {managers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Staff / Engineer (select multiple)</label>
            <div className={`border border-slate-200 rounded p-2 space-y-1 max-h-32 overflow-y-auto ${!selectedManager ? "opacity-40" : ""}`}>
              {!selectedManager && <div className="text-[11px] text-slate-400">Select a manager first</div>}
              {selectedManager && staffOptions.length === 0 && (
                <div className="text-[11px] text-slate-400">No staff under this manager</div>
              )}
              {staffOptions.map((s) => (
                <label key={s.id} className="flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={selectedStaff.includes(s.id)}
                    onChange={() => toggleStaff(s.id)}
                    disabled={!selectedManager}
                  />
                  {s.name} <span className="text-[10px] text-slate-400">({s.role})</span>
                </label>
              ))}
            </div>
          </div>
          <button
            onClick={() => onAssign(selectedManager, selectedStaff.length > 0 ? selectedStaff : undefined)}
            disabled={!selectedManager}
            className="col-span-2 text-xs font-semibold text-white rounded py-1.5 disabled:opacity-40"
            style={{ background: "#253580" }}
          >
            {assignment ? "Update Assignment" : "Assign Project"}
          </button>
        </div>
      )}
    </div>
  );
}

function InfoCell({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="p-3 border-r border-b border-slate-100 last:border-r-0">
      <div className="text-[10px] text-slate-400 mb-0.5">{label}</div>
      <div className={`text-sm font-semibold text-slate-900 ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}

function DetailRow({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="flex justify-between gap-2 py-1.5 border-b border-slate-50 last:border-0">
      <span className="text-slate-400 flex-shrink-0">{label}</span>
      <span className={`font-medium text-right ${mono ? "font-mono" : ""} ${highlight ? "text-red-600" : "text-slate-800"}`}>{value}</span>
    </div>
  );
}

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-md border border-slate-200 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">{title}</div>
      <div className="text-xs space-y-0">{children}</div>
    </div>
  );
}

function PaymentHistoryTab({
  lead, payments, documents, paidTotal, remaining, onRecordPayment,
}: {
  lead: Lead;
  payments: Payment[];
  documents: LeadDocument[];
  paidTotal: number;
  remaining: number;
  onRecordPayment: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const isFullyPaid = remaining <= 0;
  const timelineEnded = !!lead.projectEndDate && lead.projectEndDate < today;

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-md border border-slate-200 p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Project Value</div>
          <div className="font-mono font-semibold text-sm text-slate-900">{formatRupees(lakhsToRupees(lead.valueLakhs))}</div>
        </div>
        <div className="bg-white rounded-md border border-slate-200 p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Paid Till Now</div>
          <div className="font-mono font-semibold text-sm text-green-700">{formatRupees(lakhsToRupees(paidTotal))}</div>
        </div>
        <div className="bg-white rounded-md border border-slate-200 p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{isFullyPaid ? "Balance" : "Amount Due"}</div>
          <div className={`font-mono font-semibold text-sm ${isFullyPaid ? "text-slate-500" : "text-red-600"}`}>{formatRupees(lakhsToRupees(remaining))}</div>
        </div>
        <div className="bg-white rounded-md border border-slate-200 p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Project Timeline</div>
          <div className="font-mono font-semibold text-[11px] text-slate-700">
            {lead.projectStartDate ? formatDate(lead.projectStartDate) : "—"} → {lead.projectEndDate ? formatDate(lead.projectEndDate) : "—"}
          </div>
        </div>
      </div>

      {/* Status banner */}
      {isFullyPaid ? (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-md px-4 py-2.5 text-xs font-medium">
          ✅ Fully Paid — no balance remaining on this project.
        </div>
      ) : timelineEnded ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-2.5 text-xs font-medium">
          ⚠️ Project completed on {formatDate(lead.projectEndDate!)} but {formatRupees(lakhsToRupees(remaining))} is still due.
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-md px-4 py-2.5 text-xs font-medium">
          🕒 Project in progress — {formatRupees(lakhsToRupees(remaining))} due{lead.projectEndDate ? ` by ${formatDate(lead.projectEndDate)}` : ""}.
        </div>
      )}

      {/* Installment ledger */}
      <div className="bg-white rounded-md border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold text-slate-700">Installment History</div>
          <button
            onClick={onRecordPayment}
            disabled={isFullyPaid}
            className="text-xs font-semibold text-white px-3 py-1.5 rounded disabled:opacity-40"
            style={{ background: "#39B849" }}
          >
            + Record Payment
          </button>
        </div>

        {payments.length === 0 && (
          <div className="text-center text-xs text-slate-400 py-8">No installments recorded yet.</div>
        )}

        {payments.length > 0 && (
          <div className="space-y-2">
            {payments.map((p) => {
              const doc = p.documentId ? documents.find((d) => d.id === p.documentId) : undefined;
              return (
                <div key={p.id} className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded px-3 py-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base flex-shrink-0">{p.method === "Cash" ? "💵" : "🏦"}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-sm text-slate-900">{formatRupees(lakhsToRupees(p.amount))}</span>
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{p.method}</span>
                      </div>
                      {p.note && <div className="text-[11px] text-slate-500 truncate mt-0.5">{p.note}</div>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[11px] text-slate-400 font-mono">{formatDate(p.date)}</div>
                    {doc && <div className="text-[10px] text-blue-600 mt-0.5">📎 {doc.name}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectUpdatesTab({
  leadId, updates, engineerName, onAdd,
}: {
  leadId: string;
  updates: ProjectUpdatePhoto[];
  engineerName: string;
  onAdd: (update: Omit<ProjectUpdatePhoto, "id">) => void;
}) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [file, setFile] = useState<File | null>(null);
  const [attachmentName, setAttachmentName] = useState("");
  const [caption, setCaption] = useState("");

  const byDate = new Map<string, ProjectUpdatePhoto[]>();
  for (const u of updates) {
    if (!byDate.has(u.date)) byDate.set(u.date, []);
    byDate.get(u.date)!.push(u);
  }
  const datesOldestFirst = [...byDate.keys()].sort((a, b) => (a < b ? -1 : 1));
  const dayNumberByDate = new Map(datesOldestFirst.map((d, i) => [d, i + 1]));
  const sortedDates = [...datesOldestFirst].reverse();

  function handleAdd() {
    if (!file) return;
    onAdd({
      leadId,
      imageName: attachmentName.trim() || file.name,
      previewUrl: URL.createObjectURL(file),
      date,
      engineerName,
      caption: caption || undefined,
    });
    setFile(null);
    setAttachmentName("");
    setCaption("");
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-md border border-slate-200 p-4">
        <div className="text-xs font-medium text-slate-700 mb-2">Add Site Update</div>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-xs border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:border-blue-400"
          />
          <div className="col-span-2">
            <FileUploadButton file={file} onChange={setFile} name={attachmentName} onNameChange={setAttachmentName} label="Upload Site Photo" accept="image/*" />
          </div>
        </div>
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Caption (optional)"
          className="w-full mt-2 text-xs border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:border-blue-400"
        />
        <button
          onClick={handleAdd}
          disabled={!file}
          className="mt-2 text-xs font-semibold text-white px-3 py-1.5 rounded disabled:opacity-40"
          style={{ background: "#253580" }}
        >
          Add Update
        </button>
      </div>

      {sortedDates.length === 0 && (
        <div className="text-center text-xs text-slate-400 py-10">No site updates logged yet.</div>
      )}

      {sortedDates.length > 0 && (
        <div className="relative">
          <div className="absolute left-[21px] top-2 bottom-2 w-px bg-slate-200" />
          <div className="space-y-6">
            {sortedDates.map((d) => {
              const dayUpdates = byDate.get(d)!;
              return (
                <div key={d} className="flex gap-4 relative">
                  <div className="w-11 h-11 rounded-full bg-white border-2 border-[#253580] flex items-center justify-center text-[10px] font-bold text-[#253580] flex-shrink-0 z-10">
                    Day {dayNumberByDate.get(d)}
                  </div>
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-slate-800 font-mono">{formatDate(d)}</span>
                      <span className="text-[10px] text-slate-400">· {dayUpdates.length} photo{dayUpdates.length === 1 ? "" : "s"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {dayUpdates.map((u) => (
                        <div key={u.id} className="bg-white rounded-md border border-slate-200 overflow-hidden hover:shadow-sm transition-shadow">
                          <img src={u.previewUrl} alt={u.imageName} className="w-full h-32 object-cover" />
                          <div className="p-2.5">
                            <div className="text-[11px] font-medium text-slate-800 truncate">{u.imageName}</div>
                            {u.caption && <p className="text-[11px] text-slate-500 mt-1 leading-snug">{u.caption}</p>}
                            <div className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-400">
                              <span>👷</span> {u.engineerName}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
