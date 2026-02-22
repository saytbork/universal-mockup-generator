
import React from 'react';

interface ImageEditorProps {
  editPrompt: string;
  onPromptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onEditImage: () => void;
  isEditing: boolean;
}

const ImageEditor: React.FC<ImageEditorProps> = ({
  editPrompt,
  onPromptChange,
  onEditImage,
  isEditing,
  }) => {
  return (
    <div className="w-full rounded-xl border border-gray-200 p-4 sm:p-5 dark:border-white/10">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Edit image</h3>
          <p className="text-xs text-gray-600 dark:text-white/60">
            Describe a change to apply to the latest render.
          </p>
        </div>
        <div className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[10px] font-black tracking-[0.3em] text-gray-500 dark:border-white/10 dark:bg-black/20 dark:text-white/50">
          EDIT
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <label htmlFor="edit-prompt" className="block text-xs font-semibold text-gray-700 dark:text-white/70">
          What should change?
        </label>
        <textarea
          id="edit-prompt"
          value={editPrompt}
          onChange={onPromptChange}
          placeholder="Example: make the background more blurred, keep the product sharp. Or: change the lighting to softer and warmer."
          className="w-full min-h-[86px] resize-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition dark:bg-black/20 dark:border-white/10 dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/30"
          disabled={isEditing}
        />
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] text-gray-500 dark:text-white/45">
            Tip: be specific about what to keep vs change.
          </p>
          <p className="text-[11px] text-gray-400 dark:text-white/35">
            {editPrompt.trim().length}/280
          </p>
        </div>

        <button
          type="button"
          onClick={onEditImage}
          disabled={isEditing || !editPrompt.trim()}
          className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:disabled:bg-white/10 dark:disabled:text-white/40"
        >
          {isEditing ? 'Applying edit…' : 'Apply edit'}
        </button>
      </div>
    </div>
  );
};

export default ImageEditor;
