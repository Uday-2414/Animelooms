import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Activity, Eye, CheckCircle2, Clock, ArrowRight, MessageSquareText, Star, Tag, Flame, Compass } from 'lucide-react'
import SectionHeader from '../ui/SectionHeader'
import SearchBar from '../ui/SearchBar'
import StatsCard from '../ui/StatsCard'
import AnimeCard from '../anime/AnimeCard'
import ProgressBar from '../ui/ProgressBar'
import { recommendationService } from '../../services/recommendationService'
import ActivityFeed from '../community/ActivityFeed'
import { useGamification } from '../../hooks/useGamification'
import DashboardGamificationPanel from '../gamification/DashboardGamificationPanel'
import AnimeCarousel from '../anime/AnimeCarousel'

export default function ReturningUserDashboard({
  user,
  searchQuery,
  setSearchQuery,
  handleSearchSubmit,
  progressList,
  progressLoading,
  recentReviews,
  recommended,
  trending,
  trendingForYou,
  discoveryFeed,
}) {
  const [favoriteGenres, setFavoriteGenres] = useState([])
  const [animePersonality, setAnimePersonality] = useState('Otaku Member')
  const [streak, setStreak] = useState({ current: 0, longest: 0 })

  const gamification = useGamification(user?.id)

  useEffect(() => {
    let isMounted = true
    if (progressList && progressList.length > 0) {
      setStreak(recommendationService.getWatchingStreak(progressList))

      recommendationService.getFavoriteGenres(progressList).then(genres => {
        if (isMounted && genres.length > 0) {
          setFavoriteGenres(genres)
          setAnimePersonality(recommendationService.getAnimePersonality(genres))
        }
      })
    }
    return () => { isMounted = false }
  }, [progressList])

  const dashboardStats = useMemo(() => {
    return {
      total: progressList.length,
      watching: progressList.filter(p => p.status === 'watching').length,
      completed: progressList.filter(p => p.status === 'completed').length,
      planToWatch: progressList.filter(p => p.status === 'plan_to_watch').length,
    }
  }, [progressList])

  const continueWatchingList = useMemo(() => {
    return progressList
      .filter(p => p.status === 'watching')
      .slice(0, 4)
  }, [progressList])

  const recentlyAddedList = useMemo(() => {
    return [...progressList]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
  }, [progressList])

  const profileUser = useMemo(() => {
    if (!user) return null
    const metadata = user.user_metadata || {}
    return {
      name: metadata.full_name || metadata.name || user.email?.split('@')[0] || 'User',
      avatar_url: metadata.avatar_url || metadata.picture || null,
    }
  }, [user])

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Welcome Back Banner */}
      <section className="relative rounded-3xl overflow-hidden bg-surface-chrome border border-white/5 shadow-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute inset-0 bg-gradient-to-r from-brand/10 to-transparent pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          {profileUser?.avatar_url ? (
            <img
              src={profileUser.avatar_url}
              alt={profileUser.name}
              className="w-16 h-16 rounded-full border-2 border-brand object-cover shadow-glow"
            />
          ) : (
            <div className="w-16 h-16 rounded-full border-2 border-brand bg-surface-card flex items-center justify-center text-xl font-bold text-white shadow-glow">
              {profileUser?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black text-white font-logo">
                Welcome back, {profileUser?.name}!
              </h1>
              <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse hidden md:block" />
            </div>
            <p className="text-xs md:text-sm text-gray-400 font-ui leading-relaxed">
              Track your episodes, monitor stats, and keep your anime journey alive.
            </p>
          </div>
        </div>

        <div className="w-full md:w-auto relative z-10">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSearch={handleSearchSubmit}
            placeholder="Search database..."
          />
        </div>
      </section>

      {/* Gamification Progression Panel */}
      {user && (
        <DashboardGamificationPanel
          xp={gamification.xp?.levelInfo || gamification.xp}
          streak={streak.current}
          achievementsCount={(gamification.achievements?.unlocked || []).length}
          challenges={gamification.challenges?.challenges || []}
        />
      )}


      {/* Quick Stats Grid */}
      <section className="space-y-4">
        <SectionHeader
          title="Quick Stats"
          subtitle="Overview of your current anime collection"
          useLogoFont={false}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            label="Total Tracked"
            value={dashboardStats.total}
            icon={<Activity className="h-4 w-4 text-indigo-400" />}
            className="py-4 px-5 border-indigo-500/10"
          />
          <StatsCard
            label="Watching"
            value={dashboardStats.watching}
            icon={<Eye className="h-4 w-4 text-emerald-400" />}
            className="py-4 px-5 border-emerald-500/10"
          />
          <StatsCard
            label="Completed"
            value={dashboardStats.completed}
            icon={<CheckCircle2 className="h-4 w-4 text-purple-400" />}
            className="py-4 px-5 border-purple-500/10"
          />
          <StatsCard
            label="Plan To Watch"
            value={dashboardStats.planToWatch}
            icon={<Clock className="h-4 w-4 text-blue-400" />}
            className="py-4 px-5 border-blue-500/10"
          />
        </div>
      </section>

      {/* Favorite Genres & Anime Insights Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Streak & Personality Card */}
        <div className="bg-surface-chrome/40 border border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-glow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
              <Flame className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 font-ui">Watching Streak</p>
              <h4 className="text-xl font-bold text-white font-ui">{streak.current} Days Streak</h4>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 font-ui">Personality</p>
            <span className="inline-block mt-1 px-2.5 py-1 bg-brand/10 border border-brand/20 rounded-md text-xs font-bold text-brand font-ui">
              {animePersonality}
            </span>
          </div>
        </div>

        {/* Favorite Genres */}
        <div className="bg-surface-chrome/40 border border-white/5 rounded-2xl p-5 flex items-center shadow-glow gap-4 overflow-hidden">
          <div className="p-3 bg-brand/10 rounded-xl border border-brand/20 flex-shrink-0">
            <Tag className="h-6 w-6 text-brand" />
          </div>
          <div className="flex-grow min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 font-ui mb-1">Favorite Genres</p>
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {favoriteGenres.length > 0 ? favoriteGenres.slice(0, 4).map(g => (
                <span key={g} className="px-2 py-1 bg-surface-card border border-white/5 rounded text-xs font-semibold text-gray-300 font-ui whitespace-nowrap">
                  {g}
                </span>
              )) : (
                <span className="text-xs text-gray-500 font-ui">Tracking more shows unlocks genre insights</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard Layout: Continue Watching & Recently Added */}
      {(continueWatchingList.length > 0 || recentlyAddedList.length > 0 || progressLoading) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Continue Watching */}
          {(continueWatchingList.length > 0 || progressLoading) && (
            <div className={`space-y-6 ${recentlyAddedList.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
              <div className="flex justify-between items-center">
                <SectionHeader
                  title="Continue Watching"
                  subtitle="Pick up where you left off"
                  useLogoFont={false}
                />
                {continueWatchingList.length > 0 && (
                  <Link to="/watchlist" className="text-xs font-semibold text-brand hover:text-red-400 flex items-center gap-1 font-ui">
                    View Full List <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>

              {progressLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array.from({ length: 2 }).map((_, idx) => (
                    <div key={`skel-cw-${idx}`} className="h-32 bg-surface-card border border-white/5 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {continueWatchingList.map((item) => {
                    const percentage = item.total_episodes > 0
                      ? Math.round((item.episodes_watched / item.total_episodes) * 100)
                      : 0

                    return (
                      <div
                        key={item.id}
                        className="flex gap-4 p-4 bg-surface-card border border-white/5 hover:border-white/10 rounded-2xl transition-all duration-300 hover:shadow-glow"
                      >
                        <Link to={`/anime/${item.anime_id}`} className="w-16 aspect-[2/3] rounded-lg overflow-hidden flex-shrink-0 border border-white/5">
                          <img src={item.anime_image} alt={item.anime_title} className="w-full h-full object-cover" />
                        </Link>
                        <div className="flex-grow min-w-0 flex flex-col justify-between py-0.5">
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-white font-ui hover:text-brand transition-colors duration-200 truncate">
                              <Link to={`/anime/${item.anime_id}`}>{item.anime_title}</Link>
                            </h4>
                            <span className="text-xs text-gray-500 font-ui">
                              Episode {item.episodes_watched} of {item.total_episodes || '?'}
                            </span>
                          </div>

                          <div className="space-y-2">
                            <ProgressBar value={item.episodes_watched} max={item.total_episodes || 0} showText={false} />
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-brand font-ui">{percentage}% Done</span>
                              <Link
                                to={`/anime/${item.anime_id}`}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-brand/10 hover:bg-brand/20 border border-brand/35 rounded-md px-2 py-1 transition-all duration-300 font-ui"
                              >
                                Resume
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Right Column: Recently Added */}
          {(recentlyAddedList.length > 0 || progressLoading) && (
            <div className={`space-y-6 ${continueWatchingList.length === 0 ? 'lg:col-span-3' : ''}`}>
              <SectionHeader
                title="Recently Added"
                subtitle="Latest titles added to list"
                useLogoFont={false}
              />

              {progressLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={`skel-ra-${idx}`} className="h-14 bg-surface-card border border-white/5 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {recentlyAddedList.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2.5 bg-surface-chrome/30 border border-white/5 hover:border-brand/15 rounded-xl transition-all duration-300"
                    >
                      <Link to={`/anime/${item.anime_id}`} className="w-9 aspect-[2/3] rounded overflow-hidden flex-shrink-0 border border-white/5">
                        <img src={item.anime_image} alt={item.anime_title} className="w-full h-full object-cover" />
                      </Link>
                      <div className="flex-grow min-w-0">
                        <h5 className="text-xs font-bold text-white font-ui truncate hover:text-brand transition-colors duration-200">
                          <Link to={`/anime/${item.anime_id}`}>{item.anime_title}</Link>
                        </h5>
                        <div className="flex items-center gap-2 mt-0.5 text-[9px] font-semibold text-gray-400 uppercase font-ui">
                          <span className="text-brand/80">{item.status.replace(/_/g, ' ')}</span>
                          <span>•</span>
                          <span>{item.episodes_watched} eps</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Recent Activity / Reviews */}
      {recentReviews.length > 0 && (
        <section className="space-y-6 pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-brand/10 rounded-xl border border-brand/20">
              <MessageSquareText className="h-5 w-5 text-brand" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-ui">Recent Activity & Reviews</h2>
              <p className="text-sm text-gray-400 font-ui">Look back at your recent ratings and discussions</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentReviews.map(review => (
              <div key={review.id} className="bg-surface-chrome/30 border border-white/5 rounded-2xl p-5 hover:border-brand/20 hover:bg-surface-chrome/50 transition-all duration-300 shadow-glow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-gray-500 font-ui font-semibold tracking-wider uppercase">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1.5 bg-surface-card px-2 py-1 rounded-md border border-white/5 text-xs font-bold text-brand font-ui">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {review.rating}/10
                  </div>
                </div>
                {review.title && <h5 className="text-sm font-bold text-white font-ui truncate mb-2 leading-tight">{review.title}</h5>}
                <p className="text-sm text-gray-400 font-ui leading-relaxed">
                  {review.review || 'Rated without review body.'}
                </p>
                <div className="mt-4 pt-3 border-t border-white/5 text-right">
                  <Link to={`/anime/${review.anime_id}`} className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white font-ui font-bold transition-colors">
                    View Anime <ArrowRight className="h-3 w-3 text-brand" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Netflix Top 10 Carousels */}
      <AnimeCarousel
        title={recommended.length > 0 ? "Recommended For You" : "Trending Anime"}
        subtitle={recommended.length > 0 ? "Based on your watching history and favorite genres" : "Popular across the community right now"}
        items={recommended.length > 0 ? recommended : trending}
        showRankBadges={recommended.length === 0}
      />

      {trendingForYou.length > 0 && (
        <AnimeCarousel
          title="Trending For You"
          subtitle="Popular right now (excluding your tracked items)"
          items={trendingForYou}
          showRankBadges={true}
        />
      )}

      {discoveryFeed.length > 0 && (
        <AnimeCarousel
          title="Discover Something New"
          subtitle="A curated mix of trending, seasonal, and top-rated anime"
          items={discoveryFeed}
        />
      )}

      {/* Community Activity */}
      <section className="space-y-6 pt-6 border-t border-white/5">
        <div className="flex items-center justify-between">
          <SectionHeader title="Community Activity" subtitle="What everyone's watching right now" useLogoFont={false} />
          <Link to="/community" className="text-xs font-semibold text-brand hover:text-red-400 flex items-center gap-1 font-ui">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <ActivityFeed limit={8} emptyMessage="No community activity yet." />
      </section>
    </div>
  )
}
