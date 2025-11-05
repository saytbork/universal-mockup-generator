
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface GeneratedImageProps {
  imageUrl: string | null;
  isImageLoading: boolean;
  imageError: string | null;
  onReset: () => void;
}

const GeneratedImage: React.FC<GeneratedImageProps> = ({ 
  imageUrl, 
  isImageLoading,
  imageError, 
  onReset,
}) => {

  const handleDownload = () => {
    if (!imageUrl) return;

    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'ai-mockup.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <div className="absolute bottom-2 right-2 flex items-center space-x-2">
                 <button
                    onClick={onReset}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out flex items-center space-x-2 shadow-lg"
                    aria-label="Reset"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5" />
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 9a9 9 0 0114.13-5.12M20 15a9 9 0 01-14.13 5.12" />
                    </svg>
                    <span>Reset</span>
                </button>
                {imageUrl && (
                    <button
                        onClick={handleDownload}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out flex items-center space-x-2 shadow-lg"
                        aria-label="Download Image"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <span>Download</span>
                    </button>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default GeneratedImage;
