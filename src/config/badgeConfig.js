/**
 * Badges configuration
 */
export const BADGES = [
  {
    id: 'action_expert',
    label: 'Action Expert',
    description: 'Watched over 5 Action anime series.',
    icon: '⚔️',
    color: 'from-red-500/20 to-orange-500/20 border-red-500/40 text-red-400'
  },
  {
    id: 'romance_fan',
    label: 'Romance Fan',
    description: 'Watched over 5 Romance anime series.',
    icon: '💕',
    color: 'from-pink-500/20 to-rose-500/20 border-pink-500/40 text-pink-400'
  },
  {
    id: 'fantasy_lover',
    label: 'Fantasy Lover',
    description: 'Watched over 5 Fantasy or Isekai series.',
    icon: '🧙',
    color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/40 text-purple-400'
  },
  {
    id: 'completionist',
    label: 'Completionist',
    description: 'Completed over 80% of tracked anime.',
    icon: '✅',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-400'
  },
  {
    id: 'reviewer',
    label: 'Reviewer',
    description: 'Written 3 or more reviews for the community.',
    icon: '📝',
    color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/40 text-blue-400'
  },
  {
    id: 'early_adopter',
    label: 'Early Adopter',
    description: 'Joined AnimeLoom during Milestone Beta.',
    icon: '🚀',
    color: 'from-amber-500/20 to-yellow-500/20 border-amber-500/40 text-amber-400'
  },
  {
    id: 'top_contributor',
    label: 'Top Contributor',
    description: 'Level 10+ member contributing consistently.',
    icon: '👑',
    color: 'from-yellow-500/30 to-amber-400/30 border-yellow-400 text-yellow-300'
  }
]

export const BADGE_MAP = new Map(BADGES.map(b => [b.id, b]))
