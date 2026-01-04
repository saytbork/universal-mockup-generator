import React from 'react';
import { normalizeOptions } from '../src/system/normalizeOptions';

function sanitizeNotes(text = "") {
  return text
    .replace(/reference|see above|see image/gi, "")
    .replace(/pinterest|tiktok|instagram/gi, "")
    .replace(/url\([^)]*\)/gi, "")
    .trim();
}

interface MoodReferencePanelProps {
  onFileSelect: (file: File) => void;
  previewUrl: string | null;
  palette: string[];
  summary: string | null;
  isProcessing: boolean;
  onClear: () => void;
  disabled?: boolean;
  lockedMessage?: string;
}

const MoodReferencePanel: React.FC<MoodReferencePanelProps> = ({
  onFileSelect,
  previewUrl,
  palette,
  summary,
  isProcessing,
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

  return (
    <div className={`relative bg-surfaceTint p-6 rounded-lg shadow-lg border border-borderSubtle flex flex-col gap-4 h-full ${disabled ? 'opacity-60' : ''}`}>
      <div className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-widest text-textMuted">Optional Mood Boost</p>
        <h2 className="text-2xl font-bold text-textPrimary">Drop Inspiration Mood</h2>
        <p className="text-sm text-textSecondary">
          Upload a reference photo or moodboard. We’ll analyze the palette and auto-tune your scene.
        </p>
      </div>
      <label
        className={`border-2 border-dashed border-borderSubtle rounded-xl p-6 flex flex-col items-center justify-center gap-3 ${disabled ? 'cursor-not-allowed pointer-events-none' : 'cursor-pointer hover:border-accent'} transition`}
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
        {isProcessing ? (
          <div className="text-sm text-textSecondary">Analyzing mood…</div>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-textSecondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7l9 6 9-6M3 7h18" />
            </svg>
            <span className="text-sm font-semibold text-textPrimary">Click or drag to upload</span>
            <span className="text-xs text-textMuted">PNG, JPG, WebP up to 5MB</span>
          </>
        )}
      </label>
      {previewUrl && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-textSecondary">Mood preview</p>
            <button onClick={onClear} className="text-xs text-textSecondary hover:text-textPrimary">Clear</button>
          </div>
          <img src={previewUrl} alt="Mood reference" className="rounded-lg max-h-48 object-cover border border-borderSubtle" />
        </div>
      )}
      {palette.length > 0 && (
        <div>
          <p className="text-sm text-textSecondary mb-2">Palette detected</p>
          <div className="flex flex-wrap gap-2">
            {palette.map((color) => (
              <div key={color} className="flex items-center gap-2 rounded-full border border-borderSubtle px-3 py-1 text-xs text-textPrimary">
                <span className="inline-block w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                {color.toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      )}
      {summary && (
        <p className="text-sm text-accent bg-accent border border-accent/30 rounded-lg p-3">
          {sanitizeNotes(summary)}
        </p>
      )}
      {disabled && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-surfaceTint text-sm text-textSecondary">
          {lockedMessage || 'Upload your product image first to unlock mood suggestions.'}
        </div>
      )}
    </div>
  );
};

export default MoodReferencePanel;
