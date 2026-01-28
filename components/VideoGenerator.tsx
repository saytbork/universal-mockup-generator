
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface VideoGeneratorProps {
  videoPrompt: string;
  onPromptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onGenerateVideo: () => void;
  isVideoLoading: boolean;
  videoError: string | null;
  generatedVideoUrl: string | null;
  isGenerating: boolean;
  hasAccess: boolean;
  lockMessage?: string;
  showAccessCodeField?: boolean;
  remainingVideos?: number | null;
  planLabel?: string;
  accessCode: string;
  onAccessCodeChange: (value: string) => void;
  onAccessSubmit: () => void;
  accessError: string | null;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({
  videoPrompt,
  onPromptChange,
  onGenerateVideo,
  isVideoLoading,
  videoError,
  generatedVideoUrl,
  isGenerating,
  hasAccess,
  lockMessage,
  showAccessCodeField = true,
  remainingVideos,
  planLabel,
  accessCode,
  onAccessCodeChange,
  onAccessSubmit,
  accessError,
}) => {
  const showLocked = !hasAccess;
  const canGenerate = hasAccess && !!videoPrompt.trim() && !isGenerating;

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 dark:bg-white/5 dark:border-white/10 dark:backdrop-blur-[20px] dark:backdrop-saturate-[180%]">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Video</h3>
          <p className="text-xs text-gray-600 dark:text-white/60">
            Animate the current image into a short clip.
          </p>
        </div>
        <div className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[10px] font-black tracking-[0.3em] text-gray-500 dark:border-white/10 dark:bg-black/20 dark:text-white/50">
          OPTIONAL
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {hasAccess && typeof remainingVideos === 'number' && planLabel && (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-700 dark:border-white/10 dark:bg-black/20 dark:text-white/70">
            {remainingVideos} video credits left on {planLabel}
          </div>
        )}

        {showLocked && (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-3 dark:border-white/10 dark:bg-black/20">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Video is locked</p>
              <p className="text-xs text-gray-600 dark:text-white/60">
                {lockMessage ?? 'Unlock video generation with an access code, or upgrade your plan.'}
              </p>
            </div>
            {showAccessCodeField ? (
              <>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="password"
                    value={accessCode}
                    onChange={(event) => onAccessCodeChange(event.target.value)}
                    placeholder="Access code"
                    className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 text-sm placeholder:text-gray-500 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-black/20 dark:border-white/10 dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/30"
                  />
                  <button
                    type="button"
                    onClick={onAccessSubmit}
                    className="rounded-2xl bg-indigo-600 text-white px-5 py-3 text-sm font-semibold hover:bg-indigo-700 transition dark:bg-indigo-500 dark:hover:bg-indigo-400"
                  >
                    Unlock
                  </button>
                </div>
                {accessError && (
                  <p className="text-xs text-gray-600 dark:text-white/60">{accessError}</p>
                )}
              </>
            ) : (
              <a
                href="/pricing"
                className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:border-indigo-600 transition dark:border-white/10 dark:bg-black/20 dark:text-white dark:hover:border-white/30"
              >
                View plans
              </a>
            )}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="video-prompt" className="block text-xs font-semibold text-gray-700 dark:text-white/70">
            Motion prompt
          </label>
          <textarea
            id="video-prompt"
            value={videoPrompt}
            onChange={onPromptChange}
            placeholder="Example: subtle handheld camera sway, soft light flicker, steam rises, fabric gently moves in the wind."
            className="w-full min-h-[86px] resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition disabled:opacity-60 dark:bg-black/20 dark:border-white/10 dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/30"
            disabled={!hasAccess || isGenerating}
          />
          <p className="text-[11px] text-gray-500 dark:text-white/45">
            Keep it subtle. Short, realistic motions work best.
          </p>
        </div>

        <button
          type="button"
          onClick={onGenerateVideo}
          disabled={!canGenerate}
          className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:disabled:bg-white/10 dark:disabled:text-white/40"
        >
          {isVideoLoading ? 'Generating video…' : 'Generate video'}
        </button>
      </div>

      <div className="relative w-full mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:bg-white/5 dark:border-white/10 dark:backdrop-blur-[20px] dark:backdrop-saturate-[180%]">
        <div className="w-full aspect-video flex items-center justify-center">
        {isVideoLoading ? (
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600 max-w-xs px-2 dark:text-white/60">
              Generating video… this can take a couple minutes.
            </p>
          </div>
        ) : videoError ? (
          <div className="text-center text-gray-500 px-4 dark:text-white/60">
            <p className="font-semibold">Video Generation Failed</p>
            <p className="text-sm">{videoError}</p>
          </div>
        ) : generatedVideoUrl ? (
          <video
            src={generatedVideoUrl}
            controls
            autoPlay
            loop
            className="max-h-full max-w-full object-contain rounded-xl"
          />
        ) : (
          <div className="text-center text-gray-500 dark:text-white/40 px-6">
            <p className="text-sm font-semibold text-gray-700 dark:text-white/70">No video yet</p>
            <p className="text-xs mt-1">Generate a clip and it will appear here.</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default VideoGenerator;
