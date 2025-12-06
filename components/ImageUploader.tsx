import React, { useCallback, useEffect, useImperativeHandle, useState } from 'react';

interface ImageUploaderProps {
  onUpload: (file: File, previewUrl: string) => void;
  uploadedImagePreview?: string | null;
  disabled?: boolean;
  lockedMessage?: string;
}

export interface ImageUploaderHandle {
  openFileDialog: () => void;
}

const ImageUploader = React.forwardRef<ImageUploaderHandle, ImageUploaderProps>(({
  onUpload,
  uploadedImagePreview = null,
  disabled = false,
  lockedMessage,
}, ref) => {
  const [isDragging, setIsDragging] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(uploadedImagePreview);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setLocalPreview(uploadedImagePreview ?? null);
  }, [uploadedImagePreview]);

  useImperativeHandle(ref, () => ({
    openFileDialog: () => {
      if (disabled) return;
      inputRef.current?.click();
    },
  }), [disabled]);

  const emitUpload = useCallback((file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);
    console.log('[ImageUploader] File selected, emitting upload with preview');
    onUpload(file, previewUrl);
  }, [onUpload]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const file = e.target.files?.[0];
    if (file) {
      emitUpload(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      emitUpload(file);
    }
  }, [disabled, emitUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleAddAnotherClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const previewToShow = localPreview || uploadedImagePreview;

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
        {previewToShow ? (
          <img src={previewToShow} alt="Product Preview" className="max-h-full max-w-full object-contain rounded-md" />
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
          ref={inputRef}
          accept="image/png, image/jpeg, image/webp"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
        />
      </div>
      <p className="mt-3 text-xs text-gray-400">Tip: Drop multiple files at once. The first becomes the hero; others stay in your library.</p>
      <button
        type="button"
        onClick={handleAddAnotherClick}
        className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs text-gray-200 hover:border-indigo-400 hover:text-white transition"
        disabled={disabled}
      >
        + Add another photo
      </button>
      {disabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/70 rounded-lg text-sm text-gray-300">
          {lockedMessage || 'Complete the previous step to continue'}
        </div>
      )}
    </div>
  );
});

ImageUploader.displayName = 'ImageUploader';

export default ImageUploader;
