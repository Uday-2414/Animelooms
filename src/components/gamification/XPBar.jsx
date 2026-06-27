import React from 'react'

export default function XPBar({
  level = 1,
  title = 'Anime Rookie',
  xpInCurrentLevel = 0,
  xpNeededForNextLevel = 100,
  currentXP = 0,
  progressPercent = 0,
  showTitle = true,
  size = 'md'
}) {
  const isCompact = size === 'sm'

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between font-ui">
        <div className="flex items-center gap-2">
          <span className={`font-black text-brand ${isCompact ? 'text-xs' : 'text-sm'}`}>
            Lv. {level}
          </span>
          {showTitle && (
            <span className={`font-bold text-white uppercase tracking-wider ${isCompact ? 'text-[10px]' : 'text-xs'}`}>
              {title}
            </span>
          )}
        </div>
        <span className={`font-semibold text-gray-400 ${isCompact ? 'text-[10px]' : 'text-xs'}`}>
          {xpInCurrentLevel} / {xpNeededForNextLevel} XP
        </span>
      </div>

      {/* Progress Track */}
      <div className={`w-full bg-surface-chrome/60 border border-white/5 rounded-full overflow-hidden p-0.5 shadow-inner ${isCompact ? 'h-2' : 'h-3.5'}`}>
        <div
          className="h-full bg-gradient-to-r from-brand/80 via-brand to-red-400 rounded-full transition-all duration-700 ease-out shadow-glow relative overflow-hidden"
          style={{ width: `${Math.min(100, Math.max(3, progressPercent))}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
