import React, { useCallback, useState } from 'react';

interface ImageUploaderProps {
  onImageUpload: (files: File[]) => void;
  uploadedImagePreview: string | null;
  disabled?: boolean;
  lockedMessage?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, uploadedImagePreview, disabled = false, lockedMessage }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length && !disabled) {
      onImageUpload(Array.from(e.target.files));
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!disabled && e.dataTransfer.files && e.dataTransfer.files.length) {
      onImageUpload(Array.from(e.dataTransfer.files));
    }
  }, [onImageUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  return (
    <div className={`relative flex flex-col items-center justify-center w-full p-4 bg-gray-800 rounded-lg border-2 border-dashed border-gray-600 ${disabled ? 'opacity-60' : ''}`}>
      <h3 className="text-lg font-semibold text-gray-300 mb-4">Upload Product Image</h3>
      <div 
        className={`relative w-full h-40 flex items-center justify-center rounded-md transition-all duration-300 ${isDragging ? 'bg-gray-700' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        {uploadedImagePreview ? (
          <img src={uploadedImagePreview} alt="Product Preview" className="max-h-full max-w-full object-contain rounded-md" />
        ) : (
          <div className="text-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <p>Drag & drop or click to upload</p>
          </div>
        )}
        <input 
          type="file" 
          className={`absolute inset-0 w-full h-full opacity-0 ${disabled ? 'cursor-not-allowed pointer-events-none' : 'cursor-pointer'}`}
          disabled={disabled}
          multiple
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp"
        />
      </div>
      {disabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/70 rounded-lg text-sm text-gray-300">
          {lockedMessage || 'Complete the previous step to continue'}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
