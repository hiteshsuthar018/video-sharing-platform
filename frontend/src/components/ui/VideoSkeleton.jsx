import React from 'react';

const VideoSkeleton = () => {
  return (
    <div className="animate-pulse">
      {/* Thumbnail skeleton */}
      <div className="aspect-video bg-gray-300 rounded-xl mb-3"></div>
      
      {/* Video info skeleton */}
      <div className="flex space-x-3">
        {/* Channel avatar skeleton */}
        <div className="flex-shrink-0">
          <div className="w-9 h-9 bg-gray-300 rounded-full"></div>
        </div>
        
        {/* Video details skeleton */}
        <div className="flex-1 min-w-0">
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
          
          <div className="mt-2 space-y-1">
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            <div className="h-3 bg-gray-300 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoSkeleton;
