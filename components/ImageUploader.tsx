import React, { useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { Plus } from 'lucide-react';

interface ImageUploaderProps {
  onImageUpload: (files: File[]) => void;
  uploadedImagePreview?: string | null;
  disabled?: boolean;
  lockedMessage?: string;
  maxFiles?: number;
}

export interface ImageUploaderHandle {
  openFileDialog: () => void;
}

const ImageUploader = React.forwardRef<ImageUploaderHandle, ImageUploaderProps>(({
  onImageUpload,
  uploadedImagePreview = null,
  disabled = false,
  lockedMessage,
  maxFiles = 5,
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

  const emitUpload = useCallback((files: File[]) => {
    const [file] = files;
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);
    console.log('[ImageUploader] File selected, emitting upload with preview');
    onImageUpload(files);
  }, [onImageUpload]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const files = Array.from(e.target.files ?? []);
    if (files.length) {
      emitUpload(files);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files ?? []);
    if (files.length) {
      emitUpload(files);
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

  const handleClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const previewToShow = localPreview || uploadedImagePreview;

  return (
    <div
      className={`relative w-full aspect-[16/10] rounded-2xl border transition-all duration-500 flex items-center justify-center overflow-hidden shadow-sm ${
        disabled
          ? 'opacity-60 cursor-not-allowed bg-gray-50 border-gray-200 dark:bg-white/5 dark:border-white/10'
          : 'cursor-pointer border-gray-200 bg-white hover:border-indigo-600/30 dark:bg-white/5 dark:border-white/10 dark:hover:border-white/20 dark:backdrop-blur-[20px] dark:backdrop-saturate-[180%]'
      } ${isDragging ? 'border-indigo-600 bg-indigo-50' : ''}`}
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <div className="text-center p-6 pointer-events-none">
        {previewToShow ? (
          <img
            src={previewToShow}
            alt="Product Preview"
            className="max-h-[160px] max-w-full object-contain rounded-lg mx-auto"
          />
        ) : (
          <>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200 shadow-inner dark:bg-white/5 dark:border-white/10">
              <Plus className="w-6 h-6 text-gray-400 dark:text-white/40" />
            </div>
            <div className="text-[12px] font-bold uppercase tracking-widest text-gray-900 mb-1 dark:text-white">
              Source Product
            </div>
            <div className="text-[10px] text-gray-500 uppercase font-medium dark:text-white/50">
              Click to browse (Max {maxFiles})
            </div>
          </>
        )}
      </div>

      <input
        type="file"
        className="hidden"
        disabled={disabled}
        multiple
        onChange={handleFileChange}
        ref={inputRef}
        accept="image/png, image/jpeg, image/webp"
      />

      {disabled && lockedMessage && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-2xl text-sm text-gray-500 dark:bg-black/40 dark:text-white/60 dark:backdrop-blur-[20px] dark:backdrop-saturate-[180%]">
          {lockedMessage}
        </div>
      )}
    </div>
  );
});

ImageUploader.displayName = 'ImageUploader';

export default ImageUploader;
