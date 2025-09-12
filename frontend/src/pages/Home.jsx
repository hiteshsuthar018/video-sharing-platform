import React, { useState, useEffect } from 'react';
import { videoService } from '../services/videoService';
import VideoCard from '../components/video/VideoCard';
import VideoSkeleton from '../components/ui/VideoSkeleton';
import { toast } from 'react-hot-toast';

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await videoService.getAllVideos({
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortType: 'desc'
      });
      setVideos(response.data.docs || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError('Failed to load videos');
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const renderSkeletons = () => {
    return Array.from({ length: 12 }).map((_, index) => (
      <VideoSkeleton key={index} />
    ));
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-6xl mb-4">😞</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchVideos}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to VideoShare</h1>
          <p className="text-gray-600">Discover amazing videos from creators around the world</p>
        </div>

        {/* Videos Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {renderSkeletons()}
          </div>
        ) : videos.length > 0 ? (
          <>
            {/* Featured Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Featured Videos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.slice(0, 8).map((video) => (
                  <VideoCard key={video._id} video={video} />
                ))}
              </div>
            </div>

            {/* More Videos */}
            {videos.length > 8 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">More Videos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {videos.slice(8).map((video) => (
                    <VideoCard key={video._id} video={video} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎥</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No videos yet</h2>
            <p className="text-gray-600 mb-6">Be the first to upload a video and start sharing!</p>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
              Upload Video
            </button>
          </div>
        )}

        {/* Load More Button */}
        {videos.length > 0 && (
          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm">
              Load More Videos
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;