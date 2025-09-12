import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { videoService } from '../services/videoService';
import { socialService } from '../services/socialService';
import { useAuth } from '../context/AuthContext';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  Download, 
  Flag,
  MoreVertical,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings
} from 'lucide-react';
import VideoCard from '../components/video/VideoCard';
import VideoSkeleton from '../components/ui/VideoSkeleton';
import Comments from '../components/video/Comments';
import { toast } from 'react-hot-toast';

const VideoDetail = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [video, setVideo] = useState(null);
  const [suggestedVideos, setSuggestedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [subscribersCount, setSubscribersCount] = useState(0);
  
  // Video player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    if (videoId) {
      fetchVideoDetails();
      fetchSuggestedVideos();
    }
  }, [videoId]);

  const fetchVideoDetails = async () => {
    try {
      setLoading(true);
      const response = await videoService.getVideoById(videoId);
      setVideo(response.data);
      setLikesCount(response.data.likesCount || 0);
      setSubscribersCount(response.data.owner?.subscribersCount || 0);
    } catch (error) {
      console.error('Error fetching video:', error);
      toast.error('Failed to load video');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestedVideos = async () => {
    try {
      const response = await videoService.getAllVideos({
        page: 1,
        limit: 10,
        sortBy: 'views',
        sortType: 'desc'
      });
      setSuggestedVideos(response.data.docs || []);
    } catch (error) {
      console.error('Error fetching suggested videos:', error);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like videos');
      return;
    }

    try {
      await socialService.toggleVideoLike(videoId);
      setIsLiked(!isLiked);
      setIsDisliked(false);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const handleDislike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to dislike videos');
      return;
    }

    try {
      // Implement dislike functionality
      setIsDisliked(!isDisliked);
      setIsLiked(false);
    } catch (error) {
      console.error('Error toggling dislike:', error);
      toast.error('Failed to update dislike');
    }
  };

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to subscribe');
      return;
    }

    try {
      await socialService.toggleSubscription(video.owner._id);
      setIsSubscribed(!isSubscribed);
      setSubscribersCount(prev => isSubscribed ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Error toggling subscription:', error);
      toast.error('Failed to update subscription');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: video.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views?.toString() || '0';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <VideoSkeleton />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <VideoSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-6xl mb-4">😞</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Video not found</h2>
            <p className="text-gray-600 mb-6">The video you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video Section */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden mb-6">
              <video
                className="w-full h-full object-cover"
                poster={video.thumbnail}
                controls
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.target.duration)}
              >
                <source src={video.videoFile} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Video Info */}
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-gray-900">{video.title}</h1>
              
              {/* Video Stats and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <span>{formatViews(video.views)} views</span>
                  <span>{formatTimeAgo(video.createdAt)}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors duration-200 ${
                      isLiked 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>{likesCount}</span>
                  </button>
                  
                  <button
                    onClick={handleDislike}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors duration-200 ${
                      isDisliked 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200">
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                  
                  <button className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Channel Info */}
              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center space-x-4">
                  <img
                    src={video.owner?.avatar || 'https://via.placeholder.com/48x48/3B82F6/FFFFFF?text=U'}
                    alt={video.owner?.fullName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{video.owner?.fullName}</h3>
                    <p className="text-sm text-gray-600">{subscribersCount} subscribers</p>
                  </div>
                </div>
                
                <button
                  onClick={handleSubscribe}
                  className={`px-6 py-2 rounded-full font-medium transition-colors duration-200 ${
                    isSubscribed
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </button>
              </div>

              {/* Video Description */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-sm text-gray-600 whitespace-pre-wrap">
                  {video.description || 'No description available.'}
                </div>
              </div>

              {/* Comments Section */}
              <Comments videoId={videoId} />
            </div>
          </div>

          {/* Suggested Videos Sidebar */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Suggested Videos</h2>
            <div className="space-y-4">
              {suggestedVideos
                .filter(suggestedVideo => suggestedVideo._id !== videoId)
                .slice(0, 8)
                .map((suggestedVideo) => (
                  <VideoCard key={suggestedVideo._id} video={suggestedVideo} showChannel={true} />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetail;