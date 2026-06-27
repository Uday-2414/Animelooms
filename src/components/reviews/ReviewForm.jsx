import React, { useState } from 'react';
import { X, Star, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';

export default function ReviewForm({ initialData = null, onSubmit, onCancel, isLoading }) {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState(initialData?.title || '');
  const [review, setReview] = useState(initialData?.review || '');
  const [isSpoiler, setIsSpoiler] = useState(initialData?.is_spoiler || false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 10) { setError('Please select a rating from 1 to 10.'); return; }
    if (title && title.length > 100) { setError('Title cannot exceed 100 characters.'); return; }
    if (review && review.length > 2000) { setError('Review cannot exceed 2000 characters.'); return; }
    setError('');
    onSubmit({ rating, title: title.trim(), review: review.trim(), isSpoiler });
  };

  return (
    <div className="bg-surface-card border border-white/10 rounded-2xl p-6 shadow-2xl w-full max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-white font-ui">{initialData ? 'Edit Review' : 'Write a Review'}</h3>
        {onCancel && <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors"><X className="h-5 w-5" /></button>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg font-ui">{error}</div>}

        {/* Rating */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-300 font-ui uppercase tracking-wider">
            Your Rating <span className="text-brand">*</span>
          </label>
          <div className="flex items-center gap-1">
            {[...Array(10)].map((_, idx) => {
              const value = idx + 1;
              return (
                <button key={value} type="button" onClick={() => setRating(value)}
                  onMouseEnter={() => setHoverRating(value)} onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded">
                  <Star className={`h-6 w-6 transition-colors ${value <= (hoverRating || rating) ? 'text-brand fill-current' : 'text-gray-600'}`} />
                </button>
              );
            })}
            <span className="ml-3 text-lg font-black text-white font-ui w-8 text-center">{hoverRating || rating || '-'}</span>
            <span className="text-sm text-gray-500 font-ui">/10</span>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label htmlFor="review-title" className="block text-sm font-bold text-gray-300 font-ui uppercase tracking-wider">Review Title (Optional)</label>
          <input id="review-title" type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Summarize your thoughts..." maxLength={100}
            className="w-full bg-surface-chrome border border-white/10 rounded-xl px-4 py-3 text-white font-ui focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/50 transition-all placeholder:text-gray-600" />
        </div>

        {/* Body */}
        <div className="space-y-2">
          <label htmlFor="review-body" className="block text-sm font-bold text-gray-300 font-ui uppercase tracking-wider">Review (Optional)</label>
          <textarea id="review-body" value={review} onChange={e => setReview(e.target.value)}
            placeholder="What did you think of this anime?" rows={5} maxLength={2000}
            className="w-full bg-surface-chrome border border-white/10 rounded-xl px-4 py-3 text-white font-ui focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/50 transition-all placeholder:text-gray-600 resize-none" />
          <div className="text-right text-xs text-gray-500 font-ui font-semibold">{review.length}/2000</div>
        </div>

        {/* Spoiler Toggle */}
        <div className="flex items-center justify-between p-3 bg-surface-chrome/50 border border-white/5 rounded-xl">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className={`h-4 w-4 ${isSpoiler ? 'text-orange-400' : 'text-gray-500'}`} />
            <div>
              <p className="text-xs font-bold text-white font-ui">Contains Spoilers</p>
              <p className="text-[10px] text-gray-500 font-ui">Your review will be blurred by default</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsSpoiler(p => !p)}
            className={`relative w-10 h-5 rounded-full transition-colors duration-300 focus:outline-none ${isSpoiler ? 'bg-orange-500' : 'bg-surface-card border border-white/10'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${isSpoiler ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2">
          {onCancel && <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>Cancel</Button>}
          <Button type="submit" variant="primary" disabled={isLoading || rating === 0}>
            {isLoading ? 'Saving...' : (initialData ? 'Update Review' : 'Post Review')}
          </Button>
        </div>
      </form>
    </div>
  );
}
