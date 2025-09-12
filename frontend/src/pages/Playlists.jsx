import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { playlistService } from '../services/playlistService';
import { useAuth } from '../context/AuthContext';
import { Bookmark, Plus, Play, MoreVertical } from 'lucide-react';

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({ name: '', description: '' });
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchPlaylists();
    }
  }, [user]);

  const fetchPlaylists = async () => {
    try {
      const response = await playlistService.getUserPlaylists(user._id);
      setPlaylists(response.data || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    try {
      const response = await playlistService.createPlaylist(newPlaylist);
      setPlaylists(prev => [response.data, ...prev]);
      setNewPlaylist({ name: '', description: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Playlists</h1>
            <p className="text-gray-600">Organize your favorite videos into playlists</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Playlist</span>
          </button>
        </div>

        {/* Create Playlist Form */}
        {showCreateForm && (
          <div className="card mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Playlist</h3>
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Playlist Name
                </label>
                <input
                  type="text"
                  value={newPlaylist.name}
                  onChange={(e) => setNewPlaylist(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="Enter playlist name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newPlaylist.description}
                  onChange={(e) => setNewPlaylist(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field"
                  rows="3"
                  placeholder="Enter playlist description"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Playlist
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Playlists Grid */}
        {playlists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {playlists.map((playlist) => (
              <Link
                key={playlist._id}
                to={`/playlist/${playlist._id}`}
                className="video-card group"
              >
                <div className="relative">
                  {playlist.videos && playlist.videos.length > 0 ? (
                    <img
                      src={playlist.videos[0].thumbnail}
                      alt={playlist.name}
                      className="w-full aspect-video object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                      <Bookmark className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="bg-white bg-opacity-90 rounded-full p-3">
                        <Play className="h-6 w-6 text-gray-900 ml-1" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                    {playlist.videos ? playlist.videos.length : 0} videos
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors mb-2">
                    {playlist.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {playlist.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bookmark className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No playlists yet</h3>
            <p className="text-gray-600 mb-6">Create your first playlist to organize your favorite videos.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              Create Your First Playlist
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Playlists;
