import React, { useEffect, useState, useContext, useMemo } from 'react'
import { Sparkles, Compass, Flame, Trophy, Star, Bookmark, Gem } from 'lucide-react'
import SectionHeader from '../components/ui/SectionHeader'
import AnimeCarousel from '../components/anime/AnimeCarousel'
import WatchNextCard from '../components/dashboard/WatchNextCard'
import SEO from '../components/seo/SEO'
import AuthContext from '../context/AuthContext'
import { useProgress } from '../context/ProgressContext'
import { recommendationService } from '../services/recommendationService'
import { animeService } from '../services/animeService'
import { trackDiscoverVisit } from '../services/analyticsService'

export default function Discover() {
  const { user } = useContext(AuthContext)
  const { progressList } = useProgress()

  const [loading, setLoading] = useState(true)
  const [recommended, setRecommended] = useState([])
  const [trending, setTrending] = useState([])
  const [topAiring, setTopAiring] = useState([])
  const [hiddenGems, setHiddenGems] = useState([])
  const [underrated, setUnderrated] = useState([])

  useEffect(() => {
    trackDiscoverVisit()
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadDiscoverFeeds() {
      setLoading(true)
      try {
        const [recData, trendData, airingData, topData] = await Promise.all([
          recommendationService.getRecommendedForYou(progressList),
          animeService.getTrendingAnime(),
          animeService.getTopAiringAnime(),
          animeService.getTopAnime()
        ])

        if (isMounted) {
          setRecommended(recData || [])
          setTrending(trendData || [])
          setTopAiring(airingData || [])

          // Derive Hidden Gems & Underrated from top data
          const gems = (topData || []).slice(0, 10).map(item => ({
            ...item,
            reason: 'Hidden Gem: Exceptional community rating with distinct artistic direction.'
          }))
          setHiddenGems(gems)

          const under = (trendData || []).slice(5, 10).map(item => ({
            ...item,
            reason: 'Underrated: High completion satisfaction among core fans.'
          }))
          setUnderrated(under)
        }
      } catch (err) {
        console.error('[Discover] Error loading discovery feeds:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadDiscoverFeeds()

    return () => { isMounted = false }
  }, [progressList])

  const watchNextItem = useMemo(() => {
    return recommendationService.getWatchNext(progressList)
  }, [progressList])

  return (
    <>
      <SEO
        title="Discover Anime Hub"
        description="Explore intelligent anime recommendations, hidden gems, underrated masterpieces, and personalized feeds."
        pathname="/discover"
      />
      <div className="space-y-12 animate-fade-in pb-12 font-ui">
        {/* Discover Header Hero */}
        <section className="relative rounded-3xl overflow-hidden bg-surface-chrome border border-white/5 shadow-2xl p-8 md:p-12">
          <div className="absolute inset-0 bg-gradient-to-r from-brand/20 via-brand/5 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 text-brand border border-brand/20 rounded-full text-xs font-bold uppercase tracking-wider">
              <Compass className="h-4 w-4 text-brand animate-spin-slow" />
              AI-Powered Discovery Hub
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white font-logo leading-tight">
              Uncover Your Next Favorite Anime
            </h1>
            <p className="text-base md:text-lg text-gray-300 leading-relaxed">
              Our intelligent companion analyzes viewing habits, genre affinities, and community scores to deliver tailormade discoveries.
            </p>
          </div>
        </section>

        {/* Watch Next Smart Continuation Card */}
        {user && watchNextItem && (
          <section>
            <WatchNextCard item={watchNextItem} />
          </section>
        )}

        {/* Netflix Top 10 Horizontal Carousels with AI Reason Explanations */}
        <AnimeCarousel
          title="Recommended For You"
          subtitle="Smart recommendations matched to your unique taste"
          items={recommended}
          loading={loading}
          showRankBadges={false}
        />

        <AnimeCarousel
          title="Hidden Gems"
          subtitle="Top-rated series you may have missed"
          items={hiddenGems}
          loading={loading}
          showRankBadges={true}
        />

        <AnimeCarousel
          title="Trending Today"
          subtitle="Most active shows across the community right now"
          items={trending}
          loading={loading}
          showRankBadges={true}
        />

        <AnimeCarousel
          title="Top Airing Season Picks"
          subtitle="Highest rated anime currently airing weekly"
          items={topAiring}
          loading={loading}
          showRankBadges={false}
        />

        <AnimeCarousel
          title="Underrated Masterpieces"
          subtitle="Critically acclaimed shows worthy of more spotlight"
          items={underrated}
          loading={loading}
          showRankBadges={false}
        />
      </div>
    </>
  )
}
