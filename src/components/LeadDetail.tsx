import { useState } from "react";
import { leads, STATUS_CONFIG, ACTIVITY_ICONS, PIPELINE_STAGES } from "../data/crmData";
import type { LeadStatus } from "../data/crmData";

export default function LeadDetail({ leadId, onBack }: { leadId: string; onBack: () => void }) {
  const lead = leads.find((l) => l.id === leadId);
  const [activeTab, setActiveTab] = useState<"timeline" | "details" | "notes">("timeline");
  const [noteText, setNoteText] = useState("");
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);

  if (!lead) return <div className="p-6 text-slate-500">Lead not found</div>;

  const cfg = STATUS_CONFIG[lead.status];
  const stageIdx = PIPELINE_STAGES.indexOf(lead.status);

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
          <DetailRow label="Enquiry Date" value={lead.enquiryDate} mono />
          <DetailRow label="Expected Booking" value={lead.expectedBookingDate || "—"} mono />
          <DetailRow label="Next Follow-up" value={lead.nextFollowUp || "—"} mono highlight={!!lead.nextFollowUp && lead.nextFollowUp < new Date().toISOString().slice(0, 10)} />
          <DetailRow label="Last Activity" value={lead.lastActivity} mono />
        </div>

        {/* Contact */}
        <div className="p-4 text-xs">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Client Contact</div>
          <div className="font-medium text-slate-700">{lead.clientContact}</div>
          <div className="text-slate-500 mt-0.5">{lead.clientEmail}</div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-t border-slate-100 mt-auto space-y-2">
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
          {(["timeline", "details", "notes"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-xs font-semibold capitalize border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-[#253580] text-[#253580]"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab === "timeline" ? "Activity Timeline" : tab === "details" ? "Full Details" : "Notes & Tasks"}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2 pb-1">
            <select className="text-xs border border-slate-200 rounded px-2 py-1 bg-slate-50 focus:outline-none">
              <option>Change Status</option>
              {PIPELINE_STAGES.map(s => <option key={s}>{s}</option>)}
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
                      <button key={type} className="text-[11px] px-2 py-1 border border-slate-200 rounded text-slate-600 hover:bg-slate-50">
                        {ACTIVITY_ICONS[type]} {type}
                      </button>
                    ))}
                  </div>
                  <button className="ml-auto text-xs font-semibold text-white px-3 py-1.5 rounded" style={{ background: "#253580" }}>
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
                          <span className="font-mono text-[11px] text-slate-400">{act.date}</span>
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
                <DetailRow label="Enquiry Received" value={lead.enquiryDate} mono />
                <DetailRow label="Expected Booking" value={lead.expectedBookingDate || "Not set"} mono />
                <DetailRow label="Next Follow-up" value={lead.nextFollowUp || "Not set"} mono />
                <DetailRow label="Last Activity" value={lead.lastActivity} mono />
              </DetailCard>
              {lead.remarks && (
                <div className="col-span-2 bg-white rounded-md border border-slate-200 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Remarks</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{lead.remarks}</p>
                </div>
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
                    <div className="text-[11px] text-slate-400 font-mono">{lead.nextFollowUp}</div>
                  </div>
                  <span className="ml-auto text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-medium">Upcoming</span>
                </div>
              </div>
              <div className="bg-white rounded-md border border-slate-100 p-4 opacity-60">
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked className="rounded" readOnly />
                  <div>
                    <div className="text-xs font-medium text-slate-800 line-through">Send technical specifications</div>
                    <div className="text-[11px] text-slate-400 font-mono">{lead.enquiryDate}</div>
                  </div>
                  <span className="ml-auto text-[11px] text-green-600 bg-green-50 px-2 py-0.5 rounded font-medium">Done</span>
                </div>
              </div>
            </div>
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
                <input type="date" className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Type</label>
                <select className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400">
                  <option>Call</option><option>Meeting</option><option>Site Visit</option><option>Email</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Note</label>
                <textarea rows={2} className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400 resize-none" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowFollowUpModal(false)} className="flex-1 text-xs text-slate-600 border border-slate-200 rounded py-1.5 hover:bg-slate-50">Cancel</button>
              <button className="flex-1 text-xs font-semibold text-white rounded py-1.5" style={{ background: "#253580" }}>Save</button>
            </div>
          </div>
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
