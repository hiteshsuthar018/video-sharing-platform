import React, { useState, useEffect } from 'react';
import { socialService } from '../../services/socialService';
import { useAuth } from '../../context/AuthContext';
import { 
  ThumbsUp, 
  ThumbsDown, 
  MoreVertical,
  Send,
  Reply
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Comments = ({ videoId }) => {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await socialService.getComments(videoId);
      setComments(response.data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!isAuthenticated) {
      toast.error('Please login to comment');
      return;
    }

    try {
      setSubmitting(true);
      await socialService.addComment(videoId, newComment);
      setNewComment('');
      fetchComments(); // Refresh comments
      toast.success('Comment added successfully!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!isAuthenticated) {
      toast.error('Please login to like comments');
      return;
    }

    try {
      await socialService.toggleCommentLike(commentId);
      fetchComments(); // Refresh comments
    } catch (error) {
      console.error('Error toggling comment like:', error);
      toast.error('Failed to update like');
    }
  };

  const formatTimeAgo = (date) => {
    if (!date) return '';
    const now = new Date();
    const commentDate = new Date(date);
    const diffInSeconds = Math.floor((now - commentDate) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
  };

  const CommentItem = ({ comment }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(comment.likesCount || 0);

    const handleLike = async () => {
      const wasLiked = isLiked;
      setIsLiked(!isLiked);
      setLikesCount(prev => wasLiked ? prev - 1 : prev + 1);
      
      try {
        await socialService.toggleCommentLike(comment._id);
      } catch (error) {
        // Revert on error
        setIsLiked(wasLiked);
        setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
        console.error('Error toggling comment like:', error);
      }
    };

    return (
      <div className="flex space-x-3 py-4">
        <img
          src={comment.owner?.avatar || 'https://via.placeholder.com/32x32/3B82F6/FFFFFF?text=U'}
          alt={comment.owner?.fullName}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-gray-900">
              {comment.owner?.fullName || 'Anonymous'}
            </span>
            <span className="text-xs text-gray-500">
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm text-gray-700 mb-2 whitespace-pre-wrap">
            {comment.content}
          </p>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 text-xs transition-colors duration-200 ${
                isLiked 
                  ? 'text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ThumbsUp className="h-3 w-3" />
              <span>{likesCount}</span>
            </button>
            <button className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200">
              <ThumbsDown className="h-3 w-3" />
            </button>
            <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200">
              Reply
            </button>
          </div>
        </div>
        <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Comments ({comments.length})
      </h3>

      {/* Add Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="flex space-x-3">
            <img
              src={user?.avatar || 'https://via.placeholder.com/32x32/3B82F6/FFFFFF?text=U'}
              alt={user?.fullName}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="2"
                disabled={submitting}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <Send className="h-4 w-4" />
                  <span>{submitting ? 'Posting...' : 'Comment'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-sm text-gray-600">
            Please <a href="/login" className="text-blue-600 hover:underline">sign in</a> to comment
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex space-x-3 py-4 animate-pulse">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} />
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-gray-600">No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Comments;
