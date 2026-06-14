import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SectionHeader from '../components/ui/SectionHeader'
import SearchBar from '../components/ui/SearchBar'
import Button from '../components/ui/Button'
import AnimeCard from '../components/anime/AnimeCard'
import NewsCard from '../components/news/NewsCard'
import EmptyState from '../components/ui/EmptyState'
import SEO from '../components/seo/SEO'
import { animeService } from '../services/animeService'
import { newsService } from '../services/newsService'
import { AnimeCardSkeleton, NewsCardSkeleton } from '../components/ui/Skeleton'
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

  // Separate states for News preview
  const [news, setNews] = useState([])
  const [newsLoading, setNewsLoading] = useState(true)
  const [newsError, setNewsError] = useState(null)

  // Fetch Anime Data
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

  const handleRetry = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleSearchSubmit = (val) => {
    if (val.trim()) {
      navigate(`/search?q=${encodeURIComponent(val)}`)
    }
  }

  return (
    <>
      <SEO
        title="Discover Trending Anime"
        description="AnimeLoom helps you discover trending anime, track your watchlist, explore rankings, and stay updated with the latest industry news."
        pathname="/"
      />
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

        {/* Trending Anime section - 5-column desktop grid */}
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

        {/* Top Airing Anime section - 5-column desktop grid */}
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

        {/* Popular This Week section - 5-column desktop grid */}
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
    </>
  )
}
