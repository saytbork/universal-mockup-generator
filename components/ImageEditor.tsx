
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
    <div className="flex flex-col items-center justify-center w-full p-4 bg-surface rounded-lg border-2 border-dashed border-borderSubtle">
      <h3 className="text-lg font-semibold text-textSecondary mb-4 w-full">Edit Your Mockup</h3>
      <div className="w-full space-y-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="edit-prompt" className="text-sm font-medium text-textSecondary">
            Describe your edit:
          </label>
          <input
            id="edit-prompt"
            type="text"
            value={editPrompt}
            onChange={onPromptChange}
            placeholder="e.g., make the background blurry, add a cat on the sofa"
            className="bg-surfaceGlass border border-borderSubtle rounded-2xl p-2 text-textPrimary placeholder:text-textMuted Muted focus:ring-2 focus:ring-accent focus:border-accent transition duration-150 ease-in-out"
            disabled={isEditing}
          />
        </div>
        <button
          onClick={onEditImage}
          disabled={isEditing || !editPrompt}
          className="w-full bg-accent hover:bg-accent disabled:bg-accent disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-2xl transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
        >
          {isEditing ? 'Applying Edit...' : 'Apply Edit'}
        </button>
      </div>
    </div>
  );
};

export default ImageEditor;
