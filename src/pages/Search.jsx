import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import SectionHeader from '../components/ui/SectionHeader'
import SearchBar from '../components/ui/SearchBar'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'
import AnimeCard from '../components/anime/AnimeCard'
import SEO from '../components/seo/SEO'
import { animeService } from '../services/animeService'
import { trackSearch } from '../services/analyticsService'
import { AnimeCardSkeleton } from '../components/ui/Skeleton'
import { Search as SearchIcon } from 'lucide-react'

const SEARCH_DEBOUNCE_MS = 500

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(() => searchParams.get('q') || '')
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
  const popularSearches = ['Demon Slayer', 'Jujutsu Kaisen', 'One Piece', 'Attack on Titan', 'Naruto']

  // Load initial data
  useEffect(() => {
    // Load recent searches
    try {
      const saved = localStorage.getItem('anime_recent_searches')
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 5))
      }
    } catch (e) {}

    // Load trending for suggestions
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
        const results = await animeService.searchAnime(normalizedQuery, { signal: controller.signal })

        if (latestSearchId.current !== searchId) return

        trackSearch(normalizedQuery)

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
  }, [normalizedQuery, refreshKey])

  const handleSearchSubmit = (value) => {
    const nextQuery = value.trim()
    
    if (nextQuery) {
      try {
        const saved = JSON.parse(localStorage.getItem('anime_recent_searches') || '[]')
        const updated = [nextQuery, ...saved.filter(q => q.toLowerCase() !== nextQuery.toLowerCase())].slice(0, 5)
        localStorage.setItem('anime_recent_searches', JSON.stringify(updated))
        setRecentSearches(updated)
      } catch (e) {}
    }

    setQuery(nextQuery)
    setSearchParams(nextQuery ? { q: nextQuery } : {})
  }

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion)
    setSearchParams({ q: suggestion })
    // We don't save to localStorage here to avoid duplication, or we can just let handleSearchSubmit do it if we passed it there, but here we just navigate directly.
  }

  const handleQueryChange = (event) => {
    setQuery(event.target.value)
  }

  const handleRetry = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const renderContent = () => {
    if (!normalizedQuery) {
      return (
        <div className="space-y-8 animate-fade-in">
          {recentSearches.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest font-ui">Recent Searches</h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term, i) => (
                  <button 
                    key={`recent-${i}`}
                    onClick={() => handleSuggestionClick(term)}
                    className="px-3 py-1.5 bg-surface-chrome border border-white/5 hover:border-brand/40 text-xs text-gray-300 font-semibold rounded-lg font-ui transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest font-ui">Popular Searches</h3>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term, i) => (
                <button 
                  key={`pop-${i}`}
                  onClick={() => handleSuggestionClick(term)}
                  className="px-3 py-1.5 bg-brand/10 border border-brand/20 hover:border-brand/50 text-xs text-brand font-semibold rounded-lg font-ui transition-colors cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {trending.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-white/5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest font-ui">Trending Right Now</h3>
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

    if (
      searchState.status === 'loading' ||
      searchState.query !== normalizedQuery
    ) {
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

    if (searchState.results.length === 0) {
      return (
        <EmptyState
          icon={<SearchIcon className="h-10 w-10 text-gray-500" />}
          title="No results found"
          description="Try searching with another title."
        />
      )
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-fade-in">
        {searchState.results.map((anime) => (
          <AnimeCard key={anime.mal_id} anime={anime} />
        ))}
      </div>
    )
  }

  return (
    <>
      <SEO
        title={normalizedQuery ? `Search results for ${normalizedQuery}` : 'Search Anime'}
        description="Search the AnimeLoom catalog for titles, studios, and characters. Find anime by keyword and explore detailed results."
        pathname="/search"
      />
      <div className="space-y-6 animate-fade-in">
        <SectionHeader
          title="Search Catalog"
          subtitle="Lookup databases by title, studios, genres, and characters"
        />

        <div className="max-w-2xl mx-auto w-full">
          <SearchBar
            value={query}
            onChange={handleQueryChange}
            onSearch={handleSearchSubmit}
            placeholder="Search for anime, characters, studios..."
          />
        </div>

        <div className="pt-8">
          {renderContent()}
        </div>
      </div>
    </>
  )
}
