import React from 'react'
import { BADGES } from '../../config/badgeConfig'

export default function BadgeDisplay({ earnedBadges = [] }) {
  const earnedSet = new Set((earnedBadges || []).map(b => b.badge_id || b.id))

  return (
    <div className="flex flex-wrap gap-2.5">
      {BADGES.map(badge => {
        const isEarned = earnedSet.has(badge.id)
        return (
          <div
            key={badge.id}
            title={`${badge.label}: ${badge.description}`}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold font-ui transition-all duration-300 ${
              isEarned
                ? `bg-gradient-to-r ${badge.color} shadow-sm cursor-default`
                : 'bg-surface-chrome/10 border-white/5 text-gray-600 opacity-40 grayscale cursor-not-allowed'
            }`}
          >
            <span className="text-sm">{badge.icon}</span>
            <span>{badge.label}</span>
          </div>
        )
      })}
    </div>
  )
}
