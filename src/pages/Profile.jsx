import { useContext, useEffect, useMemo, useState } from 'react'
import { Bookmark, CheckCircle2, Clock, Eye, Search } from 'lucide-react'
import SectionHeader from '../components/ui/SectionHeader'
import ProfileCard from '../components/profile/ProfileCard'
import StatsCard from '../components/ui/StatsCard'
import AnimeCard from '../components/anime/AnimeCard'
import LoadingState from '../components/ui/LoadingState'
import EmptyState from '../components/ui/EmptyState'
import AuthContext from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'

function formatJoinDate(date) {
  if (!date) return null

  return new Intl.DateTimeFormat('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

function mapWatchlistAnime(item) {
  return {
    mal_id: item.anime_id,
    title: item.title,
    image_url: item.image_url,
    score: item.score,
  }
}

export default function Profile() {
  const { user, loading: authLoading } = useContext(AuthContext)
  const [watchlist, setWatchlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadProfileData() {
      if (authLoading) return

      if (!user) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(false)

      const { data, error: watchlistError } = await supabase
        .from('watchlist')
        .select('id, created_at, anime_id, title, image_url, score, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!isMounted) return

      if (watchlistError) {
        console.error('Unable to load profile watchlist:', watchlistError.message)
        setWatchlist([])
        setError(true)
      } else {
        setWatchlist(data || [])
      }

      setLoading(false)
    }

    loadProfileData()

    return () => {
      isMounted = false
    }
  }, [authLoading, user])

  const profileUser = useMemo(() => {
    const metadata = user?.user_metadata || {}
    const displayName =
      metadata.full_name ||
      metadata.name ||
      user?.email?.split('@')[0] ||
      'AnimeLoom User'

    return {
      name: displayName,
      email: user?.email || 'No email available',
      avatar_url: metadata.avatar_url || metadata.picture || null,
      joined_at: formatJoinDate(user?.created_at),
      role: 'Otaku Member',
    }
  }, [user])

  const stats = useMemo(
    () => ({
      total: watchlist.length,
      planToWatch: watchlist.filter((item) => item.status === 'plan_to_watch')
        .length,
      watching: watchlist.filter((item) => item.status === 'watching').length,
      completed: watchlist.filter((item) => item.status === 'completed').length,
    }),
    [watchlist]
  )

  const recentAnime = watchlist.slice(0, 5)

  const profileStats = (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <StatsCard
        label="Total Saved Anime"
        value={stats.total}
        icon={<Bookmark className="h-5 w-5" />}
        description="All titles in your collection"
      />
      <StatsCard
        label="Plan To Watch"
        value={stats.planToWatch}
        icon={<Clock className="h-5 w-5" />}
        description="Saved for later"
      />
      <StatsCard
        label="Watching"
        value={stats.watching}
        icon={<Eye className="h-5 w-5" />}
        description="Currently in progress"
      />
      <StatsCard
        label="Completed"
        value={stats.completed}
        icon={<CheckCircle2 className="h-5 w-5" />}
        description="Finished titles"
      />
    </div>
  )

  if (loading || authLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <SectionHeader
          title="My Profile"
          subtitle="Manage user configurations and review status analytics"
        />
        <LoadingState message="Loading profile dashboard..." />
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-fade-in">
      <SectionHeader
        title="My Profile"
        subtitle="Manage user configurations and review status analytics"
      />

      <div className="max-w-5xl mx-auto w-full">
        <ProfileCard user={profileUser} stats={profileStats} />
      </div>

      {error ? (
        <EmptyState
          icon={<Search className="h-10 w-10 text-gray-500" />}
          title="Profile data unavailable"
          description="We couldn't load your profile activity. Please try again later."
        />
      ) : watchlist.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="h-10 w-10 text-gray-500" />}
          title="Your anime journey starts here."
          description="Search and save anime to build your collection."
        />
      ) : (
        <section className="space-y-6">
          <SectionHeader
            title="Recent Activity"
            subtitle="Most recently added anime"
            useLogoFont={false}
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {recentAnime.map((item) => (
              <AnimeCard key={item.id} anime={mapWatchlistAnime(item)} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
