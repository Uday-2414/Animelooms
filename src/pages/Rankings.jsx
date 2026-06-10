import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import SectionHeader from '../components/ui/SectionHeader'
import AnimeCard from '../components/anime/AnimeCard'
import LoadingState from '../components/ui/LoadingState'
import EmptyState from '../components/ui/EmptyState'
import { animeService } from '../services/animeService'

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

  useEffect(() => {
    let isMounted = true

    async function loadRankings() {
      setLoading(true)
      setError(false)

      try {
        const [topAnime, topAiring, topMovies] = await Promise.all([
          animeService.getTopAnime(),
          animeService.getTopAiringAnime(),
          animeService.getTopMovies(),
        ])

        if (!isMounted) return

        setRankings({
          topAnime,
          topAiring,
          topMovies,
        })
      } catch (err) {
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
    }
  }, [])

  const hasRankings = RANKING_SECTIONS.some(
    (section) => rankings[section.key].length > 0
  )

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <SectionHeader
          title="Global Rankings"
          subtitle="Top rated anime lists compiled by popularity, score, and favorites"
        />
        <LoadingState message="Loading anime rankings..." />
      </div>
    )
  }

  if (error || !hasRankings) {
    return (
      <div className="space-y-6 animate-fade-in">
        <SectionHeader
          title="Global Rankings"
          subtitle="Top rated anime lists compiled by popularity, score, and favorites"
        />
        <div className="pt-8">
          <EmptyState
            icon={<Trophy className="h-10 w-10 text-gray-500" />}
            title="No rankings available right now."
            description="Please check back again soon."
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12 animate-fade-in">
      <SectionHeader
        title="Global Rankings"
        subtitle="Top rated anime lists compiled by popularity, score, and favorites"
      />

      {RANKING_SECTIONS.map((section) => {
        const animeList = rankings[section.key]

        if (animeList.length === 0) return null

        return (
          <section key={section.key} className="space-y-6">
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
      })}
    </div>
  )
}
