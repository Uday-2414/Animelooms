import { Link } from 'react-router-dom'
import { Star, CheckCircle2, Eye, Plus, Clock, UserPlus } from 'lucide-react'

const ACTIVITY_LABELS = {
  rated: { verb: 'rated', icon: Star, color: 'text-yellow-400', iconClass: 'fill-current' },
  reviewed: { verb: 'reviewed', icon: Star, color: 'text-brand', iconClass: '' },
  completed: { verb: 'completed', icon: CheckCircle2, color: 'text-emerald-400', iconClass: '' },
  started_watching: { verb: 'started watching', icon: Eye, color: 'text-blue-400', iconClass: '' },
  added_to_list: { verb: 'added to list', icon: Plus, color: 'text-purple-400', iconClass: '' },
  created_collection: { verb: 'created a collection', icon: Plus, color: 'text-brand', iconClass: '' },
  updated_collection: { verb: 'updated collection', icon: Plus, color: 'text-gray-400', iconClass: '' },
  followed_user: { verb: 'started following', icon: UserPlus, color: 'text-blue-400', iconClass: '' },
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function ActivityItem({ item }) {
  if (!item) return null

  const config = ACTIVITY_LABELS[item.activity_type] || ACTIVITY_LABELS.added_to_list
  const Icon = config.icon

  const avatarUrl = item.profiles?.avatar_url ||
    `https://ui-avatars.com/api/?name=User&background=1d2430&color=ffffff&size=40`

  const displayName = item.profiles?.full_name || item.profiles?.display_name || item.profiles?.username || 'A user'
  const rating = item.metadata?.rating

  const renderTargetLink = () => {
    if (item.activity_type === 'followed_user' && item.reference_id) {
      return (
        <Link to={`/user/${item.reference_id}`} className="font-semibold text-white hover:text-brand transition-colors truncate">
          {item.metadata?.target_username || 'a user'}
        </Link>
      )
    }
    if (['created_collection', 'updated_collection'].includes(item.activity_type) && item.reference_id) {
      return (
        <Link to={`/collections/${item.reference_id}`} className="font-semibold text-white hover:text-brand transition-colors truncate">
          {item.metadata?.collection_title || 'a custom collection'}
        </Link>
      )
    }
    
    // Default: Anime Link
    return (
      <>
        <Link
          to={`/anime/${item.anime_id}`}
          className="font-semibold text-white hover:text-brand transition-colors truncate"
        >
          {item.anime_title}
        </Link>
        {rating && <span className="text-yellow-400 font-bold ml-1">{rating}/10</span>}
      </>
    )
  }

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-chrome/20 hover:bg-surface-chrome/40 border border-white/5 hover:border-white/10 transition-all duration-200 group">
      {/* Avatar */}
      <Link to={`/user/${item.user_id}`} className="flex-shrink-0">
        <img
          src={avatarUrl}
          alt={displayName}
          className="w-9 h-9 rounded-full border border-white/10 object-cover group-hover:border-brand/30 transition-colors"
        />
      </Link>

      <div className="flex-grow min-w-0 space-y-1">
        <p className="text-xs font-ui leading-relaxed text-gray-300">
          <Link to={`/user/${item.user_id}`} className="font-bold text-white hover:text-brand transition-colors">
            {displayName}
          </Link>
          {' '}
          <span className={`font-semibold ${config.color}`}>
            <Icon className={`inline h-3 w-3 mr-0.5 ${config.iconClass}`} />
            {config.verb}
          </span>
          {' '}
          {renderTargetLink()}
        </p>

        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-ui">
          <Clock className="h-2.5 w-2.5" />
          <span>{timeAgo(item.created_at)}</span>
        </div>
      </div>

      {/* Anime thumbnail (only if anime_image exists) */}
      {item.anime_image && (
        <Link to={`/anime/${item.anime_id}`} className="flex-shrink-0 w-8 aspect-[2/3] rounded overflow-hidden border border-white/5">
          <img src={item.anime_image} alt={item.anime_title} className="w-full h-full object-cover" />
        </Link>
      )}
    </div>
  )
}
