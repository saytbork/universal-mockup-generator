import React from 'react';

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
          className={`flex flex-col items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white p-6 hover:border-indigo-600 transition cursor-pointer ${disabled ? 'opacity-50 pointer-events-none' : ''} dark:bg-white/5 dark:border-white/10 dark:hover:border-white/20 dark:text-white/70 dark:backdrop-blur-[20px] dark:backdrop-saturate-[180%]`}
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
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500 dark:text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm text-gray-700 dark:text-white/70">Add model photo</span>
          <span className="text-xs text-gray-500 dark:text-white/40">Optional</span>
        </label>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-white/60">Model reference</p>
            <button onClick={onClear} className="text-xs text-gray-500 hover:text-indigo-600 transition dark:text-white/50 dark:hover:text-white">
              Remove
            </button>
          </div>
          <img
            src={previewUrl}
            alt="Model reference"
            className="rounded-2xl h-32 w-full object-cover border border-gray-200 dark:border-white/10"
          />
          <textarea
            value={cleanedNotes}
            onChange={(event) => onNotesChange(sanitizeNotes(event.target.value))}
            placeholder="e.g., holding product with both hands"
            className="min-h-[60px] rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-indigo-600 focus:outline-none dark:bg-black/20 dark:border-white/10 dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/30"
            disabled={disabled}
          />
        </div>
      )}
      {disabled && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gray-50 text-sm text-gray-500 dark:bg-black/40 dark:text-white/60 dark:backdrop-blur-[20px] dark:backdrop-saturate-[180%]">
          {lockedMessage || 'Upload product first'}
        </div>
      )}
    </div>
  );
};

export default ModelReferencePanel;
