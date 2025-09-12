import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { socialService } from '../services/socialService';
import { useAuth } from '../context/AuthContext';
import { 
  UserPlus, 
  UserMinus, 
  Play, 
  Users, 
  Eye,
  Calendar,
  ThumbsUp,
  Settings
} from 'lucide-react';

const Channel = () => {
  const { username } = useParams();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchChannelData();
  }, [username]);

  const fetchChannelData = async () => {
    try {
      const response = await authService.getChannelProfile(username);
      setChannel(response.data);
      setIsSubscribed(response.data.isSubscribed || false);
      
      // Fetch channel videos
      const videosResponse = await authService.getChannelVideos(response.data._id);
      setVideos(videosResponse.data || []);
    } catch (error) {
      console.error('Error fetching channel data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!isAuthenticated) return;
    
    try {
      await socialService.toggleSubscription(channel._id);
      setIsSubscribed(!isSubscribed);
      setChannel(prev => ({
        ...prev,
        subscriberCount: isSubscribed ? prev.subscriberCount - 1 : prev.subscriberCount + 1
      }));
    } catch (error) {
      console.error('Error toggling subscription:', error);
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
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="pt-16 pl-64 pr-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-300 rounded-lg mb-6"></div>
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-300 rounded w-48"></div>
                <div className="h-4 bg-gray-300 rounded w-32"></div>
              </div>
            </div>
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

  if (!channel) {
    return (
      <div className="pt-16 pl-64 pr-8 py-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Channel not found</h1>
          <p className="text-gray-600 mb-6">The channel you're looking for doesn't exist.</p>
          <Link to="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 pl-64 pr-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Cover Image */}
        {channel.coverImage && (
          <div className="h-64 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg mb-6 relative overflow-hidden">
            <img
              src={channel.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Channel Info */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center space-x-6">
            <img
              src={channel.avatar || '/default-avatar.png'}
              alt={channel.fullName}
              className="w-20 h-20 rounded-full object-cover"
            />
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {channel.fullName}
              </h1>
              <p className="text-gray-600 mb-4">@{channel.username}</p>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{formatViews(channel.subscriberCount)} subscribers</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Play className="h-4 w-4" />
                  <span>{videos.length} videos</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isAuthenticated && user._id !== channel._id && (
              <button
                onClick={handleSubscribe}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  isSubscribed
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isSubscribed ? (
                  <>
                    <UserMinus className="h-4 w-4" />
                    <span>Unsubscribe</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>Subscribe</span>
                  </>
                )}
              </button>
            )}
            
            {isAuthenticated && user._id === channel._id && (
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Manage Channel</span>
              </Link>
            )}
          </div>
        </div>

        {/* Videos Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Videos</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Sort by:</span>
              <select className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          {videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video) => (
                <div key={video._id} className="video-card group">
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
                    <Link to={`/video/${video._id}`}>
                      <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors mb-2">
                        {video.title}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
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
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Play className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No videos yet</h3>
              <p className="text-gray-600">This channel hasn't uploaded any videos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Channel;
