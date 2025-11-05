
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
    <div className="flex flex-col items-center justify-center w-full p-4 bg-gray-800 rounded-lg border-2 border-dashed border-gray-600">
      <h3 className="text-lg font-semibold text-gray-300 mb-4 w-full">Edit Your Mockup</h3>
      <div className="w-full space-y-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="edit-prompt" className="text-sm font-medium text-gray-400">
            Describe your edit:
          </label>
          <input
            id="edit-prompt"
            type="text"
            value={editPrompt}
            onChange={onPromptChange}
            placeholder="e.g., make the background blurry, add a cat on the sofa"
            className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
            disabled={isEditing}
          />
        </div>
        <button
          onClick={onEditImage}
          disabled={isEditing || !editPrompt}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-900/50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
        >
          {isEditing ? 'Applying Edit...' : 'Apply Edit'}
        </button>
      </div>
    </div>
  );
};

export default ImageEditor;
