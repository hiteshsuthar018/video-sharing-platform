import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { socialService } from '../services/socialService';
import { Heart, Play, Eye, Calendar } from 'lucide-react';

const LikedVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLikedVideos();
  }, []);

  const fetchLikedVideos = async () => {
    try {
      const response = await socialService.getLikedVideos();
      setVideos(response.data || []);
    } catch (error) {
      console.error('Error fetching liked videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="pt-16 pl-64 pr-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-300 aspect-video rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 pl-64 pr-8 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Liked Videos</h1>
          <p className="text-gray-600">Videos you've liked will appear here</p>
        </div>

        {videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((like) => {
              const video = like.video;
              if (!video) return null;
              
              return (
                <div key={like._id} className="video-card group">
                  <Link to={`/video/${video._id}`} className="block">
                    <div className="relative">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full aspect-video object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="bg-white bg-opacity-90 rounded-full p-3">
                            <Play className="h-6 w-6 text-gray-900 ml-1" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="p-4">
                    <div className="flex items-start space-x-3">
                      <Link to={`/channel/${video.owner?.username}`}>
                        <img
                          src={video.owner?.avatar || '/default-avatar.png'}
                          alt={video.owner?.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </Link>
                      
                      <div className="flex-1 min-w-0">
                        <Link to={`/video/${video._id}`}>
                          <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
                            {video.title}
                          </h3>
                        </Link>
                        
                        <Link to={`/channel/${video.owner?.username}`}>
                          <p className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                            {video.owner?.fullName}
                          </p>
                        </Link>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{formatViews(video.views)} views</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(video.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center">
                        <Heart className="h-4 w-4 text-red-500" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No liked videos yet</h3>
            <p className="text-gray-600 mb-6">Videos you like will appear here for easy access.</p>
            <Link to="/" className="btn-primary">
              Explore Videos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedVideos;
