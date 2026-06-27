/**
 * Weekly Challenges configuration
 */
export const WEEKLY_CHALLENGES = [
  {
    id: 'complete_20_eps',
    title: 'Episode Marathon',
    description: 'Update your episode count by 20 episodes this week.',
    target: 20,
    type: 'episodes',
    xpReward: 75,
    icon: '📺'
  },
  {
    id: 'rate_10_anime',
    title: 'Anime Critic',
    description: 'Rate or review 5 anime titles this week.',
    target: 5,
    type: 'ratings',
    xpReward: 50,
    icon: '⭐'
  },
  {
    id: 'finish_3_anime',
    title: 'Series Finisher',
    description: 'Mark 3 anime series as Completed this week.',
    target: 3,
    type: 'completions',
    xpReward: 150,
    icon: '🏁'
  },
  {
    id: 'add_5_anime',
    title: 'List Builder',
    description: 'Add 5 new titles to your watchlist this week.',
    target: 5,
    type: 'additions',
    xpReward: 50,
    icon: '🔖'
  }
]

export const CHALLENGE_MAP = new Map(WEEKLY_CHALLENGES.map(c => [c.id, c]))
