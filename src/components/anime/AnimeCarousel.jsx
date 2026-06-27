import React, { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import AnimeCard from './AnimeCard'
import { AnimeCardSkeleton } from '../ui/Skeleton'

export default function AnimeCarousel({ title, subtitle, items = [], loading = false, showRankBadges = false }) {
  const scrollRef = useRef(null)

  const scroll = (direction) => {
    if (!scrollRef.current) return
    const { scrollLeft, clientWidth } = scrollRef.current
    const scrollAmount = clientWidth * 0.75
    scrollRef.current.scrollTo({
      left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
      behavior: 'smooth'
    })
  }

  // Slice to top 10 items as required by Issue 1
  const carouselItems = items.slice(0, 10)

  return (
    <section className="space-y-4 font-ui">
      {(title || subtitle) && (
        <div className="flex items-center justify-between">
          <div>
            {title && <h3 className="text-xl md:text-2xl font-black text-white font-logo tracking-wide">{title}</h3>}
            {subtitle && <p className="text-xs md:text-sm text-gray-400 mt-0.5">{subtitle}</p>}
          </div>

          {!loading && carouselItems.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                className="p-2 rounded-xl bg-surface-card border border-white/5 hover:border-white/20 text-gray-400 hover:text-white transition-all duration-200 active:scale-95 shadow-md cursor-pointer"
                aria-label="Scroll Left"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="p-2 rounded-xl bg-surface-card border border-white/5 hover:border-white/20 text-gray-400 hover:text-white transition-all duration-200 active:scale-95 shadow-md cursor-pointer"
                aria-label="Scroll Right"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Carousel Scroll Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 md:gap-6 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth hide-scrollbar snap-x snap-mandatory"
      >
        {loading ? (
          Array.from({ length: 5 }).map((_, idx) => (
            <div key={`carousel-skel-${idx}`} className="flex-shrink-0 w-44 md:w-52 snap-start">
              <AnimeCardSkeleton />
            </div>
          ))
        ) : carouselItems.length === 0 ? (
          <div className="w-full py-8 text-center text-sm text-gray-500 bg-surface-chrome/20 border border-white/5 rounded-2xl">
            No anime titles available right now.
          </div>
        ) : (
          carouselItems.map((anime, index) => (
            <div key={anime.mal_id || index} className="flex-shrink-0 w-44 md:w-52 snap-start relative group">
              {showRankBadges && (
                <div className="absolute top-2 left-2 z-20 w-8 h-8 rounded-xl bg-brand text-white font-black text-sm flex items-center justify-center shadow-glow border border-white/20">
                  #{index + 1}
                </div>
              )}
              <AnimeCard anime={anime} />
            </div>
          ))
        )}
      </div>
    </section>
  )
}
