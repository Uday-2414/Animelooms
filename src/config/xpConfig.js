/**
/**
 * XP Rewards configuration for various user interactions
 */
export const XP_REWARDS = {
  daily_login: 10,
  anime_added: 5,
  anime_completed: 50,
  episode_updated: 2,
  anime_rated: 10,
  review_written: 25,
  review_liked: 5,
  challenge_completed: 100,
}

/**
 * Progression thresholds and titles for Levels 1 through 50+
 */
export const LEVEL_PROGRESSION = [
  { level: 1, xpRequired: 0, title: 'Anime Rookie' },
  { level: 2, xpRequired: 50, title: 'Anime Rookie' },
  { level: 3, xpRequired: 120, title: 'Anime Rookie' },
  { level: 4, xpRequired: 200, title: 'Anime Rookie' },
  { level: 5, xpRequired: 300, title: 'Anime Explorer' },
  { level: 6, xpRequired: 450, title: 'Anime Explorer' },
  { level: 7, xpRequired: 650, title: 'Anime Explorer' },
  { level: 8, xpRequired: 900, title: 'Anime Explorer' },
  { level: 9, xpRequired: 1200, title: 'Anime Explorer' },
  { level: 10, xpRequired: 1600, title: 'Anime Enthusiast' },
  { level: 15, xpRequired: 3000, title: 'Anime Enthusiast' },
  { level: 20, xpRequired: 5000, title: 'Anime Veteran' },
  { level: 25, xpRequired: 8000, title: 'Anime Veteran' },
  { level: 30, xpRequired: 12000, title: 'Anime Veteran' },
  { level: 35, xpRequired: 17000, title: 'Anime Master' },
  { level: 40, xpRequired: 23000, title: 'Anime Master' },
  { level: 45, xpRequired: 30000, title: 'Anime Master' },
  { level: 50, xpRequired: 40000, title: 'Anime Legend' },
]

/**
 * Calculates current level and level details based on total XP
 * @param {number} totalXP 
 */
export function calculateLevelInfo(totalXP = 0) {
  const currentXP = Math.max(0, Number(totalXP) || 0)
  
  // Dynamic formula for precise level calculation if between predefined steps
  let level = 1
  let title = 'Anime Rookie'
  
  if (currentXP >= 40000) {
    level = 50 + Math.floor((currentXP - 40000) / 5000)
    title = 'Anime Legend'
  } else if (currentXP >= 17000) {
    level = 35 + Math.floor((currentXP - 17000) / 1500)
    title = 'Anime Master'
  } else if (currentXP >= 5000) {
    level = 20 + Math.floor((currentXP - 5000) / 800)
    title = 'Anime Veteran'
  } else if (currentXP >= 1600) {
    level = 10 + Math.floor((currentXP - 1600) / 340)
    title = 'Anime Enthusiast'
  } else if (currentXP >= 300) {
    level = 5 + Math.floor((currentXP - 300) / 260)
    title = 'Anime Explorer'
  } else if (currentXP >= 50) {
    level = 1 + Math.floor((currentXP) / 65)
    title = 'Anime Rookie'
  }

  // Determine XP boundaries for current level
  const currentLevelXPFloor = getXPFloorForLevel(level)
  const nextLevelXPCeiling = getXPFloorForLevel(level + 1)
  const xpInCurrentLevel = currentXP - currentLevelXPFloor
  const xpNeededForNextLevel = nextLevelXPCeiling - currentLevelXPFloor
  const progressPercent = Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100)))

  return {
    level,
    title,
    currentXP,
    currentLevelXPFloor,
    nextLevelXPCeiling,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    xpRemaining: nextLevelXPCeiling - currentXP,
    progressPercent
  }
}

function getXPFloorForLevel(lvl) {
  if (lvl <= 1) return 0
  if (lvl <= 5) return (lvl - 1) * 75
  if (lvl <= 10) return 300 + (lvl - 5) * 260
  if (lvl <= 20) return 1600 + (lvl - 10) * 340
  if (lvl <= 35) return 5000 + (lvl - 20) * 800
  if (lvl <= 50) return 17000 + (lvl - 35) * 1533
  return 40000 + (lvl - 50) * 5000
}
