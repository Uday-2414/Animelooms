import React from 'react'
import ChallengeCard from './ChallengeCard'
import { Zap } from 'lucide-react'

export default function ChallengesPanel({ challenges = [], loading = false }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-surface-chrome/20 border border-white/5 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-brand" />
          <h4 className="text-sm font-bold text-white font-ui uppercase tracking-wider">Weekly Challenges</h4>
        </div>
        <span className="text-xs font-semibold text-gray-400 font-ui">Resets Monday</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {challenges.map(challenge => (
          <ChallengeCard key={challenge.id} challenge={challenge} />
        ))}
      </div>
    </div>
  )
}
