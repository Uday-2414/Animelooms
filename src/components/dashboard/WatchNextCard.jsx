import React from 'react'
import { Link } from 'react-router-dom'
import { Play, Sparkles, Film, CheckCircle } from 'lucide-react'
import ProgressBar from '../ui/ProgressBar'
import { trackWatchNextClick } from '../../services/analyticsService'

export default function WatchNextCard({ item }) {
  if (!item) return null

  const percentage = item.total_episodes > 0 
    ? Math.round((item.episodes_watched / item.total_episodes) * 100)
    : 0

  const handleClick = () => {
    trackWatchNextClick(item.anime_id, item.anime_title)
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-brand/20 via-surface-card to-surface-chrome border border-brand/30 rounded-3xl p-6 shadow-glow font-ui animate-fade-in">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <Sparkles className="w-48 h-48 text-brand" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* Poster */}
        <Link 
          to={`/anime/${item.anime_id}`} 
          onClick={handleClick}
          className="w-24 aspect-[2/3] rounded-2xl overflow-hidden flex-shrink-0 border-2 border-brand/40 shadow-xl group relative"
        >
          <img src={item.anime_image} alt={item.anime_title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
            <Film className="h-6 w-6 text-white" />
          </div>
        </Link>

        {/* Info & AI Recommendation Reason */}
        <div className="flex-grow space-y-3 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand/15 text-brand border border-brand/30 rounded-full text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-brand animate-pulse" />
            Watch Next Recommendation
          </div>

          <h3 className="text-xl md:text-2xl font-black text-white font-logo hover:text-brand transition-colors duration-200 truncate">
            <Link to={`/anime/${item.anime_id}`} onClick={handleClick}>{item.anime_title}</Link>
          </h3>

          <p className="text-xs md:text-sm text-gray-300 font-ui leading-relaxed">
            💡 {item.reason}
          </p>

          <div className="max-w-md space-y-1.5 pt-1">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-gray-400">Episode {item.episodes_watched} of {item.total_episodes || '?'}</span>
              <span className="text-brand font-bold">{percentage}% Done</span>
            </div>
            <ProgressBar value={item.episodes_watched} max={item.total_episodes || 0} showText={false} />
          </div>
        </div>

        {/* CTA Button */}
        <div className="self-stretch md:self-center flex-shrink-0 flex items-center">
          <Link
            to={`/anime/${item.anime_id}`}
            onClick={handleClick}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brand hover:bg-brand/90 text-white font-bold text-sm rounded-2xl shadow-glow transition-all duration-300 active:scale-95 cursor-pointer"
          >
            <Play className="h-4 w-4 fill-current" />
            Resume Watching
          </Link>
        </div>
      </div>
    </div>
  )
}
