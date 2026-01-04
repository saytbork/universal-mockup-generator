import React from 'react';
import { normalizeOptions } from '../src/system/normalizeOptions';

function sanitizeNotes(text = "") {
  return text
    .replace(/reference|see above|see image/gi, "")
    .replace(/pinterest|tiktok|instagram/gi, "")
    .replace(/url\([^)]*\)/gi, "")
    .trim();
}

interface ModelReferencePanelProps {
  onFileSelect: (file: File) => void;
  previewUrl: string | null;
  notes: string;
  onNotesChange: (value: string) => void;
  onClear: () => void;
  disabled?: boolean;
  lockedMessage?: string;
}

const ModelReferencePanel: React.FC<ModelReferencePanelProps> = ({
  onFileSelect,
  previewUrl,
  notes,
  onNotesChange,
  onClear,
  disabled = false,
  lockedMessage,
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const cleanedNotes = sanitizeNotes(notes);

  return (
    <div className="relative">
      {!previewUrl ? (
        <label
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-borderSubtle p-6 hover:border-accent  transition cursor-pointer ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
          onDragOver={(event) => {
            if (disabled) return;
            event.preventDefault();
            event.stopPropagation();
          }}
          onDrop={(event) => {
            if (disabled) return;
            event.preventDefault();
            event.stopPropagation();
            if (event.dataTransfer.files && event.dataTransfer.files[0]) {
              onFileSelect(event.dataTransfer.files[0]);
            }
          }}
        >
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={disabled} />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-textMuted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm text-textSecondary text-textSecondary">Add model photo</span>
          <span className="text-xs text-textMuted">Optional</span>
        </label>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-textSecondary text-textMuted">Model reference</p>
            <button onClick={onClear} className="text-xs text-textMuted hover:text-accent transition">Remove</button>
          </div>
          <img src={previewUrl} alt="Model reference" className="rounded-xl h-32 w-full object-cover border border-borderSubtle" />
          <textarea
            value={cleanedNotes}
            onChange={(event) => onNotesChange(sanitizeNotes(event.target.value))}
            placeholder="e.g., holding product with both hands"
            className="min-h-[60px] rounded-xl border border-borderSubtle bg-surface px-3 py-2 text-sm text-textPrimary placeholder:text-textMuted focus:border-accent focus:outline-none"
            disabled={disabled}
          />
        </div>
      )}
      {disabled && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-surfaceSoft bg-surfaceSoft text-sm text-textMuted">
          {lockedMessage || 'Upload product first'}
        </div>
      )}
    </div>
  );
};

export default ModelReferencePanel;
