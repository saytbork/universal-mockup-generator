
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface VideoGeneratorProps {
  videoPrompt: string;
  onPromptChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4 w-full">Generate Video (Optional)</h3>
      
      <div className="w-full space-y-4">
        {!hasAccess && (
          <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-2">
            <p className="text-sm text-gray-900 font-medium">Video access locked</p>
            <p className="text-xs text-gray-600">
              {lockMessage ?? 'Enter the access code provided to your team to unlock video generation.'}
            </p>
            {showAccessCodeField ? (
              <>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="password"
                    value={accessCode}
                    onChange={(event) => onAccessCodeChange(event.target.value)}
                    placeholder="Enter access code"
                    className="flex-1 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-gray-900 text-sm placeholder:text-gray-500 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white"
                  />
                  <button
                    onClick={onAccessSubmit}
                    className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition"
                  >
                    Unlock
                  </button>
                </div>
                {accessError && <p className="text-xs text-gray-500">{accessError}</p>}
              </>
            ) : (
              <p className="text-xs text-gray-600">Upgrade to Creator or Studio to unlock video exports.</p>
            )}
          </div>
        )}
        {hasAccess && typeof remainingVideos === 'number' && planLabel && (
          <p className="text-xs text-gray-600">
            {remainingVideos} video credits left on {planLabel}
          </p>
        )}
        <div className="flex flex-col space-y-2">
          <label htmlFor="video-prompt" className="text-sm font-medium text-gray-600">
            Describe how the image should animate:
          </label>
          <input
            id="video-prompt"
            type="text"
            value={videoPrompt}
            onChange={onPromptChange}
            placeholder="e.g., steam rises from the cup, subtle wind blows"
            className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white transition"
          />
        </div>

        <button
          onClick={onGenerateVideo}
          disabled={isGenerating || !videoPrompt || !hasAccess}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-2xl transition"
        >
          {isVideoLoading ? 'Generating Video...' : 'Generate Video'}
        </button>
      </div>
      
      <div className="relative w-full min-h-[10rem] flex items-center justify-center rounded-2xl bg-gray-50 border border-gray-200 mt-4 overflow-hidden">
        {isVideoLoading ? (
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600 max-w-xs px-2">
                Generating video... This can take a few minutes. Please be patient.
            </p>
          </div>
        ) : videoError ? (
          <div className="text-center text-gray-500 px-4">
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
          <div className="text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.55a2.5 2.5 0 010 4.09L15 18M5 8v8a2 2 0 002 2h4a2 2 0 002-2V8a2 2 0 00-2-2H7a2 2 0 00-2 2z" />
            </svg>
            <p>Your generated video will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoGenerator;
