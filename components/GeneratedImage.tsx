
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  targetAspectRatio?: string | null;
  fourKVariant: ImageVariantMeta | null;
  twoKVariant: ImageVariantMeta | null;
  isHiResProcessing: boolean;
  hiResError: string | null;
  isImageLoading: boolean;
  imageError: string | null;
  onReset: () => void;
  isFreeUser: boolean;
  isAnonymousTrial: boolean;
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
  targetAspectRatio,
  fourKVariant,
  twoKVariant,
  isHiResProcessing,
  hiResError,
  isImageLoading,
  imageError,
  onReset,
  isFreeUser,
  isAnonymousTrial,
  downloadCreditConfig,
  onChargeDownloadCredits,
}) => {

	const [downloadResolution, setDownloadResolution] = useState<DownloadResolution>('original');
	const [downloadError, setDownloadError] = useState<string | null>(null);
	const [isProcessingDownload, setIsProcessingDownload] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const parsedAspectRatio = useMemo(() => {
    const raw = String(targetAspectRatio ?? '').trim();
    const match = raw.match(/^(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)$/);
    if (!match) return null;
    const w = Number(match[1]);
    const h = Number(match[2]);
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
    return { w, h, css: `${w} / ${h}` };
  }, [targetAspectRatio]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [frameSize, setFrameSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (!parsedAspectRatio) {
      setFrameSize(null);
      return;
    }
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') {
      setFrameSize(null);
      return;
    }

    const ratio = parsedAspectRatio.w / parsedAspectRatio.h;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const containerWidth = Math.max(1, Math.floor(rect.width));
      const containerHeight = Math.max(1, Math.floor(rect.height));
      let width = Math.min(containerWidth, Math.floor(containerHeight * ratio));
      let height = Math.floor(width / ratio);
      if (height > containerHeight) {
        height = containerHeight;
        width = Math.floor(height * ratio);
      }
      setFrameSize({ width, height });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [parsedAspectRatio]);

  useEffect(() => {
    setDownloadResolution('original');
    setDownloadError(null);
  }, [imageUrl]);

  useEffect(() => {
    if (!isLightboxOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsLightboxOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isLightboxOpen]);

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
    if (isFreeUser && !isAnonymousTrial) {
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
    <div className="flex flex-col w-full">
      {isLightboxOpen && imageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(false);
            }}
            className="absolute top-4 right-4 h-10 w-10 rounded-full border border-white/20 bg-black/40 text-white/90 hover:bg-black/60 transition flex items-center justify-center"
            aria-label="Close preview"
            title="Close"
          >
            <span className="text-xl leading-none">×</span>
          </button>
          <img
            src={imageUrl}
            alt="Generated Mockup (Full Size Preview)"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[95vw] object-contain rounded-xl border border-white/10"
          />
        </div>
      )}

      <div
        ref={containerRef}
        className="relative w-full min-h-[22rem] sm:min-h-[40rem] max-h-[70vh] flex items-center justify-center rounded-xl bg-white overflow-hidden dark:bg-white/5 dark:backdrop-blur-[20px] dark:backdrop-saturate-[180%]"
      >
        {isImageLoading ? (
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600 dark:text-white/60">Generating image…</p>
          </div>
        ) : imageError ? (
          <div className="text-center text-gray-500 px-4 dark:text-white/60">
            <p className="font-semibold">Generation Failed</p>
            <p className="text-sm">{imageError}</p>
          </div>
        ) : imageUrl ? (
          <div
            className="overflow-hidden rounded-xl"
            style={
              frameSize
                ? ({
                  width: `${frameSize.width}px`,
                  height: `${frameSize.height}px`,
                } as React.CSSProperties)
                : parsedAspectRatio
                  ? ({ aspectRatio: parsedAspectRatio.css, width: '100%', height: '100%' } as React.CSSProperties)
                  : undefined
            }
          >
            <img
              src={imageUrl}
              alt="Generated Mockup"
              onClick={() => setIsLightboxOpen(true)}
              className="h-full w-full object-contain cursor-zoom-in"
            />
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-white/40">
            <p>Your generated mockup will appear here</p>
          </div>
        )}
      </div>

      {(imageUrl || imageError) && !isImageLoading && (
        <div className="mt-4 w-full flex flex-col gap-3 bg-white rounded-xl px-4 py-3 border border-gray-200 dark:bg-white/5 dark:border-white/10 dark:backdrop-blur-[20px] dark:backdrop-saturate-[180%]">
          <div className="flex flex-col gap-3 w-full">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 uppercase tracking-[0.3em] dark:text-white/40">Download resolution</label>
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
                      className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${isActive
                        ? 'bg-indigo-600 text-white border-indigo-600 scale-105 duration-500 dark:bg-indigo-500 dark:border-indigo-500'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-600 hover:text-gray-900 dark:border-white/10 dark:bg-black/20 dark:text-white/60 dark:hover:border-white/30 dark:hover:text-white'
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {option.label} · {formatCreditLabel(cost)}
                    </button>
                  );
                })}
              </div>
              {showHiResStatus && (
                <span className="text-[11px] text-gray-600 dark:text-white/50">
                  {isHiResProcessing
                    ? 'Preparing 4K / 2K masters…'
                    : hiResError ?? 'High-resolution exports ready.'}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-white/60">
              <button
                onClick={onReset}
                className="border border-gray-200 bg-white text-gray-900 font-semibold px-3 py-1.5 rounded-xl transition flex items-center gap-1 hover:border-indigo-600 dark:border-white/10 dark:bg-black/20 dark:text-white dark:hover:border-white/30 dark:backdrop-blur-[20px] dark:backdrop-saturate-[180%]"
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
                  className="bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold px-3 py-1.5 rounded-2xl transition flex items-center gap-1 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:disabled:bg-white/10 dark:disabled:text-white/40"
                  aria-label="Download Image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  {isProcessingDownload ? 'Preparing…' : 'Download'}
                </button>
              )}
              {isFreeUser && (
                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-white/50">
                  Watermark applied on Free plan
                </span>
              )}
            </div>
            {downloadError && (
              <span className="text-xs text-gray-500 dark:text-white/50">{downloadError}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneratedImage;
