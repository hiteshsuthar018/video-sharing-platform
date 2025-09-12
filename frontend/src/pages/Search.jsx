import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { videoService } from '../services/videoService';
import VideoCard from '../components/video/VideoCard';
import VideoSkeleton from '../components/ui/VideoSkeleton';
import { Search as SearchIcon, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const searchQuery = searchParams.get('q');
    if (searchQuery) {
      setQuery(searchQuery);
      performSearch(searchQuery);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setHasSearched(true);
      const response = await videoService.getAllVideos({
        page: 1,
        limit: 20,
        query: searchQuery,
        sortBy: 'createdAt',
        sortType: 'desc'
      });
      setVideos(response.data.docs || []);
    } catch (error) {
      console.error('Error searching videos:', error);
      toast.error('Failed to search videos');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
      performSearch(query.trim());
    }
  };

  const renderSkeletons = () => {
    return Array.from({ length: 8 }).map((_, index) => (
      <VideoSkeleton key={index} />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search videos, channels, and more..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </form>
        </div>

        {/* Search Results */}
        {hasSearched && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Search results for "{query}"
              </h1>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {renderSkeletons()}
              </div>
            ) : videos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((video) => (
                  <VideoCard key={video._id} video={video} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No videos found</h2>
                <p className="text-gray-600 mb-6">
                  Try searching with different keywords or check your spelling.
                </p>
                <button
                  onClick={() => {
                    setQuery('');
                    setSearchParams({});
                    setHasSearched(false);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        )}

        {/* Default state when no search has been performed */}
        {!hasSearched && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎥</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Search for videos</h2>
            <p className="text-gray-600 mb-6">
              Enter a search term above to find videos, channels, and more.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;