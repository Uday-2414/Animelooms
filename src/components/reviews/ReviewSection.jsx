import React, { useState, useEffect } from 'react';
import { reviewService } from '../../services/reviewService';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import SectionHeader from '../ui/SectionHeader';
import Button from '../ui/Button';
import { MessageSquarePlus } from 'lucide-react';
import { trackReviewCreated, trackReviewUpdated, trackReviewDeleted, trackAnimeRated } from '../../services/analyticsService';

export default function ReviewSection({ animeId, animeTitle, currentUser, onLoginPrompt }) {
  const [reviews, setReviews] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  const [userReview, setUserReview] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    async function init() {
      setLoading(true);
      try {
        const [reviewsData, myReview] = await Promise.all([
          reviewService.getReviewsForAnime(animeId, 1, 10),
          currentUser ? reviewService.getUserReviewForAnime(currentUser.id, animeId) : Promise.resolve(null)
        ]);

        if (isMounted) {
          setReviews(reviewsData.reviews);
          setTotalCount(reviewsData.count);
          setHasMore(reviewsData.reviews.length < reviewsData.count);
          setUserReview(myReview);
        }
      } catch (err) {
        console.error('Failed to init reviews:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    init();

    return () => { isMounted = false; };
  }, [animeId, currentUser]);

  const loadMore = async () => {
    const nextPage = page + 1;
    try {
      const { reviews: newReviews, count } = await reviewService.getReviewsForAnime(animeId, nextPage, 10);
      setReviews(prev => [...prev, ...newReviews]);
      setPage(nextPage);
      setHasMore([...reviews, ...newReviews].length < count);
    } catch (e) {
      console.error('Failed to load more reviews', e);
    }
  };

  const handleWriteReviewClick = () => {
    if (!currentUser) {
      if (onLoginPrompt) onLoginPrompt();
      return;
    }
    setIsFormOpen(true);
  };

  const handleReviewSubmit = async (data) => {
    if (!currentUser) return;
    setFormLoading(true);
    try {
      const savedReview = await reviewService.submitReview(
        currentUser.id,
        animeId,
        data.rating,
        data.title,
        data.review
      );

      // Re-fetch to ensure profile data is attached
      const completeReview = await reviewService.getUserReviewForAnime(currentUser.id, animeId);
      
      setUserReview(completeReview);
      
      // Update list optimistically
      setReviews(prev => {
        const idx = prev.findIndex(r => r.id === completeReview.id);
        if (idx >= 0) {
          const newArr = [...prev];
          newArr[idx] = completeReview;
          return newArr;
        }
        return [completeReview, ...prev];
      });

      if (!userReview) {
        trackReviewCreated(animeId, data.rating);
        trackAnimeRated(animeId, data.rating);
        setTotalCount(prev => prev + 1);
      } else {
        trackReviewUpdated(animeId, data.rating);
      }

      setIsFormOpen(false);
    } catch (e) {
      console.error('Failed to submit review', e);
      alert('Failed to save your review. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (reviewToDelete) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    
    try {
      await reviewService.deleteReview(currentUser.id, animeId);
      setUserReview(null);
      setReviews(prev => prev.filter(r => r.id !== reviewToDelete.id));
      setTotalCount(prev => Math.max(0, prev - 1));
      trackReviewDeleted(animeId);
    } catch (e) {
      console.error('Failed to delete review', e);
      alert('Failed to delete review.');
    }
  };

  return (
    <section className="space-y-6 pt-8 border-t border-white/5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHeader
          title="Community Reviews"
          subtitle={`Read what others think about ${animeTitle || 'this anime'}`}
          useLogoFont={false}
        />
        
        {!isFormOpen && (
          <Button 
            variant="primary" 
            onClick={handleWriteReviewClick}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <MessageSquarePlus className="h-4 w-4" />
            {userReview ? 'Edit Your Review' : 'Write a Review'}
          </Button>
        )}
      </div>

      {isFormOpen && (
        <div className="py-4">
          <ReviewForm 
            initialData={userReview} 
            onSubmit={handleReviewSubmit} 
            onCancel={() => setIsFormOpen(false)}
            isLoading={formLoading}
          />
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-surface-chrome/30 border border-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-surface-chrome/20 p-8 text-center text-gray-400 font-ui text-sm">
          No reviews yet. Be the first to share your thoughts!
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <ReviewCard 
              key={review.id} 
              review={review} 
              currentUser={currentUser}
              onEdit={() => setIsFormOpen(true)}
              onDelete={handleDelete}
            />
          ))}
          
          {hasMore && (
            <div className="pt-4 text-center">
              <Button variant="secondary" onClick={loadMore}>
                Load More Reviews
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
