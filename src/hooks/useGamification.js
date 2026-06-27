import { useXP } from './useXP'
import { useAchievements } from './useAchievements'
import { useBadges } from './useBadges'
import { useChallenges } from './useChallenges'

export function useGamification(userId) {
  const xp = useXP(userId)
  const achievements = useAchievements(userId)
  const badges = useBadges(userId)
  const challenges = useChallenges(userId)

  const loading = xp.loading || achievements.loading || badges.loading || challenges.loading

  return {
    xp,
    achievements,
    badges,
    challenges,
    loading,
    refetchAll: () => {
      xp.refetch()
      achievements.refetch()
      badges.refetch()
      challenges.refetch()
    }
  }
}

export default useGamification
