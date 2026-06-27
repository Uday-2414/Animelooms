import { useState, useEffect, useContext } from 'react'
import { Sparkles, Compass, Flame, Star, Zap } from 'lucide-react'
import SEO from '../components/seo/SEO'
import SectionHeader from '../components/ui/SectionHeader'
import LoadingState from '../components/ui/LoadingState'
import AuthContext from '../context/AuthContext'
import AnimeCarousel from '../components/anime/AnimeCarousel'

// Data Services
import { progressService } from '../services/progressService'

// AI Services
import { recommendationEngine } from '../services/ai/recommendationEngine'
import { watchPlanner } from '../services/ai/watchPlanner'
import { explanationGenerator } from '../services/ai/explanationGenerator'
import WatchNextCard from '../components/dashboard/WatchNextCard'

const BASE_URL = 'https://api.jikan.moe/v4'

export default function DiscoverHub() {
  const { user } = useContext(AuthContext)
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Data States
  const [trending, setTrending] = useState([])
  const [tasteBased, setTasteBased] = useState([])
  const [hiddenGems, setHiddenGems] = useState([])
  const [watchNextItems, setWatchNextItems] = useState([])
  const [progressList, setProgressList] = useState([])

  useEffect(() => {
    let isMounted = true

    async function fetchData() {
      setLoading(true)
      try {
        // 1. Fetch user data if logged in
        let localProgress = []
        let favoriteGenres = []
        if (user) {
          localProgress = await progressService.getProgress(user.id) || []
          if (isMounted) setProgressList(localProgress)
          
          // Heuristically calculate favorite genres from progress
          // In a real DB this would be fetched from user_profiles.favorite_genres, 
          // but we can also infer it live for AI "smartness".
          const { profileService } = await import('../services/profileService')
          const profile = await profileService.getProfile(user.id)
          if (profile && profile.favorite_genres) {
            favoriteGenres = profile.favorite_genres
          }
        }

        // 2. Fetch parallel data feeds
        // Note: Using aggressive caching / Promise.all to avoid rate limits
        const [trendingRes, tasteRes, gemsRes] = await Promise.all([
          fetch(`${BASE_URL}/top/anime?filter=airing&sfw=true&limit=15`).then(r => r.json()),
          recommendationEngine.getBasedOnTaste(favoriteGenres, localProgress, 15),
          recommendationEngine.getHiddenGems(localProgress, 15)
        ])

        if (!isMounted) return

        // 3. Process Trending (filter out watched)
        const trendingUntracked = (trendingRes?.data || [])
          .filter(anime => !localProgress.some(p => p.anime_id === anime.mal_id))
          .map(anime => ({
            ...anime,
            ai_explanation: explanationGenerator.generate(anime, { contextType: 'trending' })
          }))
        
        setTrending(trendingUntracked)

        // 4. Process Taste Based
        const processedTaste = tasteRes.map(anime => ({
          ...anime,
          ai_explanation: explanationGenerator.generate(anime, { contextType: 'taste', favoriteGenres })
        }))
        setTasteBased(processedTaste)

        // 5. Process Hidden Gems
        const processedGems = gemsRes.map(anime => ({
          ...anime,
          ai_explanation: explanationGenerator.generate(anime, { contextType: 'hidden_gem' })
        }))
        setHiddenGems(processedGems)

        // 6. Generate Watch Planner
        if (localProgress.length > 0) {
          setWatchNextItems(watchPlanner.getWatchNext(localProgress))
        }

      } catch (err) {
        console.error('[DiscoverHub] Error fetching discovery data:', err)
        if (isMounted) setError('Failed to load discovery engine. Please try again.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()
    return () => { isMounted = false }
  }, [user])

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-6">
        <Sparkles className="h-10 w-10 text-brand animate-pulse" />
        <LoadingState message="AI is preparing your personalized recommendations..." />
      </div>
    )
  }

  return (
    <>
      <SEO 
        title="Discover Anime" 
        description="Personalized AI anime recommendations based on your unique taste." 
        pathname="/discover" 
      />

      <div className="space-y-12 pb-16 animate-fade-in font-ui">
        {/* Header Hero */}
        <section className="relative rounded-3xl overflow-hidden bg-surface-chrome border border-white/5 shadow-2xl p-8 md:p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-brand/20 via-surface-card to-brand/5 pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Compass className="h-5 w-5 text-brand" />
              <span className="text-xs font-bold text-brand uppercase tracking-widest">Discovery Engine</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white font-logo leading-tight">
              Find Your Next Obsession
            </h1>
            <p className="text-gray-300 text-lg md:text-xl leading-relaxed">
              Powered by our smart recommendation engine. The more you track and rate, the better our suggestions become.
            </p>
          </div>
        </section>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Watch Planner Section */}
        {user && watchNextItems.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 shadow-glow">
                <Zap className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white font-ui">Watch Planner</h2>
                <p className="text-sm text-gray-400 font-ui">Smart suggestions on what to pick up right now.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {watchNextItems.slice(0, 2).map(item => (
                <div key={item.id} className="relative">
                  <div className="absolute -top-3 right-4 z-10 px-3 py-1 bg-surface-card border border-white/10 rounded-full shadow-lg">
                    <span className="text-[10px] font-bold text-gray-300 flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-brand" />
                      {item.explanation}
                    </span>
                  </div>
                  <WatchNextCard item={item} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* AI Taste Based Recommendations */}
        {user && tasteBased.length > 0 && (
          <section>
             <AnimeCarousel
                title="Based On Your Taste"
                subtitle="Curated picks matching your favorite genres"
                items={tasteBased}
              />
          </section>
        )}

        {/* Trending Section */}
        {trending.length > 0 && (
          <section>
            <AnimeCarousel
              title="Trending Today"
              subtitle="What the AnimeLoom community is currently obsessed with"
              items={trending}
              showRankBadges={true}
            />
          </section>
        )}

        {/* Hidden Gems Section */}
        {hiddenGems.length > 0 && (
          <section>
            <AnimeCarousel
              title="Hidden Gems & Underrated"
              subtitle="Highly rated masterpiece anime that slipped under the radar"
              items={hiddenGems}
            />
          </section>
        )}

        {!user && (
          <div className="mt-12 p-8 bg-surface-chrome/40 border border-brand/20 rounded-2xl text-center space-y-4">
            <Star className="h-10 w-10 text-brand mx-auto mb-2" />
            <h3 className="text-xl font-bold text-white font-ui">Want personalized recommendations?</h3>
            <p className="text-sm text-gray-400 font-ui max-w-lg mx-auto">
              Create an account or sign in to let our AI analyze your watch history and suggest exactly what you'll love.
            </p>
          </div>
        )}
      </div>
    </>
  )
}
