import { useEffect, useRef, useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import SectionHeader from '../components/ui/SectionHeader'
import SearchBar from '../components/ui/SearchBar'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'
import AnimeCard from '../components/anime/AnimeCard'
import CollectionCard from '../components/collections/CollectionCard'
import SEO from '../components/seo/SEO'
import { animeService } from '../services/animeService'
import { socialService } from '../services/socialService'
import { collectionService } from '../services/collectionService'
import { trackSearch, trackNaturalSearch } from '../services/analyticsService'
import { AnimeCardSkeleton } from '../components/ui/Skeleton'
import { Search as SearchIcon, Sparkles, History, Flame, Users, FolderHeart, Film } from 'lucide-react'
import aiSearchService from '../services/aiSearchService'
import SmartFilterPanel from '../components/search/SmartFilterPanel'
import FollowButton from '../components/social/FollowButton'

const SEARCH_DEBOUNCE_MS = 500

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(() => searchParams.get('q') || '')
  const [activeTab, setActiveTab] = useState('anime') // 'anime', 'collections', 'users'
  const [filters, setFilters] = useState({ genre: '', type: '', length: '', minScore: '' })
  
  const [searchState, setSearchState] = useState({
    status: 'idle',
    query: '',
    results: { anime: [], collections: [], users: [] },
  })
  const [refreshKey, setRefreshKey] = useState(0)
  const latestSearchId = useRef(0)

  // Smart Search States
  const [trending, setTrending] = useState([])
  const [recentSearches, setRecentSearches] = useState([])
  const popularSearches = useMemo(() => aiSearchService.getPopularSearches(), [])

  // Natural language intent parsing
  const parsedIntent = useMemo(() => {
    return aiSearchService.parseIntent(query)
  }, [query])

  // Load initial data
  useEffect(() => {
    setRecentSearches(aiSearchService.getRecentSearches())

    let isMounted = true
    const controller = new AbortController()
    animeService.getTrendingAnime({ signal: controller.signal })
      .then(data => {
        if (isMounted) setTrending(data.slice(0, 5))
      })
      .catch(() => {})

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

  const normalizedQuery = query.trim()

  useEffect(() => {
    latestSearchId.current += 1
    const searchId = latestSearchId.current

    if (!normalizedQuery) {
      const timer = setTimeout(() => {
        setSearchState({
          status: 'idle',
          query: '',
          results: { anime: [], collections: [], users: [] },
        })
      }, 0)
      return () => clearTimeout(timer)
    }

    const controller = new AbortController()

    const debounceId = setTimeout(async () => {
      setSearchState((current) => ({
        ...current,
        status: 'loading',
        query: normalizedQuery,
      }))

      try {
        const searchTerm = parsedIntent.cleanQuery || normalizedQuery
        
        // Parallel search across domains
        const [animeResults, userResults] = await Promise.all([
          animeService.searchAnime(searchTerm, { signal: controller.signal }),
          socialService.searchUsers(searchTerm)
        ])

        if (latestSearchId.current !== searchId) return

        trackSearch(normalizedQuery)
        if (parsedIntent.detectedIntents.length > 0) {
          trackNaturalSearch(normalizedQuery, parsedIntent.detectedIntents.length)
        }

        setSearchState({
          status: 'success',
          query: normalizedQuery,
          results: { anime: animeResults, collections: [], users: userResults }, // Collections search requires specialized Supabase query later
        })
      } catch (err) {
        if (err.name === 'AbortError') return
        console.error('Search failed:', err)

        if (latestSearchId.current !== searchId) return

        setSearchState({
          status: 'error',
          query: normalizedQuery,
          results: { anime: [], collections: [], users: [] },
        })
      }
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      clearTimeout(debounceId)
      controller.abort()
    }
  }, [normalizedQuery, refreshKey, parsedIntent.cleanQuery])

  const handleSearchSubmit = (value) => {
    const nextQuery = value.trim()
    if (nextQuery) {
      aiSearchService.addSearchHistory(nextQuery)
      setRecentSearches(aiSearchService.getRecentSearches())
    }
    setQuery(nextQuery)
    setSearchParams(nextQuery ? { q: nextQuery } : {})
  }

  const handleSuggestionClick = (suggestion) => {
    aiSearchService.addSearchHistory(suggestion)
    setRecentSearches(aiSearchService.getRecentSearches())
    setQuery(suggestion)
    setSearchParams({ q: suggestion })
  }

  const handleQueryChange = (event) => {
    setQuery(event.target.value)
  }

  const handleRetry = () => {
    setRefreshKey((prev) => prev + 1)
  }

  // Filter Anime results
  const filteredAnimeResults = useMemo(() => {
    let list = searchState.results.anime

    if (filters.genre) list = list.filter(item => item.genres && item.genres.includes(filters.genre))
    if (filters.type) list = list.filter(item => item.type && item.type.toLowerCase() === filters.type.toLowerCase())
    if (filters.minScore) {
      const min = parseFloat(filters.minScore)
      list = list.filter(item => item.score && item.score >= min)
    }
    if (filters.length) {
      if (filters.length === 'short') list = list.filter(item => item.episodes && item.episodes <= 12)
      if (filters.length === 'medium') list = list.filter(item => item.episodes && item.episodes > 12 && item.episodes <= 24)
      if (filters.length === 'long') list = list.filter(item => item.episodes && item.episodes >= 25)
    }

    if (parsedIntent.filters.maxEpisodes) list = list.filter(item => item.episodes && item.episodes <= parsedIntent.filters.maxEpisodes)
    if (parsedIntent.filters.genre && !filters.genre) list = list.filter(item => item.genres && item.genres.includes(parsedIntent.filters.genre))

    return list
  }, [searchState.results.anime, filters, parsedIntent.filters])

  const renderContent = () => {
    if (!normalizedQuery) {
      return (
        <div className="space-y-8 animate-fade-in font-ui">
          {recentSearches.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5 text-brand" /> Recent Searches
                </h3>
                <button 
                  onClick={() => { aiSearchService.clearSearchHistory(); setRecentSearches([]) }}
                  className="text-[10px] text-gray-500 hover:text-gray-300 cursor-pointer"
                >
                  Clear History
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term, i) => (
                  <button 
                    key={`recent-${i}`}
                    onClick={() => handleSuggestionClick(term)}
                    className="px-3 py-1.5 bg-surface-chrome border border-white/5 hover:border-brand/40 text-xs text-gray-300 font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-yellow-400" /> Suggested & Natural Queries
            </h3>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term, i) => (
                <button 
                  key={`pop-${i}`}
                  onClick={() => handleSuggestionClick(term)}
                  className="px-3 py-1.5 bg-brand/10 border border-brand/20 hover:border-brand/50 text-xs text-brand font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {trending.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-white/5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-orange-500" /> Trending Right Now
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {trending.map((anime) => (
                  <AnimeCard key={`trend-${anime.mal_id}`} anime={anime} />
                ))}
              </div>
            </div>
          )}
        </div>
      )
    }

    if (searchState.status === 'loading' || searchState.query !== normalizedQuery) {
      if (activeTab === 'anime') {
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, idx) => (
              <AnimeCardSkeleton key={`search-skel-${idx}`} />
            ))}
          </div>
        )
      }
      return <div className="py-20 text-center text-gray-400">Loading {activeTab}...</div>
    }

    if (searchState.status === 'error') {
      return (
        <EmptyState
          icon={<SearchIcon className="h-10 w-10 text-brand" />}
          title="Search is temporarily unavailable"
          description="We couldn't complete your search. Please try again."
          action={<Button variant="primary" onClick={handleRetry}>Retry Search</Button>}
        />
      )
    }

    // Render Anime Tab
    if (activeTab === 'anime') {
      if (filteredAnimeResults.length === 0) {
        return <EmptyState icon={<SearchIcon className="h-10 w-10 text-gray-500" />} title="No matching anime found" />
      }
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-fade-in">
          {filteredAnimeResults.map((anime) => (
            <AnimeCard key={anime.mal_id} anime={anime} />
          ))}
        </div>
      )
    }

    // Render Users Tab
    if (activeTab === 'users') {
      if (searchState.results.users.length === 0) {
        return <EmptyState icon={<Users className="h-10 w-10 text-gray-500" />} title="No users found" />
      }
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in">
          {searchState.results.users.map(u => (
            <div key={u.id} className="flex items-center gap-4 bg-surface-card border border-white/5 p-4 rounded-2xl">
              <Link to={`/user/${u.id}`} className="flex-shrink-0">
                <img src={u.avatar_url || `https://ui-avatars.com/api/?name=${u.display_name || u.username}&background=1d2430&color=ffffff`} className="w-12 h-12 rounded-full border-2 border-surface-chrome" alt="" />
              </Link>
              <div className="flex-grow min-w-0">
                <Link to={`/user/${u.id}`} className="font-bold text-white hover:text-brand truncate block">
                  {u.display_name || u.username}
                </Link>
                {u.username && <p className="text-xs text-gray-400 truncate">@{u.username}</p>}
              </div>
              <FollowButton targetUserId={u.id} className="flex-shrink-0" />
            </div>
          ))}
        </div>
      )
    }

    // Render Collections Tab (Not fully implemented on backend yet for search, fallback)
    if (activeTab === 'collections') {
      return (
        <EmptyState 
          icon={<FolderHeart className="h-10 w-10 text-gray-500" />} 
          title="Collection search coming soon" 
          description="We are still indexing collections for search. Check out Discover."
          action={<Link to="/discover/collections"><Button>Go to Discover</Button></Link>}
        />
      )
    }
  }

  return (
    <>
      <SEO
        title={normalizedQuery ? `Search results for ${normalizedQuery}` : 'Search'}
        description="Search across AnimeLoom for anime, users, and custom collections."
        pathname="/search"
      />
      <div className="space-y-6 animate-fade-in font-ui">
        <SectionHeader
          title="Global Search"
          subtitle="Explore the AnimeLoom ecosystem"
        />

        <div className="max-w-2xl mx-auto w-full space-y-4">
          <SearchBar
            value={query}
            onChange={handleQueryChange}
            onSearch={handleSearchSubmit}
            placeholder="Search anime, users, or collections..."
          />

          {/* AI Intent Feedback Banner */}
          {parsedIntent.detectedIntents.length > 0 && activeTab === 'anime' && (
            <div className="flex items-center gap-2 p-3 bg-brand/10 border border-brand/20 rounded-xl text-xs text-brand font-semibold animate-fade-in">
              <Sparkles className="h-4 w-4 flex-shrink-0 animate-pulse" />
              <span>AI Parsed Intent: {parsedIntent.detectedIntents.join(' • ')}</span>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-center gap-2 pt-2 border-b border-white/5 pb-4">
          <button 
            onClick={() => setActiveTab('anime')}
            className={`px-4 py-2 flex items-center gap-2 text-sm font-bold rounded-xl transition-colors ${activeTab === 'anime' ? 'bg-brand text-white shadow-glow' : 'text-gray-400 hover:text-white hover:bg-surface-chrome'}`}
          >
            <Film className="h-4 w-4" /> Anime
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 flex items-center gap-2 text-sm font-bold rounded-xl transition-colors ${activeTab === 'users' ? 'bg-brand text-white shadow-glow' : 'text-gray-400 hover:text-white hover:bg-surface-chrome'}`}
          >
            <Users className="h-4 w-4" /> Users
          </button>
          <button 
            onClick={() => setActiveTab('collections')}
            className={`px-4 py-2 flex items-center gap-2 text-sm font-bold rounded-xl transition-colors ${activeTab === 'collections' ? 'bg-brand text-white shadow-glow' : 'text-gray-400 hover:text-white hover:bg-surface-chrome'}`}
          >
            <FolderHeart className="h-4 w-4" /> Collections
          </button>
        </div>

        {/* Smart Filters Panel (Anime Only) */}
        {activeTab === 'anime' && normalizedQuery && (
          <div>
            <SmartFilterPanel
              filters={filters}
              onFilterChange={setFilters}
              onReset={() => setFilters({ genre: '', type: '', length: '', minScore: '' })}
            />
          </div>
        )}

        <div className="pt-2">
          {renderContent()}
        </div>
      </div>
    </>
  )
}
