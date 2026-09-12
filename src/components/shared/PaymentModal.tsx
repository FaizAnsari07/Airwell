import { useState } from "react";
import type { Lead } from "../../data/crmData";
import { useAppData } from "../../context/AppDataContext";

export default function PaymentModal({
  lead, alreadyPaid, onClose,
}: {
  lead: Lead;
  alreadyPaid: number;
  onClose: () => void;
}) {
  const { addDocument, addPayment, currentUser } = useAppData();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"Cash" | "Bank Transfer">("Cash");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const remaining = Math.max(lead.valueLakhs - alreadyPaid, 0);
  const amountNum = Number(amount) || 0;
  const canConfirm = amountNum > 0 && amountNum <= remaining && (method === "Cash" || file !== null);

  function handleConfirm() {
    let documentId: string | undefined;
    if (file) {
      const doc = addDocument({
        leadId: lead.id,
        name: file.name,
        category: "Payment Receipt",
        uploadedAt: new Date().toISOString().slice(0, 10),
        uploadedBy: currentUser.name,
      });
      documentId = doc.id;
    }
    addPayment({
      leadId: lead.id,
      amount: amountNum,
      method,
      note,
      date: new Date().toISOString().slice(0, 10),
      documentId,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900">Record Payment</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {lead.projectName} · Paid ₹{alreadyPaid}L of ₹{lead.valueLakhs}L · Remaining ₹{remaining.toFixed(1)}L
          </p>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Amount (₹ Lakhs)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              max={remaining}
              className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400"
            />
            {amountNum > remaining && (
              <div className="text-[11px] text-red-500 mt-1">Cannot exceed remaining balance (₹{remaining.toFixed(1)}L).</div>
            )}
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Payment Method</label>
            <div className="flex gap-4 text-xs text-slate-600">
              <label className="flex items-center gap-1.5">
                <input type="radio" name="method" checked={method === "Cash"} onChange={() => setMethod("Cash")} />
                Cash
              </label>
              <label className="flex items-center gap-1.5">
                <input type="radio" name="method" checked={method === "Bank Transfer"} onChange={() => setMethod("Bank Transfer")} />
                Bank Transfer
              </label>
            </div>
          </div>
          {method === "Bank Transfer" && (
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Transfer Receipt (required)</label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full text-xs text-slate-500"
              />
              {file && (
                <div className="text-[11px] text-slate-500 mt-1">
                  Will be saved as: <span className="font-medium">{file.name}</span>
                </div>
              )}
            </div>
          )}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full text-xs border border-slate-200 rounded p-2.5 resize-none focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-200">
          <button onClick={onClose} className="px-4 py-1.5 text-xs text-slate-600 border border-slate-200 rounded hover:bg-slate-50">Cancel</button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="px-4 py-1.5 text-xs font-semibold text-white rounded disabled:opacity-40"
            style={{ background: "#253580" }}
          >
            Save Payment
          </button>
        </div>
      </div>
    </div>
  );
}
