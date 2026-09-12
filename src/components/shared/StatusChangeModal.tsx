import { useState } from "react";
import type { Lead, LeadStatus } from "../../data/crmData";
import { useAppData } from "../../context/AppDataContext";
import FileUploadButton from "./FileUploadButton";

export default function StatusChangeModal({
  lead, targetStatus, onCancel, onConfirm,
}: {
  lead: Lead;
  targetStatus: LeadStatus;
  onCancel: () => void;
  onConfirm: (newStatus: LeadStatus) => void;
}) {
  const { addDocument, addStatusChangeLog, addNotification, currentUser } = useAppData();
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);

  function handleConfirm() {
    let documentId: string | undefined;
    if (file) {
      const doc = addDocument({
        leadId: lead.id,
        name: file.name,
        category: "Stage Change",
        uploadedAt: new Date().toISOString().slice(0, 10),
        uploadedBy: currentUser.name,
      });
      documentId = doc.id;
    }
    addStatusChangeLog({
      leadId: lead.id,
      fromStatus: lead.status,
      toStatus: targetStatus,
      note,
      documentId,
      changedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      changedBy: currentUser.name,
    });
    addNotification(`${lead.projectName} moved from ${lead.status} to ${targetStatus}`);
    onConfirm(targetStatus);
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900">Move to "{targetStatus}"</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{lead.projectName} · currently {lead.status}</p>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Note (required)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Why is this lead moving stages?"
              className="w-full text-xs border border-slate-200 rounded p-2.5 resize-none focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Attach Document (optional)</label>
            <FileUploadButton file={file} onChange={setFile} label="Attach Document" />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-200">
          <button onClick={onCancel} className="px-4 py-1.5 text-xs text-slate-600 border border-slate-200 rounded hover:bg-slate-50">Cancel</button>
          <button
            onClick={handleConfirm}
            disabled={!note.trim()}
            className="px-4 py-1.5 text-xs font-semibold text-white rounded disabled:opacity-40"
            style={{ background: "#253580" }}
          >
            Confirm Move
          </button>
        </div>
      </div>
    </div>
  );
}
