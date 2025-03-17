import React from 'react';

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-8">
      {/* Main loader container */}
      <div className="relative">
        {/* Outer rotating ring */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-spin">
          <div className="absolute inset-1 rounded-full bg-white" />
        </div>
        
        {/* Inner pulsing circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse" />
        </div>
        
        {/* Center static circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white" />
        </div>
      </div>

      {/* Loading text with animated background */}
      <div className="mt-8 relative">
        <div className="flex items-center space-x-4">
          <div className="h-0.5 w-8 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse" />
          <span className="text-lg font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
            Loading
          </span>
          <div className="h-0.5 w-8 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse" />
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-6 w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full w-full bg-gradient-to-r from-blue-500 to-purple-500 animate-[shimmer_2s_infinite]"
             style={{
               backgroundSize: '200% 100%',
               animation: 'shimmer 2s infinite linear',
               '@keyframes shimmer': {
                 '0%': { backgroundPosition: '200% 0' },
                 '100%': { backgroundPosition: '-200% 0' }
               }
             }} />
      </div>
    </div>
  );
};

export default Loading;