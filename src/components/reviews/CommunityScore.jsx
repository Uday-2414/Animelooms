import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { reviewService } from '../../services/reviewService';

export default function CommunityScore({ animeId }) {
  const [scoreData, setScoreData] = useState({ average: 0, total: 0 });
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
      <div className="bg-surface-card border border-brand/20 rounded-2xl p-5 flex items-center justify-between shadow-glow animate-pulse">
        <div className="h-10 w-24 bg-white/5 rounded"></div>
        <div className="h-10 w-16 bg-white/5 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-surface-card border border-brand/30 rounded-2xl p-5 flex items-center justify-between shadow-glow">
      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand font-ui">
          AnimeLoom Score
        </span>
        <div className="flex items-center gap-1.5 text-2xl font-black text-white font-ui">
          <Star className="h-5 w-5 text-brand fill-current" />
          {scoreData.total > 0 ? scoreData.average.toFixed(1) : 'N/A'}
        </div>
      </div>
      <div className="text-right space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 font-ui">
          Community Ratings
        </span>
        <div className="text-lg font-bold text-gray-300 font-ui">
          {scoreData.total} {scoreData.total === 1 ? 'user' : 'users'}
        </div>
      </div>
    </div>
  );
}
