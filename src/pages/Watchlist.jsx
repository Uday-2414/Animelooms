import { useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bookmark, Trash2 } from 'lucide-react'
import SectionHeader from '../components/ui/SectionHeader'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'
import AnimeCard from '../components/anime/AnimeCard'
import SEO from '../components/seo/SEO'
import AuthContext from '../context/AuthContext'
import { logApiError } from '../services/errorLogger'
import { trackWatchlistRemove } from '../services/analyticsService'
import { supabase } from '../services/supabaseClient'
import { WatchlistCardSkeleton } from '../components/ui/Skeleton'

const WATCHLIST_SECTIONS = [
  {
    status: 'plan_to_watch',
    title: 'Plan To Watch',
    subtitle: 'Titles saved for later',
  },
  {
    status: 'watching',
    title: 'Watching',
    subtitle: 'Currently in progress',
  },
  {
    status: 'completed',
    title: 'Completed',
    subtitle: 'Finished titles',
  },
]

const STATUS_LABELS = {
  plan_to_watch: 'Plan To Watch',
  watching: 'Watching',
  completed: 'Completed',
}

function mapWatchlistItem(item) {
  return {
    mal_id: item.anime_id,
    title: item.title,
    image_url: item.image_url,
    score: item.score,
  }
}

export default function Watchlist() {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [watchlist, setWatchlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadWatchlist() {
      if (!user) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      const { data, error: watchlistError } = await supabase
        .from('watchlist')
        .select('id, created_at, anime_id, title, image_url, score, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!isMounted) return

      if (watchlistError) {
        setError('Unable to load your watchlist. Please try again.')
        setWatchlist([])
      } else {
        setWatchlist(data || [])
      }

      setLoading(false)
    }

    loadWatchlist()

    return () => {
      isMounted = false
    }
  }, [user])

  const groupedWatchlist = useMemo(
    () =>
      WATCHLIST_SECTIONS.reduce((groups, section) => {
        groups[section.status] = watchlist.filter(
          (item) => item.status === section.status
        )
        return groups
      }, {}),
    [watchlist]
  )

  const updateStatus = async (itemId, status) => {
    setUpdatingId(itemId)
    setError(null)

    const { error: updateError } = await supabase
      .from('watchlist')
      .update({ status })
      .eq('id', itemId)
      .eq('user_id', user.id)

    if (updateError) {
      setError('Unable to update watchlist status. Please try again.')
    } else {
      setWatchlist((current) =>
        current.map((item) =>
          item.id === itemId ? { ...item, status } : item
        )
      )
    }

    setUpdatingId(null)
  }

  const removeAnime = async (itemId) => {
    setUpdatingId(itemId)
    setError(null)

    const { error: deleteError } = await supabase
      .from('watchlist')
      .delete()
      .eq('id', itemId)
      .eq('user_id', user.id)

    if (deleteError) {
      setError('Unable to remove anime. Please try again.')
      logApiError(deleteError, 'Supabase', 'watchlist.delete')
    } else {
      const removedItem = watchlist.find((item) => item.id === itemId)
      if (removedItem) {
        trackWatchlistRemove(removedItem.anime_id, removedItem.title, removedItem.status)
      }
      setWatchlist((current) => current.filter((item) => item.id !== itemId))
    }

    setUpdatingId(null)
  }

  return (
    <>
      <SEO
        title="My Watchlist"
        description="View and manage your saved anime watchlist with AnimeLoom. Keep track of what you plan to watch, are currently watching, and completed."
        pathname="/watchlist"
        shouldIndex={false}
        noFollow={true}
      />
      <div className="space-y-10 animate-fade-in">
        <SectionHeader
          title="My Watchlist"
          subtitle="Track, filter, and organize titles you are watching"
        />

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200 font-ui" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: 5 }).map((_, idx) => (
              <WatchlistCardSkeleton key={`watchlist-skel-${idx}`} />
            ))}
          </div>
        ) : watchlist.length === 0 ? (
          <div className="pt-8">
            <EmptyState
              icon={<Bookmark className="h-10 w-10 text-gray-500" />}
              title="Your watchlist is empty"
              description="Start discovering anime and build your collection."
              action={
                <Button variant="primary" onClick={() => navigate('/search')}>
                  Explore Anime
                </Button>
              }
            />
          </div>
        ) : (
          WATCHLIST_SECTIONS.map((section) => {
            const sectionItems = groupedWatchlist[section.status] || []

            return (
              <section key={section.status} className="space-y-6">
                <div className="space-y-1 border-b border-white/5 pb-4">
                  <h3 className="text-xl font-bold tracking-wide text-white font-ui">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-400 font-ui">
                    {section.subtitle}
                  </p>
                </div>

                {sectionItems.length === 0 ? (
                  <div className="rounded-2xl border border-white/5 bg-surface-chrome/30 px-5 py-6 text-sm text-gray-500 font-ui">
                    No titles in this section.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {sectionItems.map((item) => (
                      <div key={item.id} className="space-y-3">
                        <AnimeCard anime={mapWatchlistItem(item)} />

                        <div className="space-y-2">
                          <div className="grid grid-cols-1 gap-2">
                            {WATCHLIST_SECTIONS.map((statusOption) => (
                              <Button
                                key={statusOption.status}
                                type="button"
                                size="sm"
                                fullWidth
                                variant={
                                  item.status === statusOption.status
                                    ? 'primary'
                                    : 'secondary'
                                }
                                disabled={updatingId === item.id}
                                onClick={() =>
                                  updateStatus(item.id, statusOption.status)
                                }
                              >
                                {STATUS_LABELS[statusOption.status]}
                              </Button>
                            ))}
                          </div>

                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            fullWidth
                            className="gap-2 text-red-300 hover:text-red-200"
                            disabled={updatingId === item.id}
                            onClick={() => removeAnime(item.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )
          })
        )}
      </div>
    </>
  )
}
