import { Search } from 'lucide-react'

/**
 * Reusable SearchBar component styled according to AnimeLoom design language
 * @param {Object} props
 * @param {string} props.value
 * @param {function} props.onChange
 * @param {string} [props.placeholder='Search anime...']
 * @param {function} [props.onSearch]
 */
export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search anime...',
  onSearch,
  className = '',
  ...props
}) {
  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSearch) onSearch(value)
  }

  return (
    <form onSubmit={handleSubmit} className={`relative w-full ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-500 transition-colors duration-300" />
      </div>
      <input
        id="search-input"
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full pl-11 pr-4 py-3 bg-surface-chrome border border-white/5 rounded-lg text-white font-ui text-sm placeholder-gray-500 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand focus-visible:ring-2 focus-visible:ring-brand transition-all duration-300 shadow-inner"
        {...props}
      />
    </form>
  )
}
