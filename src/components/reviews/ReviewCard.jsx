import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, Trash2, Edit } from 'lucide-react';
import { reviewService } from '../../services/reviewService';
import { trackReviewLiked } from '../../services/analyticsService';

export default function ReviewCard({ review, currentUser, onEdit, onDelete }) {
  const [likes, setLikes] = useState({ total: 0, isLikedByMe: false });
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadLikes() {
      try {
        const data = await reviewService.getReviewLikes(review.id, currentUser?.id);
        if (isMounted) setLikes(data);
      } catch (e) {
        console.error('Failed to load likes', e);
      }
    }
    loadLikes();
    return () => { isMounted = false; };
  }, [review.id, currentUser]);

  const handleLike = async () => {
    if (!currentUser) return; // Open auth modal/redirect in a full implementation
    if (likeLoading) return;
    
    setLikeLoading(true);
    // Optimistic UI
    const wasLiked = likes.isLikedByMe;
    setLikes(prev => ({
      total: prev.isLikedByMe ? prev.total - 1 : prev.total + 1,
      isLikedByMe: !prev.isLikedByMe
    }));

    try {
      await reviewService.toggleLike(currentUser.id, review.id, wasLiked);
      if (!wasLiked) trackReviewLiked(review.id);
    } catch (e) {
      // Revert on failure
      setLikes({ total: wasLiked ? likes.total : likes.total - 1, isLikedByMe: wasLiked });
    } finally {
      setLikeLoading(false);
    }
  };

  const isOwner = currentUser?.id === review.user_id;
  const hasContent = review.title || review.review;
  const displayName = review.profiles?.full_name || 'Anonymous User';
  const avatarUrl = review.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;
  
  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-surface-chrome/30 border border-white/5 rounded-2xl p-5 space-y-4 hover:border-white/10 transition-colors">
      {/* Header: User Info & Rating */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <img src={avatarUrl} alt={displayName} className="w-10 h-10 rounded-full border border-white/10 object-cover" />
          <div>
            <h4 className="text-sm font-bold text-white font-ui">{displayName}</h4>
            <span className="text-[10px] text-gray-500 font-ui font-semibold">{formatDate(review.created_at)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-surface-card px-2 py-1 rounded-lg border border-white/5">
          <Star className="h-3.5 w-3.5 text-brand fill-current" />
          <span className="text-sm font-bold text-white font-ui">{review.rating}</span>
          <span className="text-xs text-gray-500 font-ui">/10</span>
        </div>
      </div>

      {/* Review Content */}
      {hasContent && (
        <div className="space-y-2">
          {review.title && <h5 className="text-base font-bold text-white font-ui leading-tight">{review.title}</h5>}
          {review.review && <p className="text-sm text-gray-300 font-ui leading-relaxed whitespace-pre-line">{review.review}</p>}
        </div>
      )}

      {/* Footer: Actions */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between">
        <button 
          onClick={handleLike}
          disabled={!currentUser}
          className={`flex items-center gap-1.5 text-xs font-semibold font-ui px-3 py-1.5 rounded-lg transition-colors duration-200 ${
            likes.isLikedByMe 
              ? 'text-brand bg-brand/10 border border-brand/20' 
              : 'text-gray-400 hover:text-white hover:bg-surface-card border border-transparent'
          }`}
        >
          <ThumbsUp className={`h-3.5 w-3.5 ${likes.isLikedByMe ? 'fill-current' : ''}`} />
          {likes.total > 0 ? likes.total : 'Helpful'}
        </button>

        {isOwner && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onEdit(review)}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-surface-card rounded-md transition-colors"
              title="Edit Review"
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
            <button 
              onClick={() => onDelete(review)}
              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors"
              title="Delete Review"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
