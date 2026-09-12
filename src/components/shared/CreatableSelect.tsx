import { useState } from "react";

const ADD_NEW = "__add_new__";

export default function CreatableSelect({
  value, onChange, options, onAddOption, placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  onAddOption: (value: string) => void;
  placeholder?: string;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  function commit() {
    const trimmed = draft.trim();
    if (trimmed) {
      onAddOption(trimmed);
      onChange(trimmed);
    }
    setAdding(false);
    setDraft("");
  }

  function cancel() {
    setAdding(false);
    setDraft("");
  }

  if (adding) {
    return (
      <div className="flex gap-1.5">
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); commit(); }
            if (e.key === "Escape") cancel();
          }}
          placeholder="Type new value…"
          className="w-full border border-blue-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400"
        />
        <button type="button" onClick={commit} className="text-xs font-semibold text-green-700 px-2 rounded border border-green-200 bg-green-50 hover:bg-green-100">✓</button>
        <button type="button" onClick={cancel} className="text-xs font-semibold text-slate-500 px-2 rounded border border-slate-200 hover:bg-slate-50">✕</button>
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => {
        if (e.target.value === ADD_NEW) { setAdding(true); return; }
        onChange(e.target.value);
      }}
      className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
      <option value={ADD_NEW}>+ Add New…</option>
    </select>
  );
}
