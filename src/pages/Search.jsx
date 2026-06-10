import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import SectionHeader from '../components/ui/SectionHeader'
import SearchBar from '../components/ui/SearchBar'
import EmptyState from '../components/ui/EmptyState'
import LoadingState from '../components/ui/LoadingState'
import AnimeCard from '../components/anime/AnimeCard'
import { animeService } from '../services/animeService'
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
  const latestSearchId = useRef(0)

  const normalizedQuery = query.trim()

  useEffect(() => {
    latestSearchId.current += 1
    const searchId = latestSearchId.current

    if (!normalizedQuery) {
      return undefined
    }

    const debounceId = setTimeout(async () => {
      setSearchState((current) => ({
        ...current,
        status: 'loading',
        query: normalizedQuery,
      }))

      try {
        const results = await animeService.searchAnime(normalizedQuery)

        if (latestSearchId.current !== searchId) return

        setSearchState({
          status: 'success',
          query: normalizedQuery,
          results,
        })
      } catch (err) {
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
    }
  }, [normalizedQuery])

  const handleSearchSubmit = (value) => {
    const nextQuery = value.trim()
    setQuery(nextQuery)
    setSearchParams(nextQuery ? { q: nextQuery } : {})
  }

  const handleQueryChange = (event) => {
    setQuery(event.target.value)
  }

  const renderContent = () => {
    if (!normalizedQuery) {
      return (
        <EmptyState
          icon={<SearchIcon className="h-10 w-10 text-gray-500" />}
          title="Start searching for your favorite anime."
          description="Search anime titles to discover your next watch."
        />
      )
    }

    if (
      searchState.status === 'loading' ||
      searchState.query !== normalizedQuery
    ) {
      return <LoadingState message="Searching anime titles..." />
    }

    if (searchState.status === 'error') {
      return (
        <EmptyState
          icon={<SearchIcon className="h-10 w-10 text-red-400" />}
          title="Search unavailable"
          description="We couldn't complete your search. Please try again."
        />
      )
    }

    if (searchState.results.length === 0) {
      return (
        <EmptyState
          icon={<SearchIcon className="h-10 w-10 text-gray-500" />}
          title="No anime found. Try another search."
          description="Try a different title or keyword."
        />
      )
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {searchState.results.map((anime) => (
          <AnimeCard key={anime.mal_id} anime={anime} />
        ))}
      </div>
    )
  }

  return (
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
  )
}
