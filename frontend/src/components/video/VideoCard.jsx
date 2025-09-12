import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, MoreVertical } from 'lucide-react';

const VideoCard = ({ video, showChannel = true }) => {
  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views?.toString() || '0';
  };

  const formatDuration = (duration) => {
    if (!duration) return '0:00';
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatTimeAgo = (date) => {
    if (!date) return '';
    const now = new Date();
    const videoDate = new Date(date);
    const diffInSeconds = Math.floor((now - videoDate) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
  };

  return (
    <div className="group cursor-pointer">
      <Link to={`/video/${video._id}`} className="block">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-200 rounded-xl overflow-hidden mb-3">
          <img
            src={video.thumbnail || 'https://via.placeholder.com/320x180/6B7280/FFFFFF?text=No+Thumbnail'}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Duration badge */}
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
              {formatDuration(video.duration)}
            </div>
          )}

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
              <div className="w-0 h-0 border-l-[8px] border-l-blue-600 border-y-[6px] border-y-transparent ml-1"></div>
            </div>
          </div>
        </div>

        {/* Video Info */}
        <div className="flex space-x-3">
          {/* Channel Avatar */}
          {showChannel && (
            <div className="flex-shrink-0">
              <img
                src={video.owner?.avatar || 'https://via.placeholder.com/40x40/3B82F6/FFFFFF?text=U'}
                alt={video.owner?.fullName}
                className="w-9 h-9 rounded-full object-cover"
              />
            </div>
          )}

          {/* Video Details */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
              {video.title}
            </h3>
            
            {showChannel && (
              <p className="text-xs text-gray-600 mt-1 hover:text-gray-900 transition-colors duration-200">
                {video.owner?.fullName || 'Unknown Channel'}
              </p>
            )}
            
            <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>{formatViews(video.views)} views</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{formatTimeAgo(video.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* More options button */}
          <button className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </Link>
    </div>
  );
};

export default VideoCard;
