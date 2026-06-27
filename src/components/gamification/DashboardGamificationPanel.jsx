import React from 'react'
import XPBar from './XPBar'
import LevelBadge from './LevelBadge'
import { Flame, Trophy, Zap, Award } from 'lucide-react'

export default function DashboardGamificationPanel({ xp, streak = 0, achievementsCount = 0, challenges = [] }) {
  const completedChallenges = challenges.filter(c => c.completed).length

  return (
    <div className="bg-surface-card border border-brand/20 rounded-3xl p-6 shadow-glow space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <LevelBadge level={xp?.level || 1} title={xp?.title || 'Anime Rookie'} />
          <div>
            <h3 className="text-base font-bold text-white font-ui">Today's Progression</h3>
            <p className="text-xs text-gray-400 font-ui">Keep activity active to maintain your streak and level up</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Daily streak */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-xl">
            <Flame className="h-5 w-5 text-orange-500 fill-orange-500/20 animate-pulse" />
            <div className="text-left font-ui">
              <p className="text-[9px] font-bold uppercase tracking-widest text-orange-400 leading-tight">Streak</p>
              <p className="text-xs font-black text-white leading-tight">{streak} Days</p>
            </div>
          </div>

          {/* Achievements badge count */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-brand/10 border border-brand/20 rounded-xl">
            <Trophy className="h-5 w-5 text-brand" />
            <div className="text-left font-ui">
              <p className="text-[9px] font-bold uppercase tracking-widest text-brand leading-tight">Badges</p>
              <p className="text-xs font-black text-white leading-tight">{achievementsCount} Unlocked</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main XP Progress Bar */}
      <XPBar
        level={xp?.level || 1}
        title={xp?.title || 'Anime Rookie'}
        xpInCurrentLevel={xp?.xpInCurrentLevel || 0}
        xpNeededForNextLevel={xp?.xpNeededForNextLevel || 100}
        currentXP={xp?.currentXP || 0}
        progressPercent={xp?.progressPercent || 0}
        showTitle={false}
      />

      {/* Quick Challenges Bar */}
      {challenges.length > 0 && (
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs font-ui">
          <div className="flex items-center gap-2 text-gray-300 font-semibold">
            <Zap className="h-4 w-4 text-brand" />
            <span>Weekly Challenges ({completedChallenges}/{challenges.length} Done)</span>
          </div>
          <div className="flex items-center gap-2">
            {challenges.map(c => (
              <span
                key={c.id}
                title={`${c.title}: ${c.progress}/${c.target}`}
                className={`w-3 h-3 rounded-full border transition-all ${
                  c.completed ? 'bg-emerald-400 border-emerald-300 shadow-sm' : 'bg-surface-chrome border-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
