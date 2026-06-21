import { animeService } from './animeService';

export const recommendationService = {
  /**
   * Fetches recommended anime based on the most recently watched or completed title.
   * Excludes titles already in the user's progress list.
   */
  async getRecommendedForYou(progressList, options = {}) {
    const validItems = progressList.filter(p => p.status === 'watching' || p.status === 'completed');
    if (validItems.length === 0) return [];
    
    // Sort by updated_at desc to find the most recently active anime
    const sorted = [...validItems].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    
    const baseAnimeId = sorted[0].anime_id;
    try {
      const recommendations = await animeService.getRelatedAnime(baseAnimeId, options);
      const trackedIds = new Set(progressList.map(p => p.anime_id));
      
      // Filter out tracked and return top 5
      return recommendations.filter(r => !trackedIds.has(r.mal_id)).slice(0, 5);
    } catch (e) {
      console.error('[RecommendationService] Failed to get recommendations', e);
      return [];
    }
  },

  /**
   * Filters trending anime to exclude titles the user is already tracking.
   */
  getTrendingForYou(trendingAnime, progressList) {
    if (!trendingAnime || trendingAnime.length === 0) return [];
    if (!progressList || progressList.length === 0) return trendingAnime.slice(0, 5);
    
    const trackedIds = new Set(progressList.map(p => p.anime_id));
    return trendingAnime.filter(a => !trackedIds.has(a.mal_id)).slice(0, 5);
  },

  /**
   * Calculates watching streaks based on unique days of activity.
   */
  getWatchingStreak(progressList) {
    if (!progressList || progressList.length === 0) return { current: 0, longest: 0 };
    
    // Get unique dates (YYYY-MM-DD)
    const dates = progressList
      .map(p => new Date(p.updated_at).toISOString().split('T')[0])
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // Descending
      
    const uniqueDates = [...new Set(dates)];
    
    if (uniqueDates.length === 0) return { current: 0, longest: 0 };

    let currentStreak = 0;
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // Check if the most recent activity is today or yesterday
    if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
       currentStreak = 1;
       for (let i = 0; i < uniqueDates.length - 1; i++) {
         const d1 = new Date(uniqueDates[i]);
         const d2 = new Date(uniqueDates[i+1]);
         const diffDays = Math.round(Math.abs(d1 - d2) / (1000 * 60 * 60 * 24));
         
         if (diffDays === 1) {
           currentStreak++;
         } else {
           break;
         }
       }
    }

    // Calculate longest streak
    let tempStreak = 1;
    let longestStreak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
       const d1 = new Date(uniqueDates[i]);
       const d2 = new Date(uniqueDates[i+1]);
       const diffDays = Math.round(Math.abs(d1 - d2) / (1000 * 60 * 60 * 24));
       
       if (diffDays === 1) {
         tempStreak++;
         if (tempStreak > longestStreak) longestStreak = tempStreak;
       } else {
         tempStreak = 1;
       }
    }

    return { current: currentStreak, longest: longestStreak };
  },

  /**
   * Generates achievements based on user's watching progress.
   */
  getUserAchievements(progressList) {
    const achievements = [];
    if (!progressList) return achievements;

    const total = progressList.length;
    const completed = progressList.filter(p => p.status === 'completed').length;
    let totalEpisodes = 0;
    
    progressList.forEach(p => {
      totalEpisodes += (p.episodes_watched || 0);
    });

    if (total > 0) {
      achievements.push({ id: 'first_track', title: 'First Anime Tracked', icon: '🎯', description: 'Started your anime journey.' });
    }
    if (completed >= 10) {
      achievements.push({ id: 'comp_10', title: 'Completed 10 Anime', icon: '🥉', description: 'Finished 10 series.' });
    }
    if (completed >= 25) {
      achievements.push({ id: 'comp_25', title: 'Completed 25 Anime', icon: '🥈', description: 'Finished 25 series.' });
    }
    if (totalEpisodes >= 100) {
      achievements.push({ id: 'eps_100', title: 'Century Club', icon: '💯', description: 'Watched 100 episodes.' });
    }
    if (totalEpisodes >= 500) {
      achievements.push({ id: 'eps_500', title: 'Binge Watcher', icon: '🍿', description: 'Watched 500 episodes.' });
    }

    return achievements;
  },

  /**
   * Samples top 3 recently active anime to extract favorite genres to avoid rate limits.
   */
  async getFavoriteGenres(progressList) {
    if (!progressList) return [];

    const sample = progressList
      .filter(p => p.status === 'completed' || p.status === 'watching')
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 3);
      
    if (sample.length === 0) return [];
    
    const genreCounts = {};
    
    await Promise.all(sample.map(async (item) => {
        try {
          const details = await animeService.getAnimeDetails(item.anime_id);
          if (details && details.genres) {
            details.genres.forEach(g => {
              genreCounts[g] = (genreCounts[g] || 0) + 1;
            });
          }
        } catch(e) {
          // gracefully fail on individual fetches to not break the whole page
          console.warn(`[RecommendationService] Failed to fetch genres for ${item.anime_id}`);
        }
    }));
    
    return Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .map(e => e[0]);
  },

  /**
   * Maps favorite genres to a user personality title.
   */
  getAnimePersonality(genres) {
    if (!genres || genres.length === 0) return "Casual Viewer";
    
    // We can look at the top 2 genres to be more accurate, but top 1 is usually enough
    const topGenresStr = genres.slice(0, 2).join(' ').toLowerCase();
    
    if (topGenresStr.includes('action') || topGenresStr.includes('shounen')) return 'Action Lover';
    if (topGenresStr.includes('romance') || topGenresStr.includes('shoujo')) return 'Romance Enthusiast';
    if (topGenresStr.includes('fantasy') || topGenresStr.includes('isekai')) return 'Fantasy Explorer';
    if (topGenresStr.includes('comedy') || topGenresStr.includes('slice of life')) return 'Chill Watcher';
    if (topGenresStr.includes('drama') || topGenresStr.includes('thriller') || topGenresStr.includes('psychological')) return 'Drama Seeker';
    if (topGenresStr.includes('sports')) return 'Sports Fanatic';
    if (topGenresStr.includes('sci-fi') || topGenresStr.includes('mecha')) return 'Sci-Fi Nerd';
    
    return 'Otaku Member';
  }
};

export default recommendationService;
