import { Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import GenreBadge from './GenreBadge'

/**
 * Premium AnimeCard component matching Stitch design reference
 * @param {Object} props
 * @param {Object} props.anime - The anime data object
 * @param {string|number} props.anime.mal_id
 * @param {string} props.anime.title
 * @param {string} props.anime.image_url
 * @param {number} [props.anime.score]
 * @param {Array<string>} [props.anime.genres]
 * @param {string} [props.anime.type]
 */
export default function AnimeCard({
  anime,
  className = ''
}) {
  const { mal_id, title, image_url, score, genres = [], type } = anime

  return (
    <Link
      to={`/anime/${mal_id}`}
      aria-label={`View details for ${title}`}
      className={`group relative flex flex-col bg-surface-card rounded-2xl overflow-hidden border border-white/5 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) hover:-translate-y-2 hover:border-brand/20 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background-base w-full aspect-[2/3] ${className}`}
    >
      {/* Poster Image */}
      <img
        src={image_url}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
      />

      {/* Netflix-style gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background-base via-background-base/40 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-95" />

      {/* Card Content (Bottom-aligned) */}
      <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col justify-end gap-2 z-10">
        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
          {type && <GenreBadge name={type} color="yellow" />}
          {genres.slice(0, 1).map((genre) => (
            <GenreBadge key={genre} name={genre} />
          ))}
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-white font-ui line-clamp-2 leading-tight tracking-wide group-hover:text-brand transition-colors duration-300">
          {title}
        </h3>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-400 font-ui mt-0.5">
          {score ? (
            <div className="flex items-center gap-1 text-yellow-400 font-semibold">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span>{score.toFixed(1)}</span>
            </div>
          ) : (
            <span>N/A</span>
          )}
          <span className="text-[10px] uppercase tracking-wider text-gray-500">
            ID: #{mal_id}
          </span>
        </div>
      </div>
    </Link>
  )
}
