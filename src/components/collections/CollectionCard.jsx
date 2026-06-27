import React from 'react'
import { Link } from 'react-router-dom'
import { FolderHeart, Heart, Users, Calendar } from 'lucide-react'

export default function CollectionCard({ collection }) {
  if (!collection) return null

  const items = collection.items || []
  const coverImage = collection.cover_image || (items.length > 0 ? items[0].anime_image : null)
  const displayName = collection.profiles?.display_name || collection.profiles?.username || 'Unknown User'

  return (
    <Link 
      to={`/collections/${collection.id}`}
      className="group block relative overflow-hidden bg-surface-card border border-white/5 hover:border-brand/50 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-brand/20 font-ui"
    >
      {/* Cover Image Stack */}
      <div className="relative h-40 w-full bg-surface-chrome overflow-hidden">
        {coverImage ? (
          <img 
            src={coverImage} 
            alt={collection.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-chrome/80">
            <FolderHeart className="h-10 w-10 text-gray-500" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-1.5 text-xs font-bold bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
            <Heart className="h-3 w-3 text-red-400" />
            {collection.likes_count || 0}
          </div>
          <div className="text-xs font-bold bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
            {items.length} Anime
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2 bg-surface-card relative z-10">
        <h3 className="font-bold text-white text-base truncate group-hover:text-brand transition-colors">
          {collection.title}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="truncate">by {displayName}</span>
        </div>
      </div>
    </Link>
  )
}
