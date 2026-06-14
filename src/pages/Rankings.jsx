import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import SectionHeader from '../components/ui/SectionHeader'
import AnimeCard from '../components/anime/AnimeCard'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'
import SEO from '../components/seo/SEO'
import { animeService } from '../services/animeService'
import { AnimeCardSkeleton } from '../components/ui/Skeleton'

const RANKING_SECTIONS = [
  {
    key: 'topAnime',
    title: 'Top Anime',
    subtitle: 'Highest-rated anime across global databases',
  },
  {
    key: 'topAiring',
    title: 'Top Airing Anime',
    subtitle: 'Currently broadcasting titles with strong scores',
  },
  {
    key: 'topMovies',
    title: 'Top Anime Movies',
    subtitle: 'Feature-length anime ranked by score',
  },
]

export default function Rankings() {
  const [rankings, setRankings] = useState({
    topAnime: [],
    topAiring: [],
    topMovies: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    async function loadRankings() {
      setLoading(true)
      setError(false)

      try {
        // Fetch sequentially to prevent Jikan API rate limit (3 requests/second) issues
        const topAnime = await animeService.getTopAnime({ signal: controller.signal })
        const topAiring = await animeService.getTopAiringAnime({ signal: controller.signal })
        const topMovies = await animeService.getTopMovies({ signal: controller.signal })

        if (!isMounted) return

        setRankings({
          topAnime,
          topAiring,
          topMovies,
        })
      } catch (err) {
        if (err.name === 'AbortError') return
        console.error('Unable to load rankings:', err)

        if (isMounted) {
          setError(true)
          setRankings({
            topAnime: [],
            topAiring: [],
            topMovies: [],
          })
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadRankings()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [refreshKey])

  const handleRetry = () => {
    setRefreshKey((prev) => prev + 1)
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <SectionHeader
          title="Global Rankings"
          subtitle="Top rated anime lists compiled by popularity, score, and favorites"
        />
        <div className="pt-8">
          <EmptyState
            icon={<Trophy className="h-10 w-10 text-brand" />}
            title="Anime rankings are temporarily unavailable"
            description="We encountered an issue loading the database rankings. Please try again."
            action={
              <Button variant="primary" onClick={handleRetry}>
                Retry Loading
              </Button>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <>
      <SEO
        title="Anime Rankings"
        description="Explore AnimeLoom's global rankings for top anime, top airing titles, and the best anime movies."
        pathname="/rankings"
      />
      <div className="space-y-12 animate-fade-in">
        <SectionHeader
          title="Global Rankings"
          subtitle="Top rated anime lists compiled by popularity, score, and favorites"
        />

        {loading ? (
          RANKING_SECTIONS.map((section) => (
            <section key={section.key} className="space-y-6">
              <SectionHeader
                title={section.title}
                subtitle={section.subtitle}
                useLogoFont={false}
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <AnimeCardSkeleton key={`${section.key}-skel-${idx}`} />
                ))}
              </div>
            </section>
          ))
        ) : (
          RANKING_SECTIONS.map((section) => {
            const animeList = rankings[section.key] || []

            if (animeList.length === 0) return null

            return (
              <section key={section.key} className="space-y-6 animate-fade-in">
                <SectionHeader
                  title={section.title}
                  subtitle={section.subtitle}
                  useLogoFont={false}
                />

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {animeList.map((anime) => (
                    <AnimeCard key={anime.mal_id} anime={anime} />
                  ))}
                </div>
              </section>
            )
          })
        )}
      </div>
    </>
  )
}
