import { useContext, useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import SectionHeader from '../components/ui/SectionHeader'
import Button from '../components/ui/Button'
import GenreBadge from '../components/anime/GenreBadge'
import AnimeCard from '../components/anime/AnimeCard'
import { getAnimeById, getRelatedAnime as getMockRelatedAnime } from '../services/mockData'
import { animeService } from '../services/animeService'
import {
  trackAnimeView,
  trackProgressAdd,
  trackProgressUpdate,
  trackAnimeCompleted,
  trackStatusChanged,
  trackRecommendationClick
} from '../services/analyticsService'
import CommunityScore from '../components/reviews/CommunityScore'
import ReviewSection from '../components/reviews/ReviewSection'
import AuthContext from '../context/AuthContext'
import { progressService } from '../services/progressService'
import ProgressBar from '../components/ui/ProgressBar'
import SEO from '../components/seo/SEO'
import Breadcrumb from '../components/seo/Breadcrumb'
import { AnimeDetailsSkeleton } from '../components/ui/Skeleton'
import { ArrowLeft, Star, Calendar, Tv, Layers, BookmarkPlus, Film } from 'lucide-react'

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://animelooms.com'

export default function AnimeDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [anime, setAnime] = useState(null)
  const [related, setRelated] = useState([])
  const [topAnime, setTopAnime] = useState([])
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(null)
  const [progressLoading, setProgressLoading] = useState(true)
  const [progressActionLoading, setProgressActionLoading] = useState(false)
  const [progressMessage, setProgressMessage] = useState(null)
  
  const [localEpisodes, setLocalEpisodes] = useState(0)
  const [localStatus, setLocalStatus] = useState('plan_to_watch')

  const [error, setError] = useState(null)
  const [errorType, setErrorType] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let isMounted = true

    async function loadProgressStatus() {
      if (!user || !id) {
        if (isMounted) {
          setProgressLoading(false)
          setProgress(null)
          setLocalEpisodes(0)
          setLocalStatus('plan_to_watch')
        }
        return
      }

      if (isMounted) {
        setProgressLoading(true)
      }
      
      try {
        const data = await progressService.getProgressForAnime(user.id, id)
        if (isMounted) {
          setProgress(data)
          if (data) {
            setLocalEpisodes(data.episodes_watched)
            setLocalStatus(data.status)
          } else {
            setLocalEpisodes(0)
            setLocalStatus('plan_to_watch')
          }
        }
      } catch (err) {
        console.error('Unable to load progress status:', err)
      } finally {
        if (isMounted) {
          setProgressLoading(false)
        }
      }
    }

    loadProgressStatus()

    return () => {
      isMounted = false
    }
  }, [id, user])

  const isDirty = progress
    ? (progress.episodes_watched !== localEpisodes || progress.status !== localStatus)
    : false

  // Load top anime for internal linking (reuses cached data — no extra API call if already fetched)
  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    animeService.getTopAnime({ signal: controller.signal })
      .then((data) => {
        if (isMounted) setTopAnime(data)
      })
      .catch(() => {
        // Silently fail — this is a non-critical SEO enhancement
      })

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    async function loadAnimeDetails() {
      setLoading(true)
      setError(null)
      setErrorType(null)

      try {
        const apiAnime = await animeService.getAnimeDetails(id, { signal: controller.signal })
        const details = apiAnime || getAnimeById(id)

        if (!details) {
          setErrorType('not_found')
          throw new Error('This anime does not exist in our database.')
        }

        if (isMounted && details) {
          trackAnimeView({
            mal_id: details.mal_id,
            title: details.title,
            score: details.score,
          })
        }

        let relatedData = []
        try {
          relatedData = apiAnime
            ? await animeService.getRelatedAnime(id, { signal: controller.signal })
            : getMockRelatedAnime(details)
        } catch (relatedErr) {
          console.warn('[AnimeDetails] Failed to load related titles, falling back to mock related data:', relatedErr)
          relatedData = getMockRelatedAnime(details) || []
        }

        if (isMounted) {
          setAnime(details)
          setRelated(relatedData)
          setError(null)
          setErrorType(null)
        }
      } catch (err) {
        if (err.name === 'AbortError') return
        const fallbackAnime = getAnimeById(id)
        const errorMessage = err.message || 'Unable to load anime details.'
        
        // Distinguish between API failure and not found
        const isAPIFailure = 
          errorMessage.includes('temporarily') ||
          errorMessage.includes('unavailable') ||
          errorMessage.includes('experiencing') ||
          errorMessage.includes('Unable to load') ||
          errorMessage.includes('busy') ||
          err.cause !== undefined
        
        if (isMounted) {
          console.error('[AnimeDetails] Error loading anime:', {
            animeId: id,
            errorMessage,
            isAPIFailure,
            originalError: err
          })

          if (isAPIFailure && !fallbackAnime) {
            // API failed, no fallback data
            setErrorType('api_failure')
            setError('Anime data is temporarily unavailable.')
            setAnime(null)
            setRelated([])
          } else if (isAPIFailure && fallbackAnime) {
            // API failed but we have fallback data, show with warning
            setErrorType('api_failure_with_fallback')
            setError('Using cached data. Live data is temporarily unavailable.')
            setAnime(fallbackAnime)
            setRelated(getMockRelatedAnime(fallbackAnime))
          } else {
            // Anime not found
            setErrorType('not_found')
            setError(null)
            setAnime(null)
            setRelated([])
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadAnimeDetails()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [id, refreshKey])

  const handleRetry = () => {
    setRefreshKey((prev) => prev + 1)
  }

  if (loading) {
    return <AnimeDetailsSkeleton />
  }

  // API Failure - No data available
  if (errorType === 'api_failure' && !anime) {
    return (
      <div className="py-12 space-y-6">
        <button
          onClick={() => window.history.state && window.history.state.idx > 0 ? navigate(-1) : navigate('/')}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors duration-300 font-ui font-semibold cursor-pointer bg-transparent border-0 p-0"
        >
          <ArrowLeft className="h-4 w-4 text-brand" />
          Back to Previous
        </button>

        <div className="rounded-2xl border border-brand/20 bg-brand/5 p-6 text-center max-w-md mx-auto">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white font-ui mb-2">
                Anime data is temporarily unavailable
              </h2>
              <p className="text-sm text-gray-400 font-ui">
                Please try again in a few moments.
              </p>
            </div>
            <button
              onClick={handleRetry}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-brand hover:bg-brand/95 text-white text-sm font-semibold rounded-lg transition-all duration-300 shadow-[0_0_15px_rgba(192,57,43,0.3)] active:scale-95 cursor-pointer"
            >
              ↻ Retry Loading
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Anime not found
  if (errorType === 'not_found' || (!anime && !loading)) {
    return (
      <div className="py-12 space-y-6">
        <button
          onClick={() => window.history.state && window.history.state.idx > 0 ? navigate(-1) : navigate('/')}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors duration-300 font-ui font-semibold cursor-pointer bg-transparent border-0 p-0"
        >
          <ArrowLeft className="h-4 w-4 text-brand" />
          Back to Previous
        </button>

        <div className="rounded-2xl border border-brand/10 bg-surface-chrome p-6 text-center max-w-md mx-auto">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white font-ui mb-2">
                Anime not found
              </h2>
              <p className="text-sm text-gray-400 font-ui">
                This anime does not exist in our database. Try searching for another title.
              </p>
            </div>
            <Link
              to="/search"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-brand hover:bg-brand/95 text-white text-sm font-semibold rounded-lg transition-colors duration-300 shadow-[0_0_15px_rgba(192,57,43,0.3)]"
            >
              ← Back to Search
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!anime) {
    return null
  }

  const {
    mal_id,
    title,
    japanese_title,
    image_url,
    score,
    genres = [],
    type,
    episodes,
    status,
    release_year,
    synopsis,
    trailer_url
  } = anime

  const seoDescription = synopsis
    ? synopsis.length > 155
      ? `${synopsis.slice(0, 152)}...`
      : synopsis
    : `Discover ${title} on AnimeLoom — explore details, ratings, genres, and add it to your watchlist.`

  const seoKeywords = `${title}, anime ranking, anime details, anime watchlist, anime discovery`

  // Build anime structured data schema
  const animeSchema = {
    '@context': 'https://schema.org',
    '@type': type === 'TV' ? 'TVSeries' : 'CreativeWork',
    name: title,
    ...(synopsis ? { description: synopsis } : {}),
    ...(image_url ? { image: image_url } : {}),
    ...(genres.length > 0 ? { genre: genres } : {}),
    ...(score ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: score,
        bestRating: 10,
        worstRating: 1,
      },
    } : {}),
    url: `${SITE_URL}/anime/${mal_id}`,
  }

  const activeProgressMessage = progressMessage

  const handleAddToList = async (initialStatus = 'plan_to_watch') => {
    if (!user) {
      navigate('/login')
      return
    }
    setProgressActionLoading(true)
    setProgressMessage(null)

    try {
      const added = await progressService.addProgress(user.id, anime, initialStatus)
      setProgress(added)

      // Track analytics
      trackProgressAdd(mal_id, title, initialStatus)

      setProgressMessage({
        type: 'success',
        text: 'Added to your progress tracker!',
      })
    } catch (err) {
      console.error('Error adding to progress tracker:', err)
      setProgressMessage({
        type: 'error',
        text: 'Failed to add to list. Please try again.',
      })
    } finally {
      setProgressActionLoading(false)
    }
  }

  const handleStatusChange = (newStatus) => {
    setLocalStatus(newStatus)
    
    // Auto-fill episodes if marked completed
    if (newStatus === 'completed' && episodes > 0) {
      setLocalEpisodes(episodes)
    }
  }

  const incrementEpisode = () => {
    const nextVal = localEpisodes + 1
    if (episodes > 0 && nextVal > episodes) return
    setLocalEpisodes(nextVal)

    // Auto-complete if they hit max episodes
    if (episodes > 0 && nextVal === episodes) {
      setLocalStatus('completed')
    }
  }

  const decrementEpisode = () => {
    const nextVal = Math.max(0, localEpisodes - 1)
    setLocalEpisodes(nextVal)

    // If they decrement below max episodes, move Completed back to Watching
    if (localStatus === 'completed' && episodes > 0 && nextVal < episodes) {
      setLocalStatus('watching')
    }
  }

  const handleEpisodeInputChange = (e) => {
    const val = e.target.value
    if (val === '') {
      setLocalEpisodes(0)
      return
    }
    const num = parseInt(val, 10)
    if (isNaN(num)) return

    if (num < 0) return
    if (episodes > 0 && num > episodes) {
      setLocalEpisodes(episodes)
      setLocalStatus('completed')
      return
    }

    setLocalEpisodes(num)
    if (episodes > 0 && num === episodes) {
      setLocalStatus('completed')
    } else if (localStatus === 'completed' && episodes > 0 && num < episodes) {
      setLocalStatus('watching')
    }
  }

  const saveProgress = async () => {
    if (!user || !id) return
    setProgressActionLoading(true)
    setProgressMessage(null)

    try {
      const oldStatus = progress.status
      const oldEpisodes = progress.episodes_watched

      const updated = await progressService.updateProgress(user.id, id, {
        status: localStatus,
        episodes_watched: localEpisodes,
      })

      // Track analytics
      if (oldStatus !== localStatus) {
        trackStatusChanged(id, title, oldStatus, localStatus)
      }
      if (oldEpisodes !== localEpisodes) {
        trackProgressUpdate(id, title, localEpisodes)
      }
      if (localStatus === 'completed' && oldStatus !== 'completed') {
        trackAnimeCompleted(id, title)
      }

      setProgress(updated)
      setProgressMessage({
        type: 'success',
        text: 'Progress updated successfully!',
      })
    } catch (err) {
      console.error('Error saving progress:', err)
      setProgressMessage({
        type: 'error',
        text: 'Failed to update progress. Please try again.',
      })
    } finally {
      setProgressActionLoading(false)
    }
  }

  const handleRemoveFromList = async () => {
    if (!user || !id) return
    if (!window.confirm(`Are you sure you want to remove ${title} from your list?`)) return

    setProgressActionLoading(true)
    setProgressMessage(null)

    try {
      await progressService.deleteProgress(user.id, id)
      setProgress(null)
      setProgressMessage({
        type: 'success',
        text: 'Removed from your list.',
      })
    } catch (err) {
      console.error('Error removing progress:', err)
      setProgressMessage({
        type: 'error',
        text: 'Failed to remove from list. Please try again.',
      })
    } finally {
      setProgressActionLoading(false)
    }
  }

  return (
    <>
      <SEO
        title={title}
        description={seoDescription}
        pathname={`/anime/${mal_id}`}
        image={image_url}
        type="article"
        keywords={seoKeywords}
        schemas={[animeSchema]}
      />
      <div className="space-y-8 pb-12 animate-fade-in">
        <div>
          <button
            onClick={() => window.history.state && window.history.state.idx > 0 ? navigate(-1) : navigate('/')}
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors duration-300 font-ui font-semibold cursor-pointer bg-transparent border-0 p-0"
          >
            <ArrowLeft className="h-4 w-4 text-brand" />
            Back to Previous
          </button>
        </div>

        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Anime', href: '/search' },
            { label: title },
          ]}
        />

        {error && (
          <div className="rounded-2xl border border-brand/20 bg-brand/5 p-4 text-sm text-white font-ui" role="alert">
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
            <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
              <img
                src={image_url}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="bg-surface-card border border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-lg">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 font-ui">
                  MAL Score
                </span>
                <div className="flex items-center gap-1.5 text-2xl font-black text-white font-ui">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  {score ? score.toFixed(2) : 'N/A'}
                </div>
              </div>
              <div className="text-right space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 font-ui">
                  Media Format
                </span>
                <div className="text-lg font-bold text-white font-ui uppercase">
                  {type || 'TV'}
                </div>
              </div>
            </div>

            {/* Community Score Component */}
            <CommunityScore animeId={id} />
          </div>

          <div className="flex-grow space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white font-logo tracking-wide">
                {title}
              </h1>
              {japanese_title && (
                <p className="text-sm text-gray-400 font-ui font-semibold">
                  {japanese_title}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {genres.map((genre) => (
                <GenreBadge key={genre} name={genre} />
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-surface-chrome rounded-xl border border-white/5">
                  <Layers className="h-4 w-4 text-brand" />
                </div>
                <div className="font-ui">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Episodes</p>
                  <p className="text-sm font-semibold text-white">{episodes || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-surface-chrome rounded-xl border border-white/5">
                  <Tv className="h-4 w-4 text-brand" />
                </div>
                <div className="font-ui">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Status</p>
                  <p className="text-sm font-semibold text-white whitespace-nowrap">{status || 'Unknown'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-surface-chrome rounded-xl border border-white/5">
                  <Calendar className="h-4 w-4 text-brand" />
                </div>
                <div className="font-ui">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Released</p>
                  <p className="text-sm font-semibold text-white">{release_year || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-surface-chrome rounded-xl border border-white/5">
                  <Star className="h-4 w-4 text-brand" />
                </div>
                <div className="font-ui">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">MAL ID</p>
                  <p className="text-sm font-semibold text-white">#{mal_id}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 font-ui">
                Synopsis
              </h3>
              <p className="text-sm md:text-base text-gray-400 leading-relaxed font-ui">
                {synopsis}
              </p>
            </div>

            {/* Anime Progress Tracking Card */}
            <div className="bg-surface-card border border-white/5 rounded-2xl p-6 space-y-4 shadow-lg w-full max-w-md">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 font-ui flex items-center gap-2">
                <BookmarkPlus className="h-4 w-4 text-brand" />
                Tracker Progress
              </h3>

              {progressLoading ? (
                <div className="h-20 animate-pulse bg-surface-chrome rounded-xl" />
              ) : !progress ? (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-gray-400 font-ui">Track status, episodes watched, and complete series.</p>
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      className="flex-grow flex items-center justify-center gap-2"
                      onClick={() => handleAddToList('watching')}
                      disabled={progressActionLoading}
                    >
                      Start Watching
                    </Button>
                    <Button
                      variant="secondary"
                      className="flex-grow flex items-center justify-center gap-2"
                      onClick={() => handleAddToList('plan_to_watch')}
                      disabled={progressActionLoading}
                    >
                      Plan to Watch
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Status selection */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest font-ui">Status</label>
                    <select
                      value={localStatus}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={progressActionLoading}
                      className="w-full bg-surface-chrome border border-white/5 rounded-lg px-3 py-2 text-sm text-white font-ui focus:outline-none focus:border-brand cursor-pointer"
                    >
                      <option value="plan_to_watch">Plan To Watch</option>
                      <option value="watching">Watching</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                      <option value="dropped">Dropped</option>
                    </select>
                  </div>

                  {/* Episode counter */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest font-ui">Episodes Watched</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={decrementEpisode}
                        disabled={localEpisodes === 0 || progressActionLoading}
                        className="flex items-center justify-center h-9 w-9 bg-surface-chrome border border-white/5 hover:border-brand/40 text-white rounded-lg text-lg font-bold disabled:opacity-40 disabled:hover:border-white/5 cursor-pointer"
                      >
                        -
                      </button>

                      <input
                        type="text"
                        pattern="[0-9]*"
                        value={localEpisodes}
                        onChange={handleEpisodeInputChange}
                        disabled={progressActionLoading}
                        className="w-16 bg-surface-chrome border border-white/5 rounded-lg py-1.5 text-center text-sm text-white font-ui font-semibold focus:outline-none focus:border-brand"
                      />

                      <span className="text-sm text-gray-400 font-ui">
                        / {episodes || '?'}
                      </span>

                      <button
                        type="button"
                        onClick={incrementEpisode}
                        disabled={(episodes > 0 && localEpisodes >= episodes) || progressActionLoading}
                        className="flex items-center justify-center h-9 w-9 bg-surface-chrome border border-white/5 hover:border-brand/40 text-white rounded-lg text-lg font-bold disabled:opacity-40 disabled:hover:border-white/5 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Reusable ProgressBar */}
                  <ProgressBar value={localEpisodes} max={episodes || 0} showText={true} />

                  {/* Actions row */}
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="primary"
                      onClick={saveProgress}
                      disabled={progressActionLoading || !isDirty}
                      className="flex items-center gap-2"
                    >
                      {progressActionLoading ? 'Saving...' : 'Update Progress'}
                    </Button>

                    <button
                      type="button"
                      onClick={handleRemoveFromList}
                      disabled={progressActionLoading}
                      className="text-xs font-semibold text-red-400 hover:text-red-350 hover:underline transition-colors duration-200 bg-transparent border-0 cursor-pointer p-0 font-ui"
                    >
                      Remove from list
                    </button>
                  </div>
                </div>
              )}

              {activeProgressMessage && (
                <div
                  className={`rounded-xl border p-3.5 text-xs font-ui ${
                    activeProgressMessage.type === 'error'
                      ? 'border-red-500/20 bg-red-500/10 text-red-200'
                      : 'border-green-500/20 bg-green-500/10 text-green-200'
                  }`}
                >
                  {activeProgressMessage.text}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8 border-t border-white/5">
          <div className="lg:col-span-2 space-y-6">
            <SectionHeader
              title="Official Trailer"
              subtitle="Promotional media and teasers"
              useLogoFont={false}
            />
            {trailer_url ? (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/5 bg-surface-card shadow-lg">
                <iframe
                  src={trailer_url}
                  title={`${title} Trailer`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="w-full aspect-video rounded-2xl border border-white/5 bg-surface-card flex flex-col items-center justify-center text-center p-6">
                <Film className="h-10 w-10 text-gray-500 mb-2" />
                <p className="text-sm text-gray-400 font-ui">No official trailer available for this title.</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <SectionHeader
              title="You May Also Like"
              subtitle="Similar anime recommendations"
              useLogoFont={false}
            />
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-6">
              {related.slice(0, 4).map((relatedAnime) => (
                <div key={relatedAnime.mal_id} className="lg:flex lg:gap-4 items-start bg-surface-chrome/30 p-3 rounded-2xl border border-white/5 hover:border-brand/20 transition-all duration-300">
                  <div className="w-20 aspect-[2/3] rounded-lg overflow-hidden flex-shrink-0 mb-3 lg:mb-0 shadow-inner">
                    <img src={relatedAnime.image_url} alt={relatedAnime.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-2 lg:pt-1">
                    <h4 className="text-xs font-bold text-white font-ui line-clamp-2 hover:text-brand transition-colors duration-300">
                      <Link 
                        to={`/anime/${relatedAnime.mal_id}`} 
                        onClick={() => trackRecommendationClick(relatedAnime.mal_id, relatedAnime.title, 'anime_details_similar')}
                      >
                        {relatedAnime.title}
                      </Link>
                    </h4>
                    <div className="flex items-center gap-1 text-[10px] text-yellow-500 font-semibold font-ui">
                      <Star className="h-3 w-3 fill-current" />
                      {relatedAnime.score ? relatedAnime.score.toFixed(1) : 'N/A'}
                    </div>
                    <GenreBadge name={relatedAnime.genres?.[0] || 'Unknown'} className="text-[8px]" />
                  </div>
                </div>
              ))}
              {related.length === 0 && (
                <p className="text-xs text-gray-500 font-ui italic">No recommendations loaded.</p>
              )}
            </div>
          </div>
        </div>

        {/* Community Reviews */}
        <ReviewSection 
          animeId={id} 
          animeTitle={title} 
          currentUser={user} 
          onLoginPrompt={() => navigate('/login')} 
        />

        {/* Trending Anime — Internal Linking */}
        {topAnime.length > 0 && (
          <section className="space-y-6 pt-8 border-t border-white/5">
            <SectionHeader
              title="Trending Anime"
              subtitle="Popular titles gaining traction"
              useLogoFont={false}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {topAnime
                .filter((a) => a.mal_id !== Number(mal_id))
                .slice(0, 5)
                .map((anime) => (
                  <AnimeCard key={anime.mal_id} anime={anime} />
                ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
