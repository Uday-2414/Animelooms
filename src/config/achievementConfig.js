/**
 * Reusable Achievements configuration
 */
export const ACHIEVEMENTS = [
  {
    id: 'first_anime',
    title: 'First Anime Added',
    description: 'Started your anime tracking journey on AnimeLoom.',
    icon: '🎯',
    xpReward: 10,
    category: 'beginner'
  },
  {
    id: 'first_completion',
    title: 'First Completed Anime',
    description: 'Finished your very first anime series.',
    icon: '🏆',
    xpReward: 25,
    category: 'watching'
  },
  {
    id: 'first_review',
    title: 'First Review',
    description: 'Shared your first thought-out review with the community.',
    icon: '✍️',
    xpReward: 20,
    category: 'community'
  },
  {
    id: 'first_rating',
    title: 'First Rating',
    description: 'Rated your first anime show.',
    icon: '⭐',
    xpReward: 10,
    category: 'watching'
  },
  {
    id: 'comp_10',
    title: '10 Completed Anime',
    description: 'Finished 10 anime series.',
    icon: '🥉',
    xpReward: 50,
    category: 'watching'
  },
  {
    id: 'comp_25',
    title: '25 Completed Anime',
    description: 'Finished 25 anime series.',
    icon: '🥈',
    xpReward: 100,
    category: 'watching'
  },
  {
    id: 'comp_50',
    title: '50 Completed Anime',
    description: 'Finished 50 anime series.',
    icon: '🥇',
    xpReward: 200,
    category: 'watching'
  },
  {
    id: 'eps_100',
    title: '100 Episodes Watched',
    description: 'Watched 100 total episodes of anime.',
    icon: '💯',
    xpReward: 50,
    category: 'watching'
  },
  {
    id: 'eps_500',
    title: '500 Episodes Watched',
    description: 'Watched 500 total episodes of anime.',
    icon: '🍿',
    xpReward: 150,
    category: 'watching'
  },
  {
    id: 'ratings_50',
    title: '50 Ratings Given',
    description: 'Rated 50 different anime titles.',
    icon: '⚡',
    xpReward: 100,
    category: 'watching'
  },
  {
    id: 'reviews_10',
    title: '10 Reviews Written',
    description: 'Authored 10 insightful community reviews.',
    icon: '📝',
    xpReward: 100,
    category: 'community'
  },
  {
    id: 'streak_7',
    title: '7-Day Streak',
    description: 'Maintained a daily watching streak for 7 days.',
    icon: '🔥',
    xpReward: 50,
    category: 'streaks'
  },
  {
    id: 'streak_30',
    title: '30-Day Streak',
    description: 'Maintained an incredible daily watching streak for 30 days.',
    icon: '🌟',
    xpReward: 250,
    category: 'streaks'
  }
]

export const ACHIEVEMENT_MAP = new Map(ACHIEVEMENTS.map(a => [a.id, a]))
