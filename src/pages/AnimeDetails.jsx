import { useContext, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import SectionHeader from '../components/ui/SectionHeader'
import Button from '../components/ui/Button'
import LoadingState from '../components/ui/LoadingState'
import GenreBadge from '../components/anime/GenreBadge'
import { getAnimeById, getRelatedAnime as getMockRelatedAnime } from '../services/mockData'
import { animeService } from '../services/animeService'
import AuthContext from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'
import { ArrowLeft, Star, Calendar, Tv, Layers, BookmarkPlus, BookmarkCheck, Film } from 'lucide-react'

export default function AnimeDetails() {
  const { id } = useParams()
  const { user } = useContext(AuthContext)
  const [anime, setAnime] = useState(null)
  const [related, setRelated] = useState([])
  const [watchlistItem, setWatchlistItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [watchlistLoading, setWatchlistLoading] = useState(false)
  const [watchlistMessage, setWatchlistMessage] = useState(null)
  const [error, setError] = useState(null)
  const [errorType, setErrorType] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadWatchlistStatus() {
      if (!user || !id) return

      const { data, error: watchlistError } = await supabase
        .from('watchlist')
        .select('id, anime_id, status')
        .eq('user_id', user.id)
        .eq('anime_id', Number(id))
        .maybeSingle()

      if (!isMounted) return

      if (watchlistError) {
        console.error('Unable to load watchlist status:', watchlistError.message)
        return
      }

      setWatchlistItem(data)
    }

    loadWatchlistStatus()

    return () => {
      isMounted = false
    }
  }, [id, user])

  useEffect(() => {
    let isMounted = true

    async function loadAnimeDetails() {
      setLoading(true)
      setError(null)
      setErrorType(null)

      try {
        const apiAnime = await animeService.getAnimeDetails(id)
        const details = apiAnime || getAnimeById(id)

        if (!details) {
          setErrorType('not_found')
          throw new Error('This anime does not exist in our database.')
        }

        const relatedData = apiAnime
          ? await animeService.getRelatedAnime(id)
          : getMockRelatedAnime(details)

        if (isMounted) {
          setAnime(details)
          setRelated(relatedData)
          setError(null)
          setErrorType(null)
        }
      } catch (err) {
        const fallbackAnime = getAnimeById(id)
        const errorMessage = err.message || 'Unable to load anime details.'
        
        // Distinguish between API failure and not found
        const isAPIFailure = 
          errorMessage.includes('temporarily') ||
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
            setError('Anime data is temporarily unavailable. Our data provider is currently experiencing issues. Please try again in a few minutes.')
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
    }
  }, [id])

  if (loading) {
    return <LoadingState message="Loading anime details..." />
  }

  // API Failure - No data available
  if (errorType === 'api_failure' && !anime) {
    return (
      <div className="py-12 space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors duration-300 font-ui font-semibold"
        >
          <ArrowLeft className="h-4 w-4 text-brand" />
          Back to Dashboard
        </Link>

        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-6 text-center max-w-md mx-auto">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-orange-300 font-ui mb-2">
                Anime data is temporarily unavailable
              </h2>
              <p className="text-sm text-orange-200 font-ui">
                Our data provider is currently experiencing issues. Please try again in a few minutes.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors duration-300"
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
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors duration-300 font-ui font-semibold"
        >
          <ArrowLeft className="h-4 w-4 text-brand" />
          Back to Dashboard
        </Link>

        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center max-w-md mx-auto">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-red-300 font-ui mb-2">
                Anime not found
              </h2>
              <p className="text-sm text-red-200 font-ui">
                This anime does not exist in our database. Try searching for another title.
              </p>
            </div>
            <Link
              to="/search"
              className="inline-flex items-center justify-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors duration-300"
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

  const isWatchlisted = Number(watchlistItem?.anime_id) === Number(mal_id)
  const activeWatchlistMessage =
    Number(watchlistMessage?.animeId) === Number(mal_id) ? watchlistMessage : null

  const handleAddToWatchlist = async () => {
    if (!user || !anime) return

    setWatchlistLoading(true)
    setWatchlistMessage(null)

    try {
      const { data: existingItem, error: existingError } = await supabase
        .from('watchlist')
        .select('id, anime_id, status')
        .eq('user_id', user.id)
        .eq('anime_id', mal_id)
        .maybeSingle()

      if (existingError) {
        throw existingError
      }

      if (existingItem) {
        setWatchlistItem(existingItem)
        setWatchlistMessage({
          animeId: mal_id,
          type: 'info',
          text: 'This anime is already in your watchlist.',
        })
        return
      }

      const { data: insertedItem, error: insertError } = await supabase
        .from('watchlist')
        .insert({
          user_id: user.id,
          anime_id: mal_id,
          title,
          image_url,
          score,
          status: 'plan_to_watch',
        })
        .select('id, anime_id, status')
        .single()

      if (insertError) {
        throw insertError
      }

      setWatchlistItem(insertedItem)
      setWatchlistMessage({
        animeId: mal_id,
        type: 'success',
        text: 'Added to your watchlist.',
      })
    } catch (err) {
      console.error('Unable to update watchlist:', err)
      setWatchlistMessage({
        animeId: mal_id,
        type: 'error',
        text: 'Unable to update your watchlist. Please try again.',
      })
    } finally {
      setWatchlistLoading(false)
    }
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors duration-300 font-ui font-semibold"
        >
          <ArrowLeft className="h-4 w-4 text-brand" />
          Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4 text-sm text-orange-200 font-ui">
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

          <div className="pt-4 flex flex-wrap gap-4">
            <Button
              variant={isWatchlisted ? 'secondary' : 'primary'}
              className="flex items-center gap-2"
              onClick={handleAddToWatchlist}
              disabled={watchlistLoading}
            >
              {isWatchlisted ? (
                <>
                  <BookmarkCheck className="h-4 w-4 text-green-400" />
                  In Watchlist
                </>
              ) : (
                <>
                  <BookmarkPlus className="h-4 w-4" />
                  Add to Watchlist
                </>
              )}
            </Button>
            <Button variant="secondary">
              Share Title
            </Button>
          </div>

          {activeWatchlistMessage && (
            <div
              className={`rounded-2xl border p-4 text-sm font-ui ${
                activeWatchlistMessage.type === 'error'
                  ? 'border-red-500/20 bg-red-500/10 text-red-200'
                  : 'border-white/10 bg-surface-card text-gray-300'
              }`}
            >
              {activeWatchlistMessage.text}
            </div>
          )}
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
            title="Related Titles"
            subtitle="You might also appreciate"
            useLogoFont={false}
          />
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-6">
            {related.slice(0, 2).map((relatedAnime) => (
              <div key={relatedAnime.mal_id} className="lg:flex lg:gap-4 items-start bg-surface-chrome/30 p-3 rounded-2xl border border-white/5 hover:border-brand/20 transition-all duration-300">
                <div className="w-20 aspect-[2/3] rounded-lg overflow-hidden flex-shrink-0 mb-3 lg:mb-0 shadow-inner">
                  <img src={relatedAnime.image_url} alt={relatedAnime.title} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-2 lg:pt-1">
                  <h4 className="text-xs font-bold text-white font-ui line-clamp-2 hover:text-brand transition-colors duration-300">
                    <Link to={`/anime/${relatedAnime.mal_id}`}>{relatedAnime.title}</Link>
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
    </div>
  )
}
