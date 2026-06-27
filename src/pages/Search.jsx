import { useEffect, useRef, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import SectionHeader from '../components/ui/SectionHeader'
import SearchBar from '../components/ui/SearchBar'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'
import AnimeCard from '../components/anime/AnimeCard'
import SEO from '../components/seo/SEO'
import { animeService } from '../services/animeService'
import { trackSearch, trackNaturalSearch } from '../services/analyticsService'
import { AnimeCardSkeleton } from '../components/ui/Skeleton'
import { Search as SearchIcon, Sparkles, History, Flame, Filter } from 'lucide-react'
import aiSearchService from '../services/aiSearchService'
import SmartFilterPanel from '../components/search/SmartFilterPanel'

const SEARCH_DEBOUNCE_MS = 500

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(() => searchParams.get('q') || '')
  const [filters, setFilters] = useState({ genre: '', type: '', length: '', minScore: '' })
  
  const [searchState, setSearchState] = useState({
    status: 'idle',
    query: '',
    results: [],
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
          results: [],
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
        const results = await animeService.searchAnime(searchTerm, { signal: controller.signal })

        if (latestSearchId.current !== searchId) return

        trackSearch(normalizedQuery)
        if (parsedIntent.detectedIntents.length > 0) {
          trackNaturalSearch(normalizedQuery, parsedIntent.detectedIntents.length)
        }

        setSearchState({
          status: 'success',
          query: normalizedQuery,
          results,
        })
      } catch (err) {
        if (err.name === 'AbortError') return
        console.error('Anime search failed:', err)

        if (latestSearchId.current !== searchId) return

        setSearchState({
          status: 'error',
          query: normalizedQuery,
          results: [],
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

  // Filter results based on Smart Filter Panel & AI Intent
  const filteredResults = useMemo(() => {
    let list = searchState.results

    // Apply Smart Filters
    if (filters.genre) {
      list = list.filter(item => item.genres && item.genres.includes(filters.genre))
    }
    if (filters.type) {
      list = list.filter(item => item.type && item.type.toLowerCase() === filters.type.toLowerCase())
    }
    if (filters.minScore) {
      const min = parseFloat(filters.minScore)
      list = list.filter(item => item.score && item.score >= min)
    }
    if (filters.length) {
      if (filters.length === 'short') list = list.filter(item => item.episodes && item.episodes <= 12)
      if (filters.length === 'medium') list = list.filter(item => item.episodes && item.episodes > 12 && item.episodes <= 24)
      if (filters.length === 'long') list = list.filter(item => item.episodes && item.episodes >= 25)
    }

    // Apply Natural Intent Filters
    if (parsedIntent.filters.maxEpisodes) {
      list = list.filter(item => item.episodes && item.episodes <= parsedIntent.filters.maxEpisodes)
    }
    if (parsedIntent.filters.genre && !filters.genre) {
      list = list.filter(item => item.genres && item.genres.includes(parsedIntent.filters.genre))
    }

    return list
  }, [searchState.results, filters, parsedIntent.filters])

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
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, idx) => (
            <AnimeCardSkeleton key={`search-skel-${idx}`} />
          ))}
        </div>
      )
    }

    if (searchState.status === 'error') {
      return (
        <EmptyState
          icon={<SearchIcon className="h-10 w-10 text-brand" />}
          title="Anime data is temporarily unavailable"
          description="We couldn't complete your search. Please try again."
          action={
            <Button variant="primary" onClick={handleRetry}>
              Retry Search
            </Button>
          }
        />
      )
    }

    if (filteredResults.length === 0) {
      return (
        <EmptyState
          icon={<SearchIcon className="h-10 w-10 text-gray-500" />}
          title="No matching anime found"
          description="Try relaxing your filters or typing a different keyword."
        />
      )
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-fade-in">
        {filteredResults.map((anime) => (
          <AnimeCard key={anime.mal_id} anime={anime} />
        ))}
      </div>
    )
  }

  return (
    <>
      <SEO
        title={normalizedQuery ? `Search results for ${normalizedQuery}` : 'Search Anime'}
        description="Search the AnimeLoom catalog using natural language queries, intent filters, and smart metadata discovery."
        pathname="/search"
      />
      <div className="space-y-6 animate-fade-in font-ui">
        <SectionHeader
          title="Natural Language & Smart Search"
          subtitle="Explore by title or try natural intent queries like 'Sad anime under 12 episodes'"
        />

        <div className="max-w-2xl mx-auto w-full space-y-4">
          <SearchBar
            value={query}
            onChange={handleQueryChange}
            onSearch={handleSearchSubmit}
            placeholder="Try 'Dark psychological thriller' or 'Short comedy anime'..."
          />

          {/* AI Intent Feedback Banner */}
          {parsedIntent.detectedIntents.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-brand/10 border border-brand/20 rounded-xl text-xs text-brand font-semibold animate-fade-in">
              <Sparkles className="h-4 w-4 flex-shrink-0 animate-pulse" />
              <span>AI Parsed Intent: {parsedIntent.detectedIntents.join(' • ')}</span>
            </div>
          )}
        </div>

        {/* Smart Filters Panel */}
        <div className="pt-2">
          <SmartFilterPanel
            filters={filters}
            onFilterChange={setFilters}
            onReset={() => setFilters({ genre: '', type: '', length: '', minScore: '' })}
          />
        </div>

        <div className="pt-4">
          {renderContent()}
        </div>
      </div>
    </>
  )
}
