import React, { useEffect, useState, useContext } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FolderHeart, Heart, Users, Lock, MoreVertical, Edit2, Trash2 } from 'lucide-react'
import SEO from '../components/seo/SEO'
import LoadingState from '../components/ui/LoadingState'
import AnimeCard from '../components/anime/AnimeCard'
import { collectionService } from '../services/collectionService'
import AuthContext from '../context/AuthContext'
import Button from '../components/ui/Button'
import ShareMenu from '../components/social/ShareMenu'

export default function CollectionDetails() {
  const { id } = useParams()
  const { user } = useContext(AuthContext)
  const [collection, setCollection] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let isMounted = true
    async function load() {
      setLoading(true)
      try {
        const data = await collectionService.getCollection(id)
        if (!data) {
          if (isMounted) setNotFound(true)
          return
        }
        if (isMounted) setCollection(data)
      } catch (err) {
        console.error('Failed to load collection:', err)
        if (isMounted) setNotFound(true)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    load()
    return () => { isMounted = false }
  }, [id])

  if (loading) return <div className="py-20"><LoadingState message="Loading collection..." /></div>

  if (notFound) return (
    <div className="py-20 text-center space-y-4 font-ui">
      <FolderHeart className="h-12 w-12 text-gray-600 mx-auto" />
      <h2 className="text-xl font-bold text-white">Collection Not Found</h2>
      <p className="text-sm text-gray-400">The collection may have been deleted or is private.</p>
      <Link to="/discover/collections" className="inline-block mt-4 text-brand hover:underline">
        Browse Collections
      </Link>
    </div>
  )

  const isOwner = user?.id === collection.user_id
  const displayName = collection.profiles?.display_name || collection.profiles?.username || 'Unknown User'
  const items = collection.items || []
  
  // Create a clean shareable URL
  const shareUrl = window.location.origin + `/collections/${id}`

  return (
    <>
      <SEO
        title={`${collection.title} - Anime Collection`}
        description={collection.description || `A custom anime collection by ${displayName}.`}
        pathname={`/collections/${id}`}
        shouldIndex={collection.is_public}
      />
      
      <div className="space-y-8 pb-12 animate-fade-in font-ui">
        {/* Collection Header */}
        <div className="bg-surface-card border border-white/5 rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-brand/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand/10 border border-brand/20 rounded-xl text-brand">
                  <FolderHeart className="h-5 w-5" />
                </div>
                {!collection.is_public && (
                  <span className="px-2.5 py-1 bg-surface-chrome border border-white/10 rounded-lg text-xs font-bold text-gray-400 flex items-center gap-1.5">
                    <Lock className="h-3 w-3" /> Private
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black text-white font-logo tracking-tight">
                {collection.title}
              </h1>
              
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Curated by</span>
                <Link to={`/user/${collection.user_id}`} className="flex items-center gap-2 font-bold text-white hover:text-brand transition-colors">
                  {collection.profiles?.avatar_url && (
                    <img src={collection.profiles.avatar_url} alt="" className="w-5 h-5 rounded-full" />
                  )}
                  {displayName}
                </Link>
              </div>

              {collection.description && (
                <p className="text-base text-gray-300 leading-relaxed max-w-2xl mt-4 border-l-2 border-white/10 pl-4 py-1">
                  {collection.description}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-start gap-3">
              <ShareMenu 
                title={collection.title}
                text={collection.description || `Check out ${displayName}'s anime collection on AnimeLoom!`}
                url={shareUrl}
              />
              
              {isOwner && (
                <Button variant="ghost" className="bg-surface-chrome border border-white/5">
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Collection Items Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Anime List <span className="text-xs px-2 py-0.5 bg-surface-chrome rounded-full text-gray-400">{items.length}</span>
            </h2>
          </div>
          
          {items.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {items.map(item => (
                <AnimeCard 
                  key={item.anime_id} 
                  anime={{ mal_id: item.anime_id, title: item.anime_title, image_url: item.anime_image, score: null }} 
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl bg-surface-chrome/30">
              <p className="text-gray-400">This collection is currently empty.</p>
              {isOwner && (
                <Link to="/search" className="inline-block mt-4 text-brand hover:underline font-bold text-sm">
                  Search for anime to add
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
