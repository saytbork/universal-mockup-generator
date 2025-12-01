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
    <div className={`relative bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700 flex flex-col gap-4 h-full ${disabled ? 'opacity-60' : ''}`}>
      <div className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-widest text-rose-300">Optional Talent Reference</p>
        <h2 className="text-2xl font-bold text-gray-200">Add your model</h2>
        <p className="text-sm text-gray-400">
          Drop a photo of your real creator so the AI matches their face, hair, and vibe while interacting with the product.
        </p>
      </div>
      <label
        className={`border-2 border-dashed border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center gap-3 ${disabled ? 'cursor-not-allowed pointer-events-none' : 'cursor-pointer hover:border-indigo-400'} transition`}
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
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="text-sm font-semibold text-gray-200">Click or drag model photo</span>
        <span className="text-xs text-gray-500">PNG, JPG, WebP up to 5MB</span>
      </label>
      {previewUrl && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">Model reference</p>
            <button onClick={onClear} className="text-xs text-red-300 hover:text-red-200">Remove</button>
          </div>
          <img src={previewUrl} alt="Model reference" className="rounded-lg max-h-48 object-cover border border-gray-700" />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <label className="text-xs uppercase tracking-widest text-gray-500">Interaction notes (optional)</label>
        <textarea
          value={cleanedNotes}
          onChange={(event) => onNotesChange(sanitizeNotes(event.target.value))}
          placeholder="e.g., holding the box with both hands and smiling sleepily"
          className="min-h-[70px] rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
          disabled={disabled}
        />
      </div>
      {disabled && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gray-950/70 text-sm text-gray-300">
          {lockedMessage || 'Upload your product image first to link a model.'}
        </div>
      )}
    </div>
  );
};

export default ModelReferencePanel;
