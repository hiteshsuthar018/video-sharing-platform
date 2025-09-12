import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { socialService } from '../services/socialService';
import { useAuth } from '../context/AuthContext';
import { Users, Play, Eye, Calendar } from 'lucide-react';

const Subscriptions = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    }
  }, [user]);

  const fetchSubscriptions = async () => {
    try {
      const response = await socialService.getSubscribedChannels(user._id);
      setChannels(response.data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscriptions</h1>
          <p className="text-gray-600">Channels you're subscribed to</p>
        </div>

        {channels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {channels.map((subscription) => {
              const channel = subscription.subscribedChannel;
              if (!channel) return null;
              
              return (
                <Link
                  key={subscription._id}
                  to={`/channel/${channel.username}`}
                  className="card hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div className="text-center">
                    <img
                      src={channel.avatar || '/default-avatar.png'}
                      alt={channel.fullName}
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
                    />
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {channel.fullName}
                    </h3>
                    <p className="text-sm text-gray-600">@{channel.username}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions yet</h3>
            <p className="text-gray-600 mb-6">Subscribe to channels to see their latest videos here.</p>
            <Link to="/" className="btn-primary">
              Explore Channels
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;
