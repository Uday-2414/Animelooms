/**
 * Reusable premium ProgressBar component showing percentage and ratio
 * @param {Object} props
 * @param {number} props.value - Episodes watched
 * @param {number} props.max - Total episodes
 * @param {boolean} [props.showText=true] - Whether to show ratio and percentage text
 * @param {string} [props.className=""] - Custom className
 */
export default function ProgressBar({ value = 0, max = 0, showText = true, className = '' }) {
  const episodesWatched = Math.max(0, value)
  const totalEpisodes = Math.max(0, max)

  // Calculate percentage
  const percentage = totalEpisodes > 0 ? Math.min(100, Math.round((episodesWatched / totalEpisodes) * 100)) : 0

  return (
    <div className={`w-full font-ui space-y-1.5 ${className}`}>
      {showText && (
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-gray-400">
            {episodesWatched} / {totalEpisodes > 0 ? totalEpisodes : '?'} episodes
          </span>
          <span className="text-brand font-bold">{percentage}%</span>
        </div>
      )}
      <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden border border-white/5 relative">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand to-red-500 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={episodesWatched}
          aria-valuemin={0}
          aria-valuemax={totalEpisodes || 100}
        />
      </div>
    </div>
  )
}
