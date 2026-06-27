import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { reviewService } from '../../services/reviewService';

export default function CommunityScore({ animeId }) {
  const [scoreData, setScoreData] = useState({ average: 0, total: 0, distribution: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadScore() {
      if (!animeId) return;
      try {
        setLoading(true);
        const data = await reviewService.getCommunityScore(animeId);
        if (isMounted) setScoreData(data);
      } catch (err) {
        console.error('Failed to load community score:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadScore();
    return () => { isMounted = false; };
  }, [animeId]);

  if (loading) {
    return (
      <div className="bg-surface-card border border-brand/20 rounded-2xl p-5 space-y-3 shadow-glow animate-pulse">
        <div className="h-8 w-28 bg-white/5 rounded" />
        <div className="space-y-1.5">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-3 bg-white/5 rounded w-full" />)}
        </div>
      </div>
    );
  }

  const maxCount = scoreData.total > 0 ? Math.max(...Object.values(scoreData.distribution || {})) : 1;

  return (
    <div className="bg-surface-card border border-brand/30 rounded-2xl p-5 space-y-4 shadow-glow">
      {/* Score header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand font-ui">AnimeLoom Score</span>
          <div className="flex items-center gap-1.5 text-2xl font-black text-white font-ui">
            <Star className="h-5 w-5 text-brand fill-current" />
            {scoreData.total > 0 ? scoreData.average.toFixed(1) : 'N/A'}
          </div>
        </div>
        <div className="text-right space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 font-ui">Community</span>
          <div className="text-lg font-bold text-gray-300 font-ui">
            {scoreData.total} {scoreData.total === 1 ? 'rating' : 'ratings'}
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      {scoreData.total > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 font-ui mb-2">Rating Distribution</p>
          {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(rating => {
            const count = scoreData.distribution?.[rating] || 0;
            const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
            return (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-500 font-ui w-3 text-right">{rating}</span>
                <div className="flex-grow h-1.5 bg-surface-chrome rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-600 font-ui w-4 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
