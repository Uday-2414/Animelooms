import { Compass, Play, ArrowRight, Sparkles, Flame, Trophy, Newspaper, Users } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import SectionHeader from '../ui/SectionHeader'
import SearchBar from '../ui/SearchBar'
import Button from '../ui/Button'
import NewsCard from '../news/NewsCard'
import { NewsCardSkeleton } from '../ui/Skeleton'
import ActivityFeed from '../community/ActivityFeed'
import AnimeCarousel from '../anime/AnimeCarousel'

export default function NewUserDashboard({
  user,
  searchQuery,
  setSearchQuery,
  handleSearchSubmit,
  trending,
  popular,
  topAiring,
  news,
  loading,
  newsLoading,
}) {
  const navigate = useNavigate()

  const displayName = user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Anime Fan'

  return (
    <div className="space-y-12 pb-12 animate-fade-in">
      {/* Welcome Banner & Onboarding Intro */}
      <section className="relative rounded-3xl overflow-hidden bg-surface-chrome border border-white/5 shadow-2xl p-8 md:p-12">
        <div className="absolute inset-0 bg-gradient-to-r from-brand/20 via-brand/5 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 text-brand border border-brand/20 rounded-full text-xs font-bold uppercase tracking-wider font-ui">
            <Sparkles className="h-4 w-4 text-brand animate-pulse" />
            Welcome to AnimeLoom
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white font-logo leading-tight">
            Hello, {displayName}! 👋
          </h1>

          <p className="text-base md:text-lg text-gray-300 font-ui leading-relaxed">
            Your ultimate anime journey begins here! Discover trending titles, keep track of your episodes, create your custom watchlist, and explore top community rankings.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button
              variant="primary"
              size="lg"
              className="flex items-center gap-2 shadow-glow"
              onClick={() => navigate('/search')}
            >
              <Play className="h-5 w-5 fill-current" />
              Start discovering anime
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/rankings')}
            >
              View Top Rankings
            </Button>
          </div>

          <div className="pt-4 max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSearch={handleSearchSubmit}
              placeholder="Search anime database..."
            />
          </div>
        </div>
      </section>

      {/* Netflix-Style Top 10 Carousels */}
      <AnimeCarousel
        title="Trending Anime"
        subtitle="Top 10 performing series right now"
        items={trending}
        loading={loading}
        showRankBadges={true}
      />

      <AnimeCarousel
        title="Popular This Week"
        subtitle="Fan favorites across the community"
        items={popular}
        loading={loading}
        showRankBadges={false}
      />

      <AnimeCarousel
        title="Top Ranked Airing"
        subtitle="Highest rated series currently airing"
        items={topAiring}
        loading={loading}
        showRankBadges={true}
      />

      {/* Latest News */}
      <section className="space-y-6">
        <SectionHeader
          title="Latest News"
          subtitle="Fresh reports from the anime industry"
        />
        {newsLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NewsCardSkeleton />
            <NewsCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            {news.slice(0, 2).map((newsItem, index) => (
              <NewsCard key={index} news={newsItem} />
            ))}
          </div>
        )}
      </section>

      {/* Community Activity Feed */}
      <section className="space-y-6 pt-6 border-t border-white/5">
        <div className="flex items-center justify-between">
          <SectionHeader title="Community Activity" subtitle="See what everyone's watching right now" useLogoFont={false} />
          <Link to="/community" className="text-xs font-semibold text-brand hover:text-red-400 flex items-center gap-1 font-ui">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <ActivityFeed limit={8} emptyMessage="No community activity yet. Start by rating an anime!" />
      </section>
    </div>
  )
}
