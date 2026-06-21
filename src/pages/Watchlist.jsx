import { useContext, useEffect, useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Bookmark, Trash2, Plus, CheckCircle, Calendar, Film } from 'lucide-react'
import SectionHeader from '../components/ui/SectionHeader'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'
import SEO from '../components/seo/SEO'
import AuthContext from '../context/AuthContext'
import ProgressBar from '../components/ui/ProgressBar'
import { progressService } from '../services/progressService'
import {
  trackProgressUpdate,
  trackStatusChanged,
  trackAnimeCompleted,
  trackWatchlistRemove
} from '../services/analyticsService'
import { WatchlistCardSkeleton } from '../components/ui/Skeleton'

const PROGRESS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'watching', label: 'Watching' },
  { key: 'completed', label: 'Completed' },
  { key: 'plan_to_watch', label: 'Plan to Watch' },
  { key: 'on_hold', label: 'On Hold' },
  { key: 'dropped', label: 'Dropped' }
]

const STATUS_LABELS = {
  plan_to_watch: 'Plan To Watch',
  watching: 'Watching',
  completed: 'Completed',
  on_hold: 'On Hold',
  dropped: 'Dropped'
}

const STATUS_THEMES = {
  plan_to_watch: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  watching: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  completed: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  on_hold: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  dropped: 'bg-red-500/10 text-red-400 border border-red-500/20'
}

export default function Watchlist() {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [progressList, setProgressList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadProgress() {
      if (!user) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const data = await progressService.getProgress(user.id)
        if (isMounted) {
          setProgressList(data || [])
        }
      } catch (err) {
        console.error('[Watchlist] Load progress error:', err)
        if (isMounted) {
          setError('Unable to load your anime progress. Please try again.')
          setProgressList([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadProgress()

    return () => {
      isMounted = false
    }
  }, [user])

  // Filter progress items based on active tab
  const filteredList = useMemo(() => {
    if (activeTab === 'all') return progressList
    return progressList.filter((item) => item.status === activeTab)
  }, [progressList, activeTab])

  // Handlers
  const handleStatusChange = async (item, newStatus) => {
    if (!user) return
    setUpdatingId(item.id)
    setError(null)

    try {
      const oldStatus = item.status
      let episodesWatched = item.episodes_watched

      // Auto-fill episodes if completed
      if (newStatus === 'completed' && item.total_episodes > 0) {
        episodesWatched = item.total_episodes
      }

      const updated = await progressService.updateProgress(user.id, item.anime_id, {
        status: newStatus,
        episodes_watched: episodesWatched,
      })

      // Track analytics
      if (oldStatus !== newStatus) {
        trackStatusChanged(item.anime_id, item.anime_title, oldStatus, newStatus)
      }
      if (newStatus === 'completed' && oldStatus !== 'completed') {
        trackAnimeCompleted(item.anime_id, item.anime_title)
      }

      setProgressList((current) =>
        current.map((p) => (p.id === item.id ? updated : p))
      )
    } catch (err) {
      console.error('[Watchlist] Status update error:', err)
      setError('Unable to update progress status. Please try again.')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleQuickIncrement = async (item) => {
    if (!user) return
    setUpdatingId(item.id)
    setError(null)

    const nextEpisodes = item.episodes_watched + 1
    if (item.total_episodes > 0 && nextEpisodes > item.total_episodes) {
      setUpdatingId(null)
      return
    }

    try {
      const newStatus =
        item.total_episodes > 0 && nextEpisodes === item.total_episodes
          ? 'completed'
          : item.status

      const updated = await progressService.updateProgress(user.id, item.anime_id, {
        episodes_watched: nextEpisodes,
        status: newStatus,
      })

      // Track analytics
      trackProgressUpdate(item.anime_id, item.anime_title, nextEpisodes)
      if (newStatus === 'completed' && item.status !== 'completed') {
        trackAnimeCompleted(item.anime_id, item.anime_title)
      }

      setProgressList((current) =>
        current.map((p) => (p.id === item.id ? updated : p))
      )
    } catch (err) {
      console.error('[Watchlist] Quick increment error:', err)
      setError('Unable to update episodes. Please try again.')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleRemove = async (item) => {
    if (!user) return
    if (!window.confirm(`Are you sure you want to remove ${item.anime_title} from your progress tracker?`)) return

    setUpdatingId(item.id)
    setError(null)

    try {
      await progressService.deleteProgress(user.id, item.anime_id)
      
      // Track analytics
      trackWatchlistRemove(item.anime_id, item.anime_title, item.status)

      setProgressList((current) => current.filter((p) => p.id !== item.id))
    } catch (err) {
      console.error('[Watchlist] Delete progress error:', err)
      setError('Unable to remove anime. Please try again.')
    } finally {
      setUpdatingId(null)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <>
      <SEO
        title="My Anime List"
        description="Track your anime watching progress, list completed shows, plan what to watch next, and view statistics."
        pathname="/watchlist"
        shouldIndex={false}
        noFollow={true}
      />
      <div className="space-y-8 animate-fade-in">
        <SectionHeader
          title="My Anime List"
          subtitle="Track, filter, and update your anime progress in real-time"
        />

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200 font-ui" role="alert">
            {error}
          </div>
        )}

        {/* Dynamic Category Navigation Tabs */}
        <div className="flex border-b border-white/5 overflow-x-auto pb-px scrollbar-none gap-2">
          {PROGRESS_TABS.map((tab) => {
            const count = tab.key === 'all'
              ? progressList.length
              : progressList.filter((p) => p.status === tab.key).length

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-3 px-4 text-xs md:text-sm font-bold tracking-wide uppercase font-ui transition-all duration-300 border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'border-brand text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.label}
                <span className={`px-2 py-0.5 text-[10px] rounded-full font-extrabold ${
                  activeTab === tab.key
                    ? 'bg-brand/20 text-brand'
                    : 'bg-white/5 text-gray-500'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <WatchlistCardSkeleton key={`watchlist-skel-${idx}`} />
            ))}
          </div>
        ) : progressList.length === 0 ? (
          <div className="pt-8">
            <EmptyState
              icon={<Bookmark className="h-10 w-10 text-gray-500" />}
              title="Your tracking list is empty"
              description="Start tracking your favorite series and keep tabs on every episode."
              action={
                <Button variant="primary" onClick={() => navigate('/search')}>
                  Find Anime
                </Button>
              }
            />
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-12 text-center text-gray-500 font-ui">
            {activeTab === 'watching' && 'No anime currently being watched.'}
            {activeTab === 'completed' && 'No completed anime yet.'}
            {activeTab === 'plan_to_watch' && 'No anime planned to watch.'}
            {activeTab === 'on_hold' && 'No anime on hold.'}
            {activeTab === 'dropped' && 'No dropped anime.'}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredList.map((item) => {
              const isUpdating = updatingId === item.id
              const percentage = item.total_episodes > 0 
                ? Math.round((item.episodes_watched / item.total_episodes) * 100)
                : 0

              return (
                <div
                  key={item.id}
                  className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-surface-card border border-white/5 p-4 rounded-2xl hover:border-white/10 transition-all duration-300 hover:shadow-glow"
                >
                  {/* Poster Link */}
                  <Link
                    to={`/anime/${item.anime_id}`}
                    className="w-16 h-24 rounded-lg overflow-hidden flex-shrink-0 border border-white/5 shadow-md relative group"
                  >
                    <img
                      src={item.anime_image}
                      alt={item.anime_title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                      <Film className="h-5 w-5 text-white" />
                    </div>
                  </Link>

                  {/* Title & Status Info */}
                  <div className="flex-grow min-w-0 space-y-1">
                    <h4 className="text-base font-bold text-white font-ui hover:text-brand transition-colors duration-200 truncate">
                      <Link to={`/anime/${item.anime_id}`}>{item.anime_title}</Link>
                    </h4>
                    
                    <div className="flex items-center flex-wrap gap-2 text-xs text-gray-400 font-ui">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_THEMES[item.status]}`}>
                        {STATUS_LABELS[item.status]}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-gray-500" />
                        Updated {formatDate(item.updated_at)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="w-full md:w-60 flex-shrink-0 space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold font-ui">
                      <span className="text-gray-400">
                        Progress: {item.episodes_watched} / {item.total_episodes > 0 ? item.total_episodes : '?'} eps
                      </span>
                      {item.total_episodes > 0 && (
                        <span className="text-brand font-bold">{percentage}%</span>
                      )}
                    </div>
                    <ProgressBar value={item.episodes_watched} max={item.total_episodes || 0} showText={false} />
                  </div>

                  {/* Quick Controls */}
                  <div className="flex items-center gap-2 self-stretch md:self-auto justify-end flex-wrap md:flex-nowrap border-t border-white/5 pt-3 md:pt-0 md:border-0 w-full md:w-auto">
                    {/* Status Dropdown Quick Update */}
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item, e.target.value)}
                      disabled={isUpdating}
                      className="bg-surface-chrome border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white font-ui focus:outline-none focus:border-brand cursor-pointer"
                    >
                      {Object.entries(STATUS_LABELS).map(([k, label]) => (
                        <option key={k} value={k}>{label}</option>
                      ))}
                    </select>

                    {/* +1 Episode Quick Increment Button */}
                    <button
                      type="button"
                      disabled={isUpdating || (item.total_episodes > 0 && item.episodes_watched >= item.total_episodes)}
                      onClick={() => handleQuickIncrement(item)}
                      className="inline-flex items-center justify-center p-1.5 bg-brand hover:bg-brand/90 hover:scale-105 active:scale-95 text-white rounded-lg transition-all duration-300 disabled:opacity-40 disabled:scale-100 disabled:hover:bg-brand cursor-pointer"
                      title="Watched +1 Episode"
                    >
                      {item.total_episodes > 0 && item.episodes_watched + 1 === item.total_episodes ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </button>

                    {/* Remove Action */}
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleRemove(item)}
                      className="inline-flex items-center justify-center p-1.5 bg-surface-chrome hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-lg border border-white/5 hover:border-red-500/25 transition-all duration-350 disabled:opacity-40 cursor-pointer"
                      title="Remove Tracker"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
