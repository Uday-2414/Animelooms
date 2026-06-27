import React from 'react'
import { CheckCircle2 } from 'lucide-react'

export default function ChallengeCard({ challenge }) {
  if (!challenge) return null

  const { title, description, target, progress = 0, completed, xpReward, icon } = challenge
  const pct = Math.min(100, Math.round((progress / target) * 100))

  return (
    <div className={`p-4 rounded-2xl border transition-all duration-300 space-y-3 font-ui ${
      completed
        ? 'bg-emerald-500/5 border-emerald-500/30'
        : 'bg-surface-card border-white/5 hover:border-white/10'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl p-2 bg-surface-chrome rounded-xl border border-white/5">{icon || '🎯'}</span>
          <div>
            <h5 className="text-sm font-bold text-white leading-tight flex items-center gap-1.5">
              {title}
              {completed && <CheckCircle2 className="h-4 w-4 text-emerald-400 fill-emerald-400/20" />}
            </h5>
            <p className="text-xs text-gray-400 leading-tight mt-0.5">{description}</p>
          </div>
        </div>
        <span className="text-[10px] font-extrabold text-brand bg-brand/10 border border-brand/20 px-2 py-1 rounded-lg flex-shrink-0">
          +{xpReward} XP
        </span>
      </div>

      {/* Progress track */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-semibold text-gray-400">
          <span>Progress</span>
          <span>{progress} / {target} ({pct}%)</span>
        </div>
        <div className="w-full h-2 bg-surface-chrome border border-white/5 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${completed ? 'bg-emerald-400' : 'bg-brand'}`}
            style={{ width: `${Math.max(4, pct)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
