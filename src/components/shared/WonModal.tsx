import { useState } from "react";
import type { Lead } from "../../data/crmData";
import { useAppData } from "../../context/AppDataContext";
import { USERS } from "../../data/usersData";

export default function WonModal({
  lead, onCancel, onConfirm,
}: {
  lead: Lead;
  onCancel: () => void;
  onConfirm: (finalValueLakhs: number, startDate: string, endDate: string) => void;
}) {
  const { addStatusChangeLog, addNotification, currentUser } = useAppData();
  const [finalValue, setFinalValue] = useState(String(lead.valueLakhs));
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState("");

  const superAdmin = USERS.find((u) => u.role === "Super Admin");
  const value = Number(finalValue) || 0;
  const canConfirm = value > 0 && startDate && endDate;

  function handleConfirm() {
    addStatusChangeLog({
      leadId: lead.id,
      fromStatus: lead.status,
      toStatus: "Won",
      note: `Won at ₹${value}L. Project start ${startDate}, end ${endDate}.`,
      changedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      changedBy: currentUser.name,
    });
    if (superAdmin) {
      addNotification(
        `${lead.projectName} was marked Won (₹${value}L) — assign it to a manager.`,
        superAdmin.id
      );
    }
    onConfirm(value, startDate, endDate);
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-green-700">🏆 Mark as Won</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{lead.projectName}</p>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Final Value (₹ Lakhs)</label>
            <input
              type="number"
              value={finalValue}
              onChange={(e) => setFinalValue(e.target.value)}
              className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-200">
          <button onClick={onCancel} className="px-4 py-1.5 text-xs text-slate-600 border border-slate-200 rounded hover:bg-slate-50">Cancel</button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="px-4 py-1.5 text-xs font-semibold text-white rounded disabled:opacity-40"
            style={{ background: "#39B849" }}
          >
            Confirm Won
          </button>
        </div>
      </div>
    </div>
  );
}
