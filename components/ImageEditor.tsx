
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
    <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4 w-full">Edit Your Mockup</h3>
      <div className="w-full space-y-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="edit-prompt" className="text-sm font-medium text-gray-600">
            Describe your edit:
          </label>
          <input
            id="edit-prompt"
            type="text"
            value={editPrompt}
            onChange={onPromptChange}
            placeholder="e.g., make the background blurry, add a cat on the sofa"
            className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white transition"
            disabled={isEditing}
          />
        </div>
        <button
          onClick={onEditImage}
          disabled={isEditing || !editPrompt}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-2xl transition"
        >
          {isEditing ? 'Applying Edit...' : 'Apply Edit'}
        </button>
      </div>
    </div>
  );
};

export default ImageEditor;
