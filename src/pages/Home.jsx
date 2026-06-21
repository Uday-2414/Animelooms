import { useState, useEffect, useContext, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import SectionHeader from '../components/ui/SectionHeader'
import SearchBar from '../components/ui/SearchBar'
import Button from '../components/ui/Button'
import AnimeCard from '../components/anime/AnimeCard'
import NewsCard from '../components/news/NewsCard'
import EmptyState from '../components/ui/EmptyState'
import SEO from '../components/seo/SEO'
import { animeService } from '../services/animeService'
import { newsService } from '../services/newsService'
import { progressService } from '../services/progressService'
import { recommendationService } from '../services/recommendationService'
import { reviewService } from '../services/reviewService'
import ProgressBar from '../components/ui/ProgressBar'
import StatsCard from '../components/ui/StatsCard'
import { trackDashboardVisit, trackRecommendationView } from '../services/analyticsService'
import AuthContext from '../context/AuthContext'
import { AnimeCardSkeleton, NewsCardSkeleton } from '../components/ui/Skeleton'
import { Compass, Play, Eye, CheckCircle2, Clock, Activity, ArrowRight, Sparkles, MessageSquareText, Star } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [searchQuery, setSearchQuery] = useState('')
  const [trending, setTrending] = useState([])
  const [topAiring, setTopAiring] = useState([])
  const [popular, setPopular] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Separate states for News preview
  const [news, setNews] = useState([])
  const [newsLoading, setNewsLoading] = useState(true)
  const [newsError, setNewsError] = useState(null)

  // User tracking progress states
  const [progressList, setProgressList] = useState([])
  const [progressLoading, setProgressLoading] = useState(!!user)
  const [recentReviews, setRecentReviews] = useState([])

  // Recommendations state
  const [recommended, setRecommended] = useState([])

  // Fetch Anime Data (trending, top airing, popular)
  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    async function loadHomeData() {
      try {
        setLoading(true)
        setError(null)

        // Fetch sequentially to prevent concurrent request rate limits (3/sec) on Jikan API
        const trendingData = await animeService.getTrendingAnime({ signal: controller.signal })
        const airingData = await animeService.getTopAnime({ signal: controller.signal })
        const popularData = await animeService.getPopularThisWeek({ signal: controller.signal })

        if (isMounted) {
          setTrending(trendingData)
          setTopAiring(airingData)
          setPopular(popularData)
          setLoading(false)
        }
      } catch (err) {
        if (err.name === 'AbortError') return
        console.error("Error loading home data:", err)
        if (isMounted) {
          setError('Anime data is temporarily unavailable.')
          setLoading(false)
        }
      }
    }

    loadHomeData()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [refreshKey])

  // Fetch News Data
  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    async function loadNewsData() {
      try {
        setNewsLoading(true)
        setNewsError(null)
        const newsData = await newsService.fetchNews({ signal: controller.signal })
        if (isMounted) {
          setNews(newsData.slice(0, 2)) // Show top 2 for preview
          setNewsLoading(false)
        }
      } catch (err) {
        if (err.name === 'AbortError') return
        console.error("Error loading home news:", err)
        if (isMounted) {
          setNewsError('News preview is temporarily unavailable.')
          setNewsLoading(false)
        }
      }
    }

    loadNewsData()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [refreshKey])

  // Fetch User Progress tracking data
  useEffect(() => {
    let isMounted = true
    if (!user) {
      return
    }

    async function loadProgress() {
      try {
        const [data, reviews] = await Promise.all([
          progressService.getProgress(user.id),
          reviewService.getUserRecentReviews(user.id, 3)
        ])
        if (isMounted) {
          setProgressList(data || [])
          setRecentReviews(reviews || [])
          trackDashboardVisit()
        }
      } catch (err) {
        console.error("Error loading dashboard progress:", err)
      } finally {
        if (isMounted) {
          setProgressLoading(false)
        }
      }
    }

    loadProgress()

    return () => {
      isMounted = false
    }
  }, [user])

  // Process Recommendations when progress or trending changes
  useEffect(() => {
    let isMounted = true

    async function loadRecommendations() {
      if (!user || progressList.length === 0) return

      try {
        const recommendedData = await recommendationService.getRecommendedForYou(progressList)
        if (isMounted && recommendedData.length > 0) {
          setRecommended(recommendedData)
          trackRecommendationView('dashboard_recommended')
        }
      } catch (err) {
        console.error("Error loading recommendations:", err)
      }
    }

    loadRecommendations()

    return () => {
      isMounted = false
    }
  }, [user, progressList])

  const trendingForYou = useMemo(() => {
    if (trending.length > 0 && progressList.length > 0) {
      return recommendationService.getTrendingForYou(trending, progressList)
    } else if (trending.length > 0) {
      return trending.slice(0, 5)
    }
    return []
  }, [trending, progressList])

  // Discovery Feed (Mix of trending, popular, airing, recommended)
  const discoveryFeed = useMemo(() => {
    if (loading) return []
    // Create a unique mix
    const pool = [...trending, ...popular, ...topAiring, ...recommended]
    const uniqueMix = Array.from(new Map(pool.map(item => [item.mal_id, item])).values())
    
    // Shuffle array securely
    for (let i = uniqueMix.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [uniqueMix[i], uniqueMix[j]] = [uniqueMix[j], uniqueMix[i]];
    }

    return uniqueMix.slice(0, 10)
  }, [loading, trending, popular, topAiring, recommended])

  const handleRetry = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleSearchSubmit = (val) => {
    if (val.trim()) {
      navigate(`/search?q=${encodeURIComponent(val)}`)
    }
  }

  // Dashboard calculations
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
      .slice(0, 4) // Show top 4
  }, [progressList])

  const recentlyAddedList = useMemo(() => {
    // Sort by created_at DESC
    return [...progressList]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5) // Show top 5
  }, [progressList])

  const profileUser = useMemo(() => {
    if (!user) return null
    const metadata = user.user_metadata || {}
    return {
      name: metadata.full_name || metadata.name || user.email?.split('@')[0] || 'User',
      avatar_url: metadata.avatar_url || metadata.picture || null,
    }
  }, [user])

  // Renders the Personalized Dashboard for logged-in users
  const renderDashboard = () => {
    return (
      <div className="space-y-10">
        {/* Welcome Back Banner */}
        <section className="relative rounded-3xl overflow-hidden bg-surface-chrome border border-white/5 shadow-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute inset-0 bg-gradient-to-r from-brand/10 to-transparent pointer-events-none" />
          
          <div className="flex items-center gap-4 relative z-10">
            {profileUser.avatar_url ? (
              <img
                src={profileUser.avatar_url}
                alt={profileUser.name}
                className="w-16 h-16 rounded-full border-2 border-brand object-cover shadow-glow"
              />
            ) : (
              <div className="w-16 h-16 rounded-full border-2 border-brand bg-surface-card flex items-center justify-center text-xl font-bold text-white shadow-glow">
                {profileUser.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black text-white font-logo">
                  Welcome back, {profileUser.name}!
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

        {/* Main Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Continue Watching */}
          <div className="lg:col-span-2 space-y-6">
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
            ) : continueWatchingList.length === 0 ? (
              <div className="rounded-2xl border border-white/5 bg-surface-chrome/20 p-8 text-center text-gray-500 font-ui text-sm">
                Start tracking anime to continue watching.
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

          {/* Right Column: Recently Added */}
          <div className="space-y-6">
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
            ) : recentlyAddedList.length === 0 ? (
              <div className="rounded-2xl border border-white/5 bg-surface-chrome/20 p-6 text-center text-gray-500 font-ui text-xs">
                Your recently tracked anime will appear here.
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
        </div>

        {/* Your Recent Reviews */}
        {recentReviews.length > 0 && (
          <section className="space-y-6 pt-6 border-t border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-brand/10 rounded-xl border border-brand/20">
                <MessageSquareText className="h-5 w-5 text-brand" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-ui">Your Recent Reviews</h2>
                <p className="text-sm text-gray-400 font-ui">Look back at your community contributions</p>
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
                  <p className="text-sm text-gray-400 font-ui line-clamp-3 leading-relaxed">
                    {review.review || <span className="italic text-gray-600">Rated without review body.</span>}
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

        {/* Recommended For You or Fallback */}
        {recommended.length > 0 ? (
          <section className="space-y-6 pt-6 border-t border-white/5">
            <SectionHeader
              title="Recommended For You"
              subtitle="Based on your watching history and favorite genres"
              useLogoFont={false}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-fade-in">
              {recommended.map((anime) => (
                <AnimeCard key={anime.mal_id} anime={anime} />
              ))}
            </div>
          </section>
        ) : trending.length > 0 ? (
          <section className="space-y-6 pt-6 border-t border-white/5">
            <SectionHeader
              title="Trending Anime"
              subtitle="Popular right now across the platform"
              useLogoFont={false}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-fade-in">
              {trending.slice(0, 5).map((anime) => (
                <AnimeCard key={anime.mal_id} anime={anime} />
              ))}
            </div>
          </section>
        ) : null}

        {/* Trending For You */}
        {trendingForYou.length > 0 && (
          <section className="space-y-6 pt-6 border-t border-white/5">
            <SectionHeader
              title="Trending For You"
              subtitle="Popular right now (excluding your tracked items)"
              useLogoFont={false}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-fade-in">
              {trendingForYou.map((anime) => (
                <AnimeCard key={anime.mal_id} anime={anime} />
              ))}
            </div>
          </section>
        )}

        {/* Discover Something New */}
        {discoveryFeed.length > 0 && (
          <section className="space-y-6 pt-6 border-t border-white/5">
            <SectionHeader
              title="Discover Something New"
              subtitle="A curated mix of trending, seasonal, and top-rated anime"
              useLogoFont={false}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-fade-in">
              {discoveryFeed.map((anime) => (
                <AnimeCard key={anime.mal_id} anime={anime} />
              ))}
            </div>
          </section>
        )}
      </div>
    )
  }

  // Renders the standard hero landing page for anonymous users
  const renderAnonymousHome = () => {
    return (
      <div className="space-y-12 pb-12 animate-fade-in">
        
        {/* Premium Hero Section */}
        <section className="relative rounded-3xl overflow-hidden bg-surface-chrome border border-white/5 shadow-2xl">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&auto=format&fit=crop&q=80')` }} />
          <div className="absolute inset-0 bg-gradient-to-r from-background-base via-background-base/80 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-background-base via-transparent to-transparent z-10" />
          
          <div className="relative z-20 px-8 py-16 md:p-16 max-w-2xl space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand/10 text-white border border-brand/20 rounded-full text-xs font-bold uppercase tracking-widest font-ui select-none">
              <Compass className="h-3.5 w-3.5 text-brand" />
              {user ? 'Welcome to AnimeLoom' : 'Product Preview'}
            </span>
            
            <h1 className="text-4xl md:text-5xl font-black text-white font-logo leading-tight tracking-wide">
              Discover Your Next Masterpiece
            </h1>
            
            <p className="text-sm md:text-base text-gray-300 font-ui leading-relaxed">
              Explore trending anime, build your watchlist, and track your anime journey.
            </p>

            <div className="pt-2 max-w-lg">
              <SearchBar 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSearch={handleSearchSubmit}
                placeholder="Search trending titles..."
              />
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button 
                variant="primary" 
                className="flex items-center gap-2"
                onClick={() => navigate('/search')}
              >
                <Play className="h-4 w-4 fill-current" />
                Explore Anime
              </Button>
              <Button 
                variant="secondary"
                onClick={() => navigate('/rankings')}
              >
                View Rankings
              </Button>
            </div>
          </div>
        </section>

        {error && (
          <div className="py-8">
            <EmptyState
              title="Anime data is temporarily unavailable"
              description="We couldn't load the anime lists. Please try again."
              action={
                <Button variant="primary" onClick={handleRetry}>
                  Retry Loading
                </Button>
              }
            />
          </div>
        )}

        {/* Trending Anime section */}
        <section className="space-y-6">
          <SectionHeader 
            title="Trending Anime" 
            subtitle="Top performing series in global databases" 
          />
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {Array.from({ length: 5 }).map((_, idx) => (
                <AnimeCardSkeleton key={`trending-skel-${idx}`} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-fade-in">
              {trending.map((anime) => (
                <AnimeCard 
                  key={anime.mal_id} 
                  anime={anime} 
                />
              ))}
            </div>
          )}
        </section>

        {/* Top Airing Anime section */}
        <section className="space-y-6">
          <SectionHeader 
            title="Top Airing Anime" 
            subtitle="Currently broadcasting titles gaining popularity" 
          />
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {Array.from({ length: 5 }).map((_, idx) => (
                <AnimeCardSkeleton key={`airing-skel-${idx}`} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-fade-in">
              {topAiring.map((anime) => (
                <AnimeCard 
                  key={anime.mal_id} 
                  anime={anime} 
                />
              ))}
            </div>
          )}
        </section>

        {/* Popular This Week section */}
        <section className="space-y-6">
          <SectionHeader 
            title="Popular This Week" 
            subtitle="Most viewed and active fan favorites this week" 
          />
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {Array.from({ length: 5 }).map((_, idx) => (
                <AnimeCardSkeleton key={`pop-skel-${idx}`} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-fade-in">
              {popular.map((anime) => (
                <AnimeCard 
                  key={anime.mal_id} 
                  anime={anime} 
                />
              ))}
            </div>
          )}
        </section>

        {/* Anime News Preview section */}
        <section className="space-y-6">
          <SectionHeader 
            title="Anime News Preview" 
            subtitle="Latest reports and updates from the editorial desk" 
          />
          {newsLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <NewsCardSkeleton />
              <NewsCardSkeleton />
            </div>
          ) : newsError ? (
            <div className="rounded-2xl border border-white/5 bg-surface-chrome/30 p-6 text-center text-sm text-gray-500 font-ui">
              {newsError}
              <div className="mt-3">
                <Button variant="secondary" size="sm" onClick={handleRetry}>
                  Retry News
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
              {news.map((newsItem, index) => (
                <NewsCard 
                  key={index} 
                  news={newsItem} 
                />
              ))}
            </div>
          )}
        </section>
      </div>
    )
  }

  return (
    <>
      <SEO
        title="Discover Trending Anime"
        description="AnimeLoom helps you discover trending anime, track your watchlist, explore rankings, and stay updated with the latest industry news."
        pathname="/"
      />
      {user && (progressList.length > 0 || progressLoading) ? renderDashboard() : renderAnonymousHome()}
    </>
  )
}
