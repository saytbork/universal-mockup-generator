
import React, { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { HIGH_RES_UNAVAILABLE_MESSAGE } from '../constants';
import type { DownloadCreditConfig, DownloadResolution } from '../constants';

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
  isFreeUser: boolean;
  downloadCreditConfig: DownloadCreditConfig;
  onChargeDownloadCredits: (
    resolution: DownloadResolution
  ) => Promise<{ ok: boolean; message?: string }> | { ok: boolean; message?: string };
}

const DOWNLOAD_RESOLUTION_OPTIONS: { label: string; value: DownloadResolution }[] = [
  { label: 'Original', value: 'original' },
  { label: '2K', value: '2k' },
  { label: '4K', value: '4k' },
];
const RESOLUTION_TARGETS: Record<DownloadResolution, number | null> = {
  original: null,
  '2k': 2048,
  '4k': 3840,
};

const GeneratedImage: React.FC<GeneratedImageProps> = ({ 
  imageUrl,
  fourKVariant,
  twoKVariant,
  isHiResProcessing,
  hiResError,
  isImageLoading,
  imageError, 
  onReset,
  isFreeUser,
  downloadCreditConfig,
  onChargeDownloadCredits,
}) => {

  const [downloadResolution, setDownloadResolution] = useState<DownloadResolution>('original');
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isProcessingDownload, setIsProcessingDownload] = useState(false);

  useEffect(() => {
    setDownloadResolution('original');
    setDownloadError(null);
  }, [imageUrl]);

  const triggerDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const applyWatermark = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const text = 'Demo · Watermarked';
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Inter, sans-serif';
    const metrics = ctx.measureText(text);
    const padding = 24;
    ctx.fillText(text, canvas.width - metrics.width - padding, canvas.height - padding);
    ctx.restore();
  };

  const loadImageElement = async (sourceUrl: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = sourceUrl;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Could not load the source image for download.'));
    });
    return img;
  };

  const canvasToBlob = async (canvas: HTMLCanvasElement) =>
    new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => {
        if (!blob) {
          reject(new Error('Could not create the requested download.'));
          return;
        }
        resolve(blob);
      }, 'image/png');
    });

  const getResolutionSource = (resolution: DownloadResolution) => {
    if (resolution === '4k') {
      return fourKVariant?.url ?? null;
    }
    if (resolution === '2k') {
      return twoKVariant?.url ?? null;
    }
    return imageUrl;
  };

  const getResolutionCost = (resolution: DownloadResolution) => {
    if (resolution === '4k') return downloadCreditConfig.downloadCost4K;
    if (resolution === '2k') return downloadCreditConfig.downloadCost2K;
    return downloadCreditConfig.original;
  };

  const formatCreditLabel = (cost: number) => `${cost} ${cost === 1 ? 'credit' : 'credits'}`;

  const exportResolutionBlob = async (resolution: DownloadResolution) => {
    const preferredSource = getResolutionSource(resolution);
    const sourceUrl = preferredSource ?? imageUrl;
    if (!sourceUrl) {
      if (resolution === 'original') {
        throw new Error('Original export is unavailable. Generate the scene again.');
      }
      throw new Error(HIGH_RES_UNAVAILABLE_MESSAGE);
    }
    const img = await loadImageElement(sourceUrl);
    const canvas = document.createElement('canvas');
    const targetLongEdge = RESOLUTION_TARGETS[resolution];
    let targetWidth = img.naturalWidth;
    let targetHeight = img.naturalHeight;
    if (targetLongEdge) {
      const longEdge = Math.max(img.naturalWidth, img.naturalHeight);
      const scale = targetLongEdge / longEdge;
      targetWidth = Math.max(1, Math.round(img.naturalWidth * scale));
      targetHeight = Math.max(1, Math.round(img.naturalHeight * scale));
    }
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Your browser does not support canvas editing.');
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    if (isFreeUser) {
      applyWatermark(canvas);
    }
    return canvasToBlob(canvas);
  };

  const buildFilename = () => `ai-mockup-${downloadResolution}.png`;

  const showHiResStatus = isHiResProcessing || Boolean(fourKVariant || twoKVariant || hiResError);

  const handleDownload = async () => {
    if (!imageUrl) return;
    setDownloadError(null);

    setIsProcessingDownload(true);
    try {
      const blob = await exportResolutionBlob(downloadResolution);

      const chargeResult = await Promise.resolve(onChargeDownloadCredits(downloadResolution));
      if (!chargeResult.ok) {
        setDownloadError(
          chargeResult.message ?? 'Not enough credits available for this download.'
        );
        return;
      }

      const url = URL.createObjectURL(blob);
      triggerDownload(url, buildFilename());
      URL.revokeObjectURL(url);
    } catch (error) {
      setDownloadError(
        error instanceof Error ? error.message : HIGH_RES_UNAVAILABLE_MESSAGE
      );
    } finally {
      setIsProcessingDownload(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full p-4 bg-surface rounded-lg border-2 border-dashed border-borderSubtle">
      <h3 className="text-lg font-semibold text-textSecondary mb-4">3. Generated Mockup</h3>
      <div className="relative w-full h-full min-h-[40rem] flex items-center justify-center rounded-md bg-surfaceTint">
        {isImageLoading ? (
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-textSecondary">
              Generating Image...
            </p>
          </div>
        ) : imageError ? (
          <div className="text-center text-textMuted px-4">
	             <p className="font-semibold">Generation Failed</p>
	             <p className="text-sm">{imageError}</p>
	          </div>
        ) : imageUrl ? (
          <img src={imageUrl} alt="Generated Mockup" className="max-h-full max-w-full object-contain rounded-md" />
        ) : (
          <div className="text-center text-textMuted">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
            </svg>
            <p>Your generated mockup will appear here</p>
          </div>
        )}

      </div>

      {(imageUrl || imageError) && !isImageLoading && (
        <div className="mt-4 w-full flex flex-col gap-3 bg-surfaceTint rounded-2xl px-4 py-3 border border-borderSubtle">
              <div className="flex flex-col gap-3 w-full">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-textSecondary uppercase tracking-[0.3em]">Download resolution</label>
                  <div className="flex flex-wrap items-center gap-2">
                    {DOWNLOAD_RESOLUTION_OPTIONS.map(option => {
                      const isActive = downloadResolution === option.value;
                      const cost = getResolutionCost(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setDownloadResolution(option.value);
                            setDownloadError(null);
                          }}
                          disabled={!imageUrl}
                          className={`rounded-2xl border px-3 py-1.5 text-xs font-semibold transition ${
                            isActive
                              ? 'bg-accent text-white border-accent shadow-md shadow-accent-glow scale-105 duration-500'
                              : 'border-borderSubtle bg-surfaceTint text-textSecondary hover:border-accent hover:text-textPrimary'
                          } disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          {option.label} · {formatCreditLabel(cost)}
                        </button>
                      );
                    })}
                  </div>
                  {showHiResStatus && (
                    <span className="text-[11px] text-textSecondary">
                      {isHiResProcessing
                        ? 'Preparing 4K / 2K masters…'
                        : hiResError ?? 'High-resolution exports ready.'}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-textSecondary">
                  <button
                    onClick={onReset}
                    className="border border-borderSubtle bg-surfaceTint text-textPrimary font-semibold px-3 py-1.5 rounded-2xl transition flex items-center gap-1 hover:border-accent"
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
                      disabled={isProcessingDownload || !imageUrl}
                      className="bg-accent hover:bg-accent disabled:bg-surfaceTint disabled:cursor-not-allowed text-white font-semibold px-3 py-1.5 rounded-2xl transition flex items-center gap-1"
                      aria-label="Download Image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      {isProcessingDownload ? 'Preparing…' : 'Download'}
                    </button>
                  )}
                  {isFreeUser && (
                    <span className="px-2 py-1 rounded-full bg-surfaceTint text-textMuted">Watermark applied on Free plan</span>
                  )}
                </div>
                {downloadError && (
                  <span className="text-xs text-textMuted">{downloadError}</span>
                )}
              </div>
            </div>
      )}
    </div>
  );
};

export default GeneratedImage;
