import React, { useState } from 'react';
import { useReviews } from '../../hooks/useReviews';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import SectionHeader from '../ui/SectionHeader';
import Button from '../ui/Button';
import { MessageSquarePlus, Clock, Star, ThumbsUp } from 'lucide-react';
import { reviewService } from '../../services/reviewService';
import { activityService, ACTIVITY_TYPES } from '../../services/activityService';
import { trackReviewCreated, trackReviewUpdated, trackReviewDeleted, trackAnimeRated, trackReviewSorted } from '../../services/analyticsService';

const SORT_OPTIONS = [
  { key: 'newest', label: 'Newest', icon: Clock },
  { key: 'top_rated', label: 'Top Rated', icon: Star },
];

export default function ReviewSection({ animeId, animeTitle, animeImage, currentUser, onLoginPrompt }) {
  const {
    reviews, setReviews,
    totalCount, setTotalCount,
    loading, sort, changeSort,
    hasMore, loadMore,
    userReview, setUserReview,
    refreshReviews,
  } = useReviews(animeId, currentUser?.id);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const handleWriteReviewClick = () => {
    if (!currentUser) { if (onLoginPrompt) onLoginPrompt(); return; }
    setIsFormOpen(true);
  };

  const handleReviewSubmit = async (data) => {
    if (!currentUser) return;
    setFormLoading(true);
    try {
      await reviewService.submitReview(currentUser.id, animeId, data.rating, data.title, data.review, data.isSpoiler);
      const completeReview = await reviewService.getUserReviewForAnime(currentUser.id, animeId);
      setUserReview(completeReview);
      setReviews(prev => {
        const idx = prev.findIndex(r => r.id === completeReview?.id);
        if (idx >= 0) { const arr = [...prev]; arr[idx] = completeReview; return arr; }
        return [completeReview, ...prev];
      });
      if (!userReview) {
        trackReviewCreated(animeId, data.rating);
        trackAnimeRated(animeId, data.rating);
        setTotalCount(p => p + 1);
        activityService.logActivity(currentUser.id, ACTIVITY_TYPES.REVIEWED, animeId, animeTitle, animeImage, { rating: data.rating });
      } else {
        trackReviewUpdated(animeId, data.rating);
      }
      setIsFormOpen(false);
    } catch (e) {
      console.error('Failed to submit review', e);
      alert('Failed to save your review. Please try again.');
    } finally { setFormLoading(false); }
  };

  const handleDelete = async (reviewToDelete) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    try {
      await reviewService.deleteReview(currentUser.id, animeId);
      setUserReview(null);
      setReviews(prev => prev.filter(r => r.id !== reviewToDelete.id));
      setTotalCount(p => Math.max(0, p - 1));
      trackReviewDeleted(animeId);
    } catch (e) { console.error('Failed to delete review', e); }
  };

  const handleSortChange = (newSort) => {
    changeSort(newSort);
    trackReviewSorted(animeId, newSort);
  };

  return (
    <section className="space-y-6 pt-8 border-t border-white/5">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHeader
          title={`Community Reviews ${totalCount > 0 ? `(${totalCount})` : ''}`}
          subtitle={`Read what others think about ${animeTitle || 'this anime'}`}
          useLogoFont={false}
        />
        {!isFormOpen && (
          <Button variant="primary" onClick={handleWriteReviewClick} className="flex items-center gap-2 flex-shrink-0">
            <MessageSquarePlus className="h-4 w-4" />
            {userReview ? 'Edit Your Review' : 'Write a Review'}
          </Button>
        )}
      </div>

      {/* Sort Tabs */}
      {totalCount > 0 && (
        <div className="flex items-center gap-1 p-1 bg-surface-chrome/40 border border-white/5 rounded-xl w-fit">
          {SORT_OPTIONS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => handleSortChange(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-ui transition-all duration-200 ${sort === key ? 'bg-brand text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
              <Icon className="h-3 w-3" /> {label}
            </button>
          ))}
        </div>
      )}

      {/* Review Form */}
      {isFormOpen && (
        <div className="py-2">
          <ReviewForm initialData={userReview} onSubmit={handleReviewSubmit} onCancel={() => setIsFormOpen(false)} isLoading={formLoading} />
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-surface-chrome/30 border border-white/5 rounded-2xl animate-pulse" />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-surface-chrome/20 p-8 text-center text-gray-400 font-ui text-sm">
          No reviews yet. Be the first to share your thoughts!
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <ReviewCard key={review.id} review={review} currentUser={currentUser} onEdit={() => setIsFormOpen(true)} onDelete={handleDelete} />
          ))}
          {hasMore && (
            <div className="pt-4 text-center">
              <Button variant="secondary" onClick={loadMore}>Load More Reviews</Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
