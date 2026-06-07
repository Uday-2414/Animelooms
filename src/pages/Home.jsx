import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SectionHeader from '../components/ui/SectionHeader'
import SearchBar from '../components/ui/SearchBar'
import Button from '../components/ui/Button'
import AnimeCard from '../components/anime/AnimeCard'
import NewsCard from '../components/news/NewsCard'
import LoadingState from '../components/ui/LoadingState'
import EmptyState from '../components/ui/EmptyState'
import { animeService } from '../services/animeService'
import { mockNews } from '../services/mockData'
import { Compass, Play } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [trending, setTrending] = useState([])
  const [topAiring, setTopAiring] = useState([])
  const [popular, setPopular] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let isMounted = true

    async function loadHomeData() {
      try {
        setLoading(true)
        setError(null)

        // Fetch sequentially to prevent concurrent request rate limits (3/sec) on Jikan API
        const trendingData = await animeService.getTrendingAnime()
        const airingData = await animeService.getTopAnime()
        const popularData = await animeService.getPopularThisWeek()

        if (isMounted) {
          setTrending(trendingData)
          setTopAiring(airingData)
          setPopular(popularData)
          setLoading(false)
        }
      } catch (err) {
        console.error("Error loading home data:", err)
        if (isMounted) {
          setError(err.message || 'Unable to load anime.')
          setLoading(false)
        }
      }
    }

    loadHomeData()

    return () => {
      isMounted = false
    }
  }, [refreshKey])

  const handleRetry = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleSearchSubmit = (val) => {
    if (val.trim()) {
      navigate(`/search?q=${encodeURIComponent(val)}`)
    }
  }

  const SkeletonGrid = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {Array.from({ length: 5 }).map((_, idx) => (
        <div 
          key={`skel-${idx}`}
          className="aspect-[2/3] bg-surface-card/20 border border-white/5 rounded-2xl animate-pulse flex flex-col justify-end p-4 gap-2"
        >
          <div className="h-4 bg-white/10 rounded w-2/3 animate-pulse" />
          <div className="h-3 bg-white/5 rounded w-1/3 animate-pulse" />
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-12 pb-12 animate-fade-in">
      
      {/* Premium Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-surface-chrome border border-white/5 shadow-2xl">
        {/* Background Visual Element */}
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&auto=format&fit=crop&q=80')` }} />
        {/* Gradients to blend and focus attention */}
        <div className="absolute inset-0 bg-gradient-to-r from-background-base via-background-base/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background-base via-transparent to-transparent z-10" />
        
        {/* Hero Content */}
        <div className="relative z-20 px-8 py-16 md:p-16 max-w-2xl space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand/10 text-white border border-brand/20 rounded-full text-xs font-bold uppercase tracking-widest font-ui select-none">
            <Compass className="h-3.5 w-3.5 text-brand" />
            Product Preview
          </span>
          
          <h1 className="text-4xl md:text-5xl font-black text-white font-logo leading-tight tracking-wide">
            Discover Your Next Masterpiece
          </h1>
          
          <p className="text-sm md:text-base text-gray-300 font-ui leading-relaxed">
            Explore trending anime, build your watchlist, and track your anime journey.
          </p>

          {/* Search bar inside hero */}
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

      {loading && <LoadingState message="Connecting to live database..." />}

      {error && (
        <div className="py-8">
          <EmptyState
            title="Unable to load anime"
            description={error || "Please check your network and try again."}
            action={
              <Button variant="primary" onClick={handleRetry}>
                Retry
              </Button>
            }
          />
        </div>
      )}

      {/* Trending Anime section - 5-column desktop grid */}
      <section className="space-y-6">
        <SectionHeader 
          title="Trending Anime" 
          subtitle="Top performing series in global databases" 
        />
        {loading ? (
          <SkeletonGrid />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {trending.map((anime) => (
              <AnimeCard 
                key={anime.mal_id} 
                anime={anime} 
              />
            ))}
          </div>
        )}
      </section>

      {/* Top Airing Anime section - 5-column desktop grid */}
      <section className="space-y-6">
        <SectionHeader 
          title="Top Airing Anime" 
          subtitle="Currently broadcasting titles gaining popularity" 
        />
        {loading ? (
          <SkeletonGrid />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {topAiring.map((anime) => (
              <AnimeCard 
                key={anime.mal_id} 
                anime={anime} 
              />
            ))}
            {/* Fill grid to 5 columns if list is shorter with stylish skeletons */}
            {topAiring.length < 5 && 
              Array.from({ length: 5 - topAiring.length }).map((_, idx) => (
                <div 
                  key={`airing-skel-${idx}`}
                  className="aspect-[2/3] bg-surface-card/20 border border-white/5 rounded-2xl animate-pulse flex items-center justify-center"
                >
                  <span className="text-[10px] text-gray-700 font-ui font-semibold uppercase tracking-widest">
                    Upcoming Release
                  </span>
                </div>
              ))
            }
          </div>
        )}
      </section>

      {/* Popular This Week section - 5-column desktop grid */}
      <section className="space-y-6">
        <SectionHeader 
          title="Popular This Week" 
          subtitle="Most viewed and active fan favorites this week" 
        />
        {loading ? (
          <SkeletonGrid />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {popular.map((anime) => (
              <AnimeCard 
                key={anime.mal_id} 
                anime={anime} 
              />
            ))}
            {popular.length < 5 && 
              Array.from({ length: 5 - popular.length }).map((_, idx) => (
                <div 
                  key={`pop-skel-${idx}`}
                  className="aspect-[2/3] bg-surface-card/20 border border-white/5 rounded-2xl animate-pulse flex items-center justify-center"
                >
                  <span className="text-[10px] text-gray-700 font-ui font-semibold uppercase tracking-widest">
                    Discover Title
                  </span>
                </div>
              ))
            }
          </div>
        )}
      </section>

      {/* Anime News Preview section */}
      <section className="space-y-6">
        <SectionHeader 
          title="Anime News Preview" 
          subtitle="Latest reports and updates from the editorial desk" 
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mockNews.map((newsItem, index) => (
            <NewsCard 
              key={index} 
              news={newsItem} 
            />
          ))}
        </div>
      </section>

    </div>
  )
}
