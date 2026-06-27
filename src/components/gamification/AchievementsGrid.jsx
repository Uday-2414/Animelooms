import React, { useState } from 'react'
import AchievementCard from './AchievementCard'
import { Trophy, ChevronDown, ChevronUp } from 'lucide-react'

export default function AchievementsGrid({ achievements = [], loading = false }) {
  const [showAllLocked, setShowAllLocked] = useState(false)

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-surface-chrome/20 border border-white/5 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!achievements || achievements.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-surface-chrome/10 p-6 text-center">
        <Trophy className="h-8 w-8 text-gray-600 mx-auto mb-2" />
        <p className="text-sm text-gray-500 font-ui">No achievements available yet.</p>
      </div>
    )
  }

  const unlocked = achievements.filter(a => a.isUnlocked)
  const locked = achievements.filter(a => !a.isUnlocked)

  const visibleLocked = showAllLocked ? locked : locked.slice(0, 4)

  return (
    <div className="space-y-6">
      {/* Unlocked Section */}
      {unlocked.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-brand font-ui">
            Unlocked ({unlocked.length})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlocked.map(ach => (
              <AchievementCard key={ach.id} achievement={ach} />
            ))}
          </div>
        </div>
      )}

      {/* Locked Section */}
      {locked.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 font-ui">
            Locked ({locked.length})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleLocked.map(ach => (
              <AchievementCard key={ach.id} achievement={ach} />
            ))}
          </div>

          {locked.length > 4 && (
            <div className="text-center pt-2">
              <button
                onClick={() => setShowAllLocked(p => !p)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white font-ui transition-colors px-4 py-2 rounded-xl bg-surface-chrome/30 border border-white/5"
              >
                {showAllLocked ? (
                  <>Show Less <ChevronUp className="h-3.5 w-3.5" /></>
                ) : (
                  <>Show {locked.length - 4} More Locked <ChevronDown className="h-3.5 w-3.5" /></>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
