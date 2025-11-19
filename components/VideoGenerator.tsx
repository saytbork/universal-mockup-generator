
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
    <div className="flex flex-col items-center justify-center w-full p-4 bg-gray-800 rounded-lg border-2 border-dashed border-gray-600">
      <h3 className="text-lg font-semibold text-gray-300 mb-4 w-full">4. Generate Video (Optional)</h3>
      
      <div className="w-full space-y-4">
        {!hasAccess && (
          <div className="rounded-lg border border-yellow-400/40 bg-yellow-500/10 p-4 space-y-2">
            <p className="text-sm text-yellow-100 font-medium">Video access locked</p>
            <p className="text-xs text-yellow-200">
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
                    className="flex-1 rounded-md border border-gray-600 bg-gray-900/60 px-3 py-2 text-white text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    onClick={onAccessSubmit}
                    className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600 transition"
                  >
                    Unlock
                  </button>
                </div>
                {accessError && <p className="text-xs text-red-300">{accessError}</p>}
              </>
            ) : (
              <p className="text-xs text-yellow-200">Upgrade to Creator or Studio to unlock video exports.</p>
            )}
          </div>
        )}
        {hasAccess && typeof remainingVideos === 'number' && planLabel && (
          <p className="text-xs text-gray-400">
            {remainingVideos} video credits left on {planLabel}
          </p>
        )}
        <div className="flex flex-col space-y-2">
          <label htmlFor="video-prompt" className="text-sm font-medium text-gray-400">
            Describe how the image should animate:
          </label>
          <input
            id="video-prompt"
            type="text"
            value={videoPrompt}
            onChange={onPromptChange}
            placeholder="e.g., steam rises from the cup, subtle wind blows"
            className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
          />
        </div>

        <button
          onClick={onGenerateVideo}
          disabled={isGenerating || !videoPrompt || !hasAccess}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900/50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
        >
          {isVideoLoading ? 'Generating Video...' : 'Generate Video'}
        </button>
      </div>
      
      <div className="relative w-full min-h-[10rem] flex items-center justify-center rounded-md bg-gray-900/50 mt-4">
        {isVideoLoading ? (
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-400 max-w-xs px-2">
                Generating video... This can take a few minutes. Please be patient.
            </p>
          </div>
        ) : videoError ? (
          <div className="text-center text-red-400 px-4">
            <p className="font-semibold">Video Generation Failed</p>
            <p className="text-sm">{videoError}</p>
          </div>
        ) : generatedVideoUrl ? (
          <video
            src={generatedVideoUrl}
            controls
            autoPlay
            loop
            className="max-h-full max-w-full object-contain rounded-md"
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
