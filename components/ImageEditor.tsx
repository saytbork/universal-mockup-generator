
import React from 'react';

interface ImageEditorProps {
  editPrompt: string;
  onPromptChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
    <div className="w-full rounded-xl border border-gray-200 bg-white p-4 dark:bg-white/5 dark:border-white/10 dark:backdrop-blur-[20px] dark:backdrop-saturate-[180%]">
      <h3 className="text-sm font-semibold text-gray-900 mb-4 w-full dark:text-white">Edit Your Mockup</h3>
      <div className="w-full space-y-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="edit-prompt" className="text-sm font-medium text-gray-600 dark:text-white/60">
            Describe your edit:
          </label>
          <input
            id="edit-prompt"
            type="text"
            value={editPrompt}
            onChange={onPromptChange}
            placeholder="e.g., make the background blurry, add a cat on the sofa"
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white transition dark:bg-black/20 dark:border-white/10 dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/30 dark:focus:ring-offset-black"
            disabled={isEditing}
          />
        </div>
        <button
          onClick={onEditImage}
          disabled={isEditing || !editPrompt}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:disabled:bg-white/10 dark:disabled:text-white/40"
        >
          {isEditing ? 'Applying Edit...' : 'Apply Edit'}
        </button>
      </div>
    </div>
  );
};

export default ImageEditor;
