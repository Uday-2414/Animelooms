import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import SectionHeader from '../components/ui/SectionHeader'
import SearchBar from '../components/ui/SearchBar'
import EmptyState from '../components/ui/EmptyState'
import LoadingState from '../components/ui/LoadingState'
import AnimeCard from '../components/anime/AnimeCard'
import { animeService } from '../services/animeService'
import { Search as SearchIcon } from 'lucide-react'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    const searchQuery = searchParams.get('q') || ''
    setQuery(searchQuery)

    if (!searchQuery.trim()) {
      setResults([])
      setError(null)
      setHasSearched(false)
      return
    }

    async function fetchResults() {
      setLoading(true)
      setError(null)
      setHasSearched(true)

      try {
        const data = await animeService.searchAnime(searchQuery)
        setResults(data)
      } catch (err) {
        setError(err.message || 'Search failed. Please try again.')
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [searchParams])

  const handleSearchSubmit = (value) => {
    const nextQuery = value.trim()
    setSearchParams(nextQuery ? { q: nextQuery } : {})
  }

  const renderContent = () => {
    if (loading) {
      return <LoadingState message="Searching anime titles..." />
    }

    if (error) {
      return (
        <EmptyState
          icon={<SearchIcon className="h-10 w-10 text-red-400" />}
          title="Search Error"
          description={error}
        />
      )
    }

    if (!hasSearched) {
      return (
        <EmptyState
          icon={<SearchIcon className="h-10 w-10 text-gray-500" />}
          title="Begin Your Query"
          description="Type keywords above to search anime by title, studio, characters, and genres."
        />
      )
    }

    if (results.length === 0) {
      return (
        <EmptyState
          icon={<SearchIcon className="h-10 w-10 text-gray-500" />}
          title="No Results Found"
          description={`We couldn't find any anime matching "${query}". Try another keyword.`}
        />
      )
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {results.map((anime) => (
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
          onChange={(e) => setQuery(e.target.value)}
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
