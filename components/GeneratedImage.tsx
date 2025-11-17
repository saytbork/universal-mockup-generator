
import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ImageVariantMeta {
  url: string;
  width: number;
  height: number;
}

interface GeneratedImageProps {
  imageUrl: string | null;
  fourKVariant: ImageVariantMeta | null;
  twoKVariant: ImageVariantMeta | null;
  isHiResProcessing: boolean;
  hiResError: string | null;
  isImageLoading: boolean;
  imageError: string | null;
  onReset: () => void;
}

const DOWNLOAD_ASPECT_RATIOS = [
  { label: 'Original', value: 'original' },
  { label: '1:1 Square', value: '1:1' },
  { label: '4:5 Portrait', value: '4:5' },
  { label: '3:4 Portrait', value: '3:4' },
  { label: '16:9 Landscape', value: '16:9' },
];

const GeneratedImage: React.FC<GeneratedImageProps> = ({ 
  imageUrl,
  fourKVariant,
  twoKVariant,
  isHiResProcessing,
  hiResError,
  isImageLoading,
  imageError, 
  onReset,
}) => {

  const [downloadAspectRatio, setDownloadAspectRatio] = useState('original');
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isProcessingDownload, setIsProcessingDownload] = useState(false);

  const downloadSource = fourKVariant?.url ?? imageUrl;

  const triggerDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadWithAspectRatio = async (ratioValue: string) => {
    if (!downloadSource) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = downloadSource;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Could not load image for cropping.'));
    });

    const [ratioWidth, ratioHeight] = ratioValue.split(':').map(Number);
    if (!ratioWidth || !ratioHeight) {
      throw new Error('Invalid aspect ratio selection.');
    }

    const targetRatio = ratioWidth / ratioHeight;
    const currentRatio = img.naturalWidth / img.naturalHeight;

    let cropWidth = img.naturalWidth;
    let cropHeight = img.naturalHeight;

    if (currentRatio > targetRatio) {
      cropWidth = img.naturalHeight * targetRatio;
    } else {
      cropHeight = img.naturalWidth / targetRatio;
    }

    const offsetX = (img.naturalWidth - cropWidth) / 2;
    const offsetY = (img.naturalHeight - cropHeight) / 2;

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(cropWidth);
    canvas.height = Math.round(cropHeight);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Your browser does not support canvas editing.');
    }

    ctx.drawImage(
      img,
      offsetX,
      offsetY,
      cropWidth,
      cropHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return await new Promise<void>((resolve, reject) => {
      canvas.toBlob(blob => {
        if (!blob) {
          reject(new Error('Could not create cropped image.'));
          return;
        }
        const url = URL.createObjectURL(blob);
        triggerDownload(url, `ai-mockup-${ratioValue.replace(':', '-')}.png`);
        URL.revokeObjectURL(url);
        resolve();
      }, 'image/png');
    });
  };

  const handleDownload = async () => {
    if (!downloadSource) return;
    setDownloadError(null);

    if (downloadAspectRatio === 'original') {
      triggerDownload(downloadSource, 'ai-mockup.png');
      return;
    }

    try {
      setIsProcessingDownload(true);
      await downloadWithAspectRatio(downloadAspectRatio);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : 'Could not create the requested crop. Try downloading the original image.');
    } finally {
      setIsProcessingDownload(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full p-4 bg-gray-800 rounded-lg border-2 border-dashed border-gray-600">
      <h3 className="text-lg font-semibold text-gray-300 mb-4">3. Generated Mockup</h3>
      <div className="relative w-full h-full min-h-[40rem] flex items-center justify-center rounded-md bg-gray-900/50">
        {isImageLoading ? (
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-400">
              Generating Image...
            </p>
          </div>
        ) : imageError ? (
          <div className="text-center text-red-400 px-4">
             <p className="font-semibold">Generation Failed</p>
             <p className="text-sm">{imageError}</p>
          </div>
        ) : imageUrl ? (
          <img src={imageUrl} alt="Generated Mockup" className="max-h-full max-w-full object-contain rounded-md" />
        ) : (
          <div className="text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
            </svg>
            <p>Your generated mockup will appear here</p>
          </div>
        )}

        {(imageUrl || imageError) && !isImageLoading && (
            <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-gray-900/70 rounded-2xl px-4 py-3 border border-white/10">
              <div className="flex flex-col gap-3 w-full">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400 uppercase tracking-[0.3em]">Download aspect ratio</label>
                  <div className="flex items-center gap-2">
                    <select
                      value={downloadAspectRatio}
                      onChange={event => {
                        setDownloadAspectRatio(event.target.value);
                        setDownloadError(null);
                      }}
                      className="rounded-lg bg-gray-800 border border-gray-600 text-sm text-white px-3 py-2 focus:border-indigo-400 focus:outline-none"
                      disabled={!downloadSource}
                    >
                      {DOWNLOAD_ASPECT_RATIOS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {downloadError && (
                      <span className="text-xs text-red-300">{downloadError}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-300">
                  <button
                    onClick={onReset}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                    aria-label="Reset"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 9a9 9 0 0114.13-5.12M20 15a9 9 0 01-14.13 5.12" />
                    </svg>
                    Reset
                  </button>
                  {imageUrl && (
                    <button
                      onClick={handleDownload}
                      disabled={isProcessingDownload || !downloadSource}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900/40 disabled:cursor-not-allowed text-white font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                      aria-label="Download Image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      {isProcessingDownload ? 'Preparing…' : 'Download'}
                    </button>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => fourKVariant && triggerDownload(fourKVariant.url, `ai-mockup-4k-${fourKVariant.width}x${fourKVariant.height}.png`)}
                      disabled={!fourKVariant || isHiResProcessing}
                      className="border border-white/20 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/80 hover:border-indigo-400 hover:text-white transition disabled:opacity-60"
                    >
                      4K {fourKVariant ? `(${fourKVariant.width}×${fourKVariant.height})` : ''}
                    </button>
                    <button
                      onClick={() => twoKVariant && triggerDownload(twoKVariant.url, `ai-mockup-2k-${twoKVariant.width}x${twoKVariant.height}.png`)}
                      disabled={!twoKVariant || isHiResProcessing}
                      className="border border-white/20 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/80 hover:border-indigo-400 hover:text-white transition disabled:opacity-60"
                    >
                      2K {twoKVariant ? `(${twoKVariant.width}×${twoKVariant.height})` : ''}
                    </button>
                  </div>
                  <span className="text-[11px] text-gray-400">
                    {isHiResProcessing && 'Preparing 4K / 2K masters…'}
                    {!isHiResProcessing && hiResError && hiResError}
                    {!isHiResProcessing && !hiResError && fourKVariant && twoKVariant && '4K + 2K exports ready.'}
                  </span>
                </div>
              </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default GeneratedImage;
