import React from 'react';

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
    <div className={`relative bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700 flex flex-col gap-4 h-full ${disabled ? 'opacity-60' : ''}`}>
      <div className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-widest text-amber-300">Optional Mood Boost</p>
        <h2 className="text-2xl font-bold text-gray-200">Drop Inspiration Mood</h2>
        <p className="text-sm text-gray-400">
          Upload a reference photo or moodboard. We’ll analyze the palette and auto-tune your scene.
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
        {isProcessing ? (
          <div className="text-sm text-gray-300">Analyzing mood…</div>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7l9 6 9-6M3 7h18" />
            </svg>
            <span className="text-sm font-semibold text-gray-200">Click or drag to upload</span>
            <span className="text-xs text-gray-500">PNG, JPG, WebP up to 5MB</span>
          </>
        )}
      </label>
      {previewUrl && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">Mood preview</p>
            <button onClick={onClear} className="text-xs text-red-300 hover:text-red-200">Clear</button>
          </div>
          <img src={previewUrl} alt="Mood reference" className="rounded-lg max-h-48 object-cover border border-gray-700" />
        </div>
      )}
      {palette.length > 0 && (
        <div>
          <p className="text-sm text-gray-400 mb-2">Palette detected</p>
          <div className="flex flex-wrap gap-2">
            {palette.map((color) => (
              <div key={color} className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs text-gray-200">
                <span className="inline-block w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                {color.toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      )}
      {summary && (
        <p className="text-sm text-indigo-200 bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3">
          {summary}
        </p>
      )}
      {disabled && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gray-950/70 text-sm text-gray-300">
          {lockedMessage || 'Upload your product image first to unlock mood suggestions.'}
        </div>
      )}
    </div>
  );
};

export default MoodReferencePanel;
