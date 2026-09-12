import { useRef } from "react";

export default function FileUploadButton({
  file, onChange, name, onNameChange, label = "Choose File", accept,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
  name: string;
  onNameChange: (name: string) => void;
  label?: string;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileSelected(selected: File | null) {
    onChange(selected);
    onNameChange(selected ? selected.name : "");
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
        className="hidden"
      />
      {!file ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-slate-600 border border-dashed border-slate-300 rounded px-3 py-2 hover:bg-slate-50 hover:border-slate-400 transition-colors"
        >
          📎 {label}
        </button>
      ) : (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50">
            <span className="flex items-center gap-1.5 truncate text-slate-700 min-w-0">
              <span className="flex-shrink-0">📄</span>
              <span className="truncate">{file.name}</span>
            </span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button type="button" onClick={() => inputRef.current?.click()} className="text-blue-600 font-medium hover:underline">Change</button>
              <button type="button" onClick={() => handleFileSelected(null)} className="text-red-500 font-medium hover:underline">Remove</button>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-slate-500 mb-1">Attachment Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>
      )}
    </div>
  );
}
