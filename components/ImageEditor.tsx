
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
    <div className="flex flex-col items-center justify-center w-full p-4 bg-white rounded-lg border-2 border-dashed border-gray-200">
      <h3 className="text-lg font-semibold text-gray-600 mb-4 w-full">Edit Your Mockup</h3>
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
            className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-2 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-600 transition duration-150 ease-in-out"
            disabled={isEditing}
          />
        </div>
        <button
          onClick={onEditImage}
          disabled={isEditing || !editPrompt}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-2xl transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
        >
          {isEditing ? 'Applying Edit...' : 'Apply Edit'}
        </button>
      </div>
    </div>
  );
};

export default ImageEditor;
