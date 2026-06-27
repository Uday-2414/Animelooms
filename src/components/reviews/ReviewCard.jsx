import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, Trash2, Edit, Eye, EyeOff, Flag, MoreHorizontal, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { reviewService } from '../../services/reviewService';
import { moderationService } from '../../services/moderationService';
import { trackReviewLiked, trackSpoilerToggle, trackReviewReported } from '../../services/analyticsService';

export default function ReviewCard({ review, currentUser, onEdit, onDelete }) {
  const [likes, setLikes] = useState({ total: 0, isLikedByMe: false });
  const [likeLoading, setLikeLoading] = useState(false);
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [reportModal, setReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportStatus, setReportStatus] = useState(null); // null | 'sending' | 'done' | 'error'

  useEffect(() => {
    let isMounted = true;
    async function loadLikes() {
      try {
        const data = await reviewService.getReviewLikes(review.id, currentUser?.id);
        if (isMounted) setLikes(data);
      } catch (e) { console.error('Failed to load likes', e); }
    }
    loadLikes();
    return () => { isMounted = false; };
  }, [review.id, currentUser]);

  const handleLike = async () => {
    if (!currentUser || likeLoading) return;
    setLikeLoading(true);
    const wasLiked = likes.isLikedByMe;
    setLikes(prev => ({ total: prev.isLikedByMe ? prev.total - 1 : prev.total + 1, isLikedByMe: !prev.isLikedByMe }));
    try {
      await reviewService.toggleLike(currentUser.id, review.id, wasLiked);
      if (!wasLiked) trackReviewLiked(review.id);
    } catch (e) {
      setLikes({ total: wasLiked ? likes.total : likes.total - 1, isLikedByMe: wasLiked });
    } finally { setLikeLoading(false); }
  };

  const handleRevealSpoiler = () => {
    setSpoilerRevealed(true);
    trackSpoilerToggle(review.id);
  };

  const handleReport = async () => {
    if (!currentUser || !reportReason.trim()) return;
    setReportStatus('sending');
    try {
      await moderationService.reportReview(currentUser.id, review.id, reportReason);
      setReportStatus('done');
      trackReviewReported(review.id);
      setTimeout(() => { setReportModal(false); setReportStatus(null); setReportReason(''); }, 2000);
    } catch (e) {
      setReportStatus(e.message === 'already_reported' ? 'already' : 'error');
    }
  };

  const isOwner = currentUser?.id === review.user_id;
  const hasContent = review.title || review.review;
  const isSpoiler = review.is_spoiler && !spoilerRevealed;
  const displayName = review.profiles?.full_name || 'Anonymous';
  const avatarUrl = review.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=1d2430&color=ffffff&size=40`;
  const formatDate = (s) => new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="bg-surface-chrome/30 border border-white/5 rounded-2xl p-5 space-y-4 hover:border-white/10 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/user/${review.user_id}`}>
            <img src={avatarUrl} alt={displayName} className="w-10 h-10 rounded-full border border-white/10 object-cover hover:border-brand/40 transition-colors" />
          </Link>
          <div>
            <Link to={`/user/${review.user_id}`} className="text-sm font-bold text-white font-ui hover:text-brand transition-colors">{displayName}</Link>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 font-ui font-semibold">{formatDate(review.created_at)}</span>
              {review.is_spoiler && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-orange-400 bg-orange-400/10 border border-orange-400/20 px-1.5 py-0.5 rounded">
                  Spoiler
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-surface-card px-2 py-1 rounded-lg border border-white/5">
            <Star className="h-3.5 w-3.5 text-brand fill-current" />
            <span className="text-sm font-bold text-white font-ui">{review.rating}</span>
            <span className="text-xs text-gray-500 font-ui">/10</span>
          </div>
          {/* 3-dot menu */}
          <div className="relative">
            <button onClick={() => setShowMenu(p => !p)} className="p-1.5 text-gray-500 hover:text-white hover:bg-surface-card rounded-md transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 z-20 bg-surface-card border border-white/10 rounded-xl shadow-2xl py-1 min-w-[130px]">
                {isOwner ? (
                  <>
                    <button onClick={() => { setShowMenu(false); onEdit(review); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-ui text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                      <Edit className="h-3.5 w-3.5" /> Edit Review
                    </button>
                    <button onClick={() => { setShowMenu(false); onDelete(review); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-ui text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </>
                ) : currentUser ? (
                  <button onClick={() => { setShowMenu(false); setReportModal(true); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-ui text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                    <Flag className="h-3.5 w-3.5" /> Report
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Content with spoiler blur */}
      {hasContent && (
        <div className="space-y-2">
          {review.title && <h5 className="text-base font-bold text-white font-ui leading-tight">{review.title}</h5>}
          {review.review && (
            <div className="relative">
              <p className={`text-sm text-gray-300 font-ui leading-relaxed whitespace-pre-line transition-all duration-300 ${isSpoiler ? 'blur-sm select-none pointer-events-none' : ''}`}>
                {review.review}
              </p>
              {isSpoiler && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={handleRevealSpoiler}
                    className="flex items-center gap-2 px-4 py-2 bg-surface-card border border-white/20 rounded-xl text-xs font-bold text-white font-ui hover:border-brand/40 hover:bg-surface-chrome transition-all duration-200 shadow-lg"
                  >
                    <Eye className="h-3.5 w-3.5 text-brand" /> Reveal Spoiler
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between">
        <button
          onClick={handleLike}
          disabled={!currentUser}
          className={`flex items-center gap-1.5 text-xs font-semibold font-ui px-3 py-1.5 rounded-lg transition-colors duration-200 ${likes.isLikedByMe ? 'text-brand bg-brand/10 border border-brand/20' : 'text-gray-400 hover:text-white hover:bg-surface-card border border-transparent'}`}
        >
          <ThumbsUp className={`h-3.5 w-3.5 ${likes.isLikedByMe ? 'fill-current' : ''}`} />
          {likes.total > 0 ? likes.total : 'Helpful'}
        </button>
      </div>

      {/* Report Modal */}
      {reportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-card border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white font-ui">Report Review</h3>
              <button onClick={() => { setReportModal(false); setReportStatus(null); setReportReason(''); }} className="text-gray-400 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            {reportStatus === 'done' ? (
              <p className="text-sm text-emerald-400 font-ui text-center py-4">Thank you for your report. We'll review it shortly.</p>
            ) : reportStatus === 'already' ? (
              <p className="text-sm text-yellow-400 font-ui text-center py-4">You've already reported this review.</p>
            ) : (
              <>
                <textarea
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  placeholder="Why are you reporting this review?"
                  rows={3}
                  maxLength={500}
                  className="w-full bg-surface-chrome border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-ui focus:outline-none focus:border-brand/50 resize-none placeholder:text-gray-600"
                />
                <button
                  onClick={handleReport}
                  disabled={!reportReason.trim() || reportStatus === 'sending'}
                  className="w-full bg-brand hover:bg-brand/90 text-white font-ui font-semibold text-sm py-2.5 rounded-lg transition-all disabled:opacity-50"
                >
                  {reportStatus === 'sending' ? 'Submitting...' : 'Submit Report'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
