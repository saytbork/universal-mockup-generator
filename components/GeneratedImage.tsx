
import React, { useEffect, useMemo, useRef, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { HIGH_RES_UNAVAILABLE_MESSAGE } from '../constants';
import type { DownloadCreditConfig, DownloadResolution } from '../constants';
import ImageEditor from './ImageEditor';
import VideoGenerator from './VideoGenerator';

// ============================================================================
// GENERATION PROGRESS COMPONENT - Modern 2026 design with subtle animations
// ============================================================================

const GenerationProgress: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'analyzing' | 'composing' | 'rendering' | 'finalizing'>('analyzing');
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    
    // Update elapsed time every 100ms
    const timeInterval = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 100);

    // Realistic progress curve: fast start (0-30%), slower middle (30-70%), fast finish (70-100%)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 30) {
          // Fast initial progress (0-30%): ~2 seconds
          return Math.min(30, prev + 1.5);
        } else if (prev < 70) {
          // Slower middle progress (30-70%): ~4 seconds
          return Math.min(70, prev + 0.6);
        } else if (prev < 95) {
          // Fast final progress (70-95%): ~2 seconds
          return Math.min(95, prev + 1.2);
        } else {
          // Stay at 95% until actual completion
          return 95;
        }
      });
    }, 100);

    return () => {
      clearInterval(progressInterval);
      clearInterval(timeInterval);
    };
  }, []);

  // Update stage based on progress
  useEffect(() => {
    if (progress < 20) {
      setStage('analyzing');
    } else if (progress < 50) {
      setStage('composing');
    } else if (progress < 85) {
      setStage('rendering');
    } else {
      setStage('finalizing');
    }
  }, [progress]);

  const stageMessages = {
    analyzing: 'Analyzing scene parameters…',
    composing: 'Composing visual elements…',
    rendering: 'Rendering high-quality image…',
    finalizing: 'Finalizing details…',
  };

  const estimatedTotal = 12; // ~12 seconds average
  const estimatedRemaining = Math.max(0, estimatedTotal - timeElapsed);

  return (
    <div className="text-center px-8 max-w-sm mx-auto">
      {/* Modern Pulsing Dots Animation (replaces old spinner) */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <div 
          className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-pulse"
          style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
        />
        <div 
          className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-pulse"
          style={{ animationDelay: '200ms', animationDuration: '1.4s' }}
        />
        <div 
          className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-pulse"
          style={{ animationDelay: '400ms', animationDuration: '1.4s' }}
        />
      </div>
      
      {/* Stage Message (above progress bar for better hierarchy) */}
      <p className="mb-3 text-sm font-medium text-gray-700 dark:text-white/70">
        {stageMessages[stage]}
      </p>

      {/* Modern Minimalist Progress Bar */}
      <div className="relative w-full h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
        {/* Shimmer effect background */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/10 animate-shimmer" 
             style={{ 
               backgroundSize: '200% 100%',
               animation: 'shimmer 2s infinite linear'
             }} 
        />
        {/* Actual progress fill - solid color, no gradients */}
        <div
          className="absolute inset-y-0 left-0 bg-indigo-600 dark:bg-indigo-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Progress Info (minimal, single line) */}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-white/50">
        <span>{Math.floor(progress)}%</span>
        <span>{estimatedRemaining}s</span>
      </div>
    </div>
  );
};

// ============================================================================
// IMAGE VARIANT METADATA
// ============================================================================

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
  // Edit image
  editPrompt: string;
  onEditPromptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onEditImage: () => void;
  // Video
  videoPrompt: string;
  onVideoPromptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onGenerateVideo: () => void;
  isVideoLoading: boolean;
  videoError: string | null;
  generatedVideoUrl: string | null;
  hasPlanVideoAccess: boolean;
  planVideoLimit: number;
  remainingVideos: number | null;
  planLabel: string;
  videoAccessCode: string;
  onVideoAccessCodeChange: (value: string) => void;
  onVideoAccessSubmit: () => void;
  videoAccessError: string | null;
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
  editPrompt,
  onEditPromptChange,
  onEditImage,
  videoPrompt,
  onVideoPromptChange,
  onGenerateVideo,
  isVideoLoading,
  videoError,
  generatedVideoUrl,
  hasPlanVideoAccess,
  planVideoLimit,
  remainingVideos,
  planLabel,
  videoAccessCode,
  onVideoAccessCodeChange,
  onVideoAccessSubmit,
  videoAccessError,
}) => {
	const [downloadResolution] = useState<DownloadResolution>('original');
	const [downloadError, setDownloadError] = useState<string | null>(null);
	const [isProcessingDownload, setIsProcessingDownload] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [showVideoPanel, setShowVideoPanel] = useState(false);

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
    const load = (url: string, useCrossOrigin: boolean) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        if (useCrossOrigin) {
          img.crossOrigin = 'anonymous';
        }
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Could not load the source image for download.'));
        img.src = url;
      });

    try {
      return await load(sourceUrl, true);
    } catch {
      if (!/^https?:\/\//i.test(sourceUrl)) {
        throw new Error('Could not load the source image for download.');
      }
      const proxiedUrl = `/api/galleryHandler?action=proxy&url=${encodeURIComponent(sourceUrl)}`;
      return load(proxiedUrl, false);
    }
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

  const getResolutionCost = (_resolution: DownloadResolution) => downloadCreditConfig.original;

  const exportResolutionBlob = async (resolution: DownloadResolution) => {
    const preferredSource = getResolutionSource(resolution);
    const sourceUrl = preferredSource ?? imageUrl;
    if (!sourceUrl) {
      throw new Error('Original export is unavailable. Generate the scene again.');
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

  const handleDownload = async () => {
    if (!imageUrl) return;
    setDownloadError(null);
    setIsProcessingDownload(true);
    try {
      const blob = await exportResolutionBlob(downloadResolution);
      const chargeResult = await Promise.resolve(onChargeDownloadCredits(downloadResolution));
      if (!chargeResult.ok) {
        setDownloadError(chargeResult.message ?? 'Not enough credits available for this download.');
        return;
      }
      const url = URL.createObjectURL(blob);
      triggerDownload(url, `ai-mockup.png`);
      URL.revokeObjectURL(url);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : HIGH_RES_UNAVAILABLE_MESSAGE);
    } finally {
      setIsProcessingDownload(false);
    }
  };

  const isVideoLocked = planVideoLimit === 0;

  return (
    <div className="flex flex-col w-full">
      {/* Lightbox */}
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
            onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); }}
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

      {/* Preview frame */}
      <div
        ref={containerRef}
        className="relative w-full min-h-[22rem] sm:min-h-[40rem] max-h-[70vh] flex items-center justify-center rounded-xl bg-white overflow-hidden dark:bg-white/5 dark:backdrop-blur-[20px] dark:backdrop-saturate-[180%]"
      >
        {isImageLoading ? (
          <GenerationProgress />
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
                ? ({ width: `${frameSize.width}px`, height: `${frameSize.height}px` } as React.CSSProperties)
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

      {/* ── Unified Action Bar ─────────────────────────────────────────── */}
      {(imageUrl || imageError) && !isImageLoading && (
        <>
          <div className="mt-3 border-t border-gray-100 dark:border-white/8 pt-3 flex flex-wrap items-center gap-2">

            {/* Ghost: Reset */}
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-transparent text-gray-700 font-semibold px-3 py-2 text-sm transition hover:border-indigo-600 hover:text-indigo-600 dark:border-white/10 dark:text-white/70 dark:hover:border-white/30 dark:hover:text-white"
              aria-label="Reset"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 9a9 9 0 0114.13-5.12M20 15a9 9 0 01-14.13 5.12" />
              </svg>
              Reset
            </button>

            {/* Primary: Download */}
            {imageUrl && (
              <button
                onClick={handleDownload}
                disabled={isProcessingDownload}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 text-white font-semibold px-4 py-2 text-sm transition hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-400"
                aria-label="Download Image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                {isProcessingDownload ? 'Preparing…' : 'Download'}
              </button>
            )}

            {/* Divider */}
            {imageUrl && (
              <span className="hidden sm:block h-5 w-px bg-gray-200 dark:bg-white/10" aria-hidden="true" />
            )}

            {/* Outlined: Edit Image / Refine Image */}
            {imageUrl && (
              <button
                onClick={() => { setShowEditPanel(v => !v); setShowVideoPanel(false); }}
                className={`inline-flex items-center gap-1.5 rounded-xl border font-semibold px-3 py-2 text-sm transition ${
                  showEditPanel
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:bg-indigo-500/10'
                    : 'border-gray-200 text-gray-700 hover:border-indigo-600 hover:text-indigo-600 dark:border-white/10 dark:text-white/70 dark:hover:border-white/30 dark:hover:text-white'
                }`}
              >
                {/* Pencil icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {editPrompt.trim() ? 'Refine Image' : 'Edit Image'}
              </button>
            )}

            {/* Outlined: Video */}
            {imageUrl && (
              <button
                onClick={() => { setShowVideoPanel(v => !v); setShowEditPanel(false); }}
                className={`inline-flex items-center gap-1.5 rounded-xl border font-semibold px-3 py-2 text-sm transition ${
                  showVideoPanel
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:bg-indigo-500/10'
                    : 'border-gray-200 text-gray-700 hover:border-indigo-600 hover:text-indigo-600 dark:border-white/10 dark:text-white/70 dark:hover:border-white/30 dark:hover:text-white'
                }`}
              >
                {isVideoLocked ? (
                  <>
                    {/* Lock icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Video (Locked)
                  </>
                ) : (
                  <>
                    {/* Film icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                    </svg>
                    Create Video
                  </>
                )}
              </button>
            )}

            {/* Download error */}
            {downloadError && (
              <span className="w-full mt-1 text-xs text-red-500 dark:text-red-400">{downloadError}</span>
            )}
          </div>

          {/* Edit Image panel — inline, no card border */}
          {showEditPanel && imageUrl && (
            <div className="mt-3">
              <ImageEditor
                editPrompt={editPrompt}
                onPromptChange={onEditPromptChange}
                onEditImage={onEditImage}
                isEditing={isImageLoading}
              />
            </div>
          )}

          {/* Video panel — inline, no card border */}
          {showVideoPanel && imageUrl && (
            <div className="mt-3">
              <VideoGenerator
                videoPrompt={videoPrompt}
                onPromptChange={onVideoPromptChange}
                onGenerateVideo={onGenerateVideo}
                isVideoLoading={isVideoLoading}
                videoError={videoError}
                generatedVideoUrl={generatedVideoUrl}
                isGenerating={isVideoLoading || isImageLoading}
                hasAccess={hasPlanVideoAccess}
                lockMessage={planVideoLimit === 0 ? 'Video generation is disabled.' : undefined}
                showAccessCodeField={planVideoLimit === 0}
                remainingVideos={planVideoLimit > 0 ? remainingVideos : null}
                planLabel={planLabel}
                accessCode={videoAccessCode}
                onAccessCodeChange={onVideoAccessCodeChange}
                onAccessSubmit={onVideoAccessSubmit}
                accessError={videoAccessError}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GeneratedImage;
