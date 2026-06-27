import React from 'react'

export default function AchievementCard({ achievement }) {
  if (!achievement) return null

  const { title, description, icon, xpReward, isUnlocked, unlocked_at } = achievement

  const formatDate = (dateStr) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className={`p-4 rounded-2xl border transition-all duration-300 flex items-start gap-3.5 ${
      isUnlocked
        ? 'bg-surface-card border-brand/30 hover:border-brand/50 shadow-glow group'
        : 'bg-surface-chrome/20 border-white/5 opacity-50 grayscale'
    }`}>
      <div className={`text-3xl p-3 rounded-xl border flex-shrink-0 transition-transform duration-300 ${
        isUnlocked
          ? 'bg-surface-chrome border-brand/20 group-hover:scale-110'
          : 'bg-surface-chrome/40 border-white/5'
      }`}>
        {icon || '🏆'}
      </div>

      <div className="flex-grow min-w-0 space-y-1 font-ui">
        <div className="flex items-start justify-between gap-2">
          <h5 className={`text-sm font-bold truncate ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
            {title}
          </h5>
          <span className="text-[10px] font-extrabold text-brand bg-brand/10 border border-brand/20 px-1.5 py-0.5 rounded flex-shrink-0">
            +{xpReward} XP
          </span>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
          {description}
        </p>

        {isUnlocked && unlocked_at && (
          <p className="text-[10px] text-gray-500 font-semibold pt-1">
            Unlocked on {formatDate(unlocked_at)}
          </p>
        )}
      </div>
    </div>
  )
}
