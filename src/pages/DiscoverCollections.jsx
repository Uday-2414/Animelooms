import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FolderHeart, TrendingUp, Sparkles, Filter } from 'lucide-react'
import SEO from '../components/seo/SEO'
import SectionHeader from '../components/ui/SectionHeader'
import LoadingState from '../components/ui/LoadingState'
import CollectionCard from '../components/collections/CollectionCard'
import { collectionService } from '../services/collectionService'

export default function DiscoverCollections() {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function load() {
      setLoading(true)
      try {
        const data = await collectionService.getDiscoverCollections(20, 'likes_count')
        if (isMounted) setCollections(data)
      } catch (err) {
        console.error('Failed to load collections:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    load()
    return () => { isMounted = false }
  }, [])

  return (
    <>
      <SEO
        title="Discover Collections"
        description="Explore custom anime collections curated by the AnimeLoom community."
        pathname="/discover/collections"
      />
      
      <div className="space-y-10 pb-12 animate-fade-in font-ui">
        {/* Header Hero */}
        <section className="relative rounded-3xl overflow-hidden bg-surface-chrome border border-white/5 shadow-2xl p-8 md:p-12">
          <div className="absolute inset-0 bg-gradient-to-r from-brand/20 via-brand/5 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 text-brand border border-brand/20 rounded-full text-xs font-bold uppercase tracking-wider">
              <FolderHeart className="h-4 w-4" />
              Community Curated
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white font-logo leading-tight">
              Discover Anime Collections
            </h1>
            <p className="text-base md:text-lg text-gray-300 leading-relaxed">
              Explore hand-picked lists created by anime fans. From "Hidden Gems" to "Weekend Binge", find exactly what you're in the mood for.
            </p>
          </div>
        </section>

        {loading ? (
          <div className="py-20"><LoadingState message="Loading collections..." /></div>
        ) : (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <SectionHeader title="Trending Collections" subtitle="Most liked community lists" useLogoFont={false} />
            </div>
            
            {collections.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {collections.map(col => (
                  <CollectionCard key={col.id} collection={col} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center space-y-4 border border-white/5 rounded-2xl bg-surface-chrome">
                <FolderHeart className="h-10 w-10 text-gray-600 mx-auto" />
                <h3 className="text-xl font-bold text-gray-300">No public collections yet</h3>
                <p className="text-sm text-gray-500">Be the first to create and share an anime collection!</p>
              </div>
            )}
          </section>
        )}
      </div>
    </>
  )
}
