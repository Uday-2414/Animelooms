import React, { useState } from 'react'
import { Filter, SlidersHorizontal, RotateCcw, Check, ChevronDown, ChevronUp } from 'lucide-react'

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 
  'Horror', 'Mystery', 'Psychological', 'Romance', 'Sci-Fi', 
  'Slice of Life', 'Sports', 'Supernatural', 'Thriller'
]

const FORMAT_TYPES = [
  { key: 'all', label: 'All Formats' },
  { key: 'tv', label: 'TV Series' },
  { key: 'movie', label: 'Movie' },
  { key: 'ova', label: 'OVA / Special' }
]

const LENGTH_OPTIONS = [
  { key: 'all', label: 'Any Length' },
  { key: 'short', label: 'Short (<=12 eps)' },
  { key: 'medium', label: 'Medium (13-24 eps)' },
  { key: 'long', label: 'Long (25+ eps)' }
]

export default function SmartFilterPanel({ filters, onFilterChange, onReset }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleGenreToggle = (genre) => {
    const current = filters.genre || ''
    onFilterChange({ ...filters, genre: current === genre ? '' : genre })
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="bg-surface-card border border-white/5 rounded-2xl p-4 shadow-md font-ui transition-all duration-300">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-sm font-bold text-white hover:text-brand transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="h-4 w-4 text-brand" />
          <span>Smart Browsing Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] bg-brand text-white rounded-full font-extrabold">
              {activeFilterCount} Active
            </span>
          )}
        </button>

        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer px-2 py-1 bg-surface-chrome rounded-lg"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-gray-400 hover:text-white cursor-pointer"
          >
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-white/5 space-y-5 animate-fade-in">
          {/* Genre Selection Chips */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Genre</label>
            <div className="flex flex-wrap gap-1.5">
              {GENRES.map(g => {
                const isSelected = filters.genre === g
                return (
                  <button
                    key={g}
                    onClick={() => handleGenreToggle(g)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-brand text-white shadow-glow font-bold'
                        : 'bg-surface-chrome/60 hover:bg-surface-chrome border border-white/5 text-gray-300'
                    }`}
                  >
                    {g}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {/* Format Type Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Format</label>
              <select
                value={filters.type || 'all'}
                onChange={(e) => onFilterChange({ ...filters, type: e.target.value === 'all' ? '' : e.target.value })}
                className="w-full bg-surface-chrome border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-ui focus:outline-none focus:border-brand cursor-pointer"
              >
                {FORMAT_TYPES.map(f => (
                  <option key={f.key} value={f.key}>{f.label}</option>
                ))}
              </select>
            </div>

            {/* Episode Length Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Episode Length</label>
              <select
                value={filters.length || 'all'}
                onChange={(e) => onFilterChange({ ...filters, length: e.target.value === 'all' ? '' : e.target.value })}
                className="w-full bg-surface-chrome border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-ui focus:outline-none focus:border-brand cursor-pointer"
              >
                {LENGTH_OPTIONS.map(l => (
                  <option key={l.key} value={l.key}>{l.label}</option>
                ))}
              </select>
            </div>

            {/* Minimum MAL Rating */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Minimum Rating</label>
              <select
                value={filters.minScore || 'any'}
                onChange={(e) => onFilterChange({ ...filters, minScore: e.target.value === 'any' ? '' : e.target.value })}
                className="w-full bg-surface-chrome border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-ui focus:outline-none focus:border-brand cursor-pointer"
              >
                <option value="any">Any Score</option>
                <option value="8.5">⭐ 8.5+ Masterpieces</option>
                <option value="8.0">⭐ 8.0+ Highly Rated</option>
                <option value="7.5">⭐ 7.5+ Good</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
