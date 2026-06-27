import { useEffect, useState, useContext, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, Activity, Eye, CheckCircle2, Clock, XCircle, Pause, Tag, Flame, Star, Lock, Film, Award } from 'lucide-react'
import SEO from '../components/seo/SEO'
import SectionHeader from '../components/ui/SectionHeader'
import LoadingState from '../components/ui/LoadingState'
import StatsCard from '../components/ui/StatsCard'
import AnimeCard from '../components/anime/AnimeCard'
import ReviewCard from '../components/reviews/ReviewCard'
import ActivityFeed from '../components/community/ActivityFeed'
import AuthContext from '../context/AuthContext'
import { profileService } from '../services/profileService'
import { progressService } from '../services/progressService'
import { reviewService } from '../services/reviewService'
import { recommendationService } from '../services/recommendationService'
import { trackProfileViewed } from '../services/analyticsService'
import { supabase } from '../services/supabaseClient'
import { useGamification } from '../hooks/useGamification'
import XPBar from '../components/gamification/XPBar'
import LevelBadge from '../components/gamification/LevelBadge'
import AchievementsGrid from '../components/gamification/AchievementsGrid'
import BadgeDisplay from '../components/gamification/BadgeDisplay'

function formatJoinDate(date) {
  if (!date) return null
  return new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(date))
}

function mapProgressToCard(item) {
  return { mal_id: item.anime_id, title: item.anime_title, image_url: item.anime_image, score: null }
}

export default function UserProfile() {
  const { userId } = useParams()
  const { user: currentUser } = useContext(AuthContext)

  const [profile, setProfile] = useState(null)
  const [progressList, setProgressList] = useState([])
  const [reviews, setReviews] = useState([])
  const [reviewStats, setReviewStats] = useState({ count: 0, average: 0 })
  const [favoriteGenres, setFavoriteGenres] = useState([])
  const [animePersonality, setAnimePersonality] = useState('Otaku Member')
  const [streak, setStreak] = useState({ current: 0, longest: 0 })
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isPrivate, setIsPrivate] = useState(false)

  const gamification = useGamification(userId)
  const isOwnProfile = currentUser?.id === userId

  useEffect(() => {
    if (!userId) return
    let isMounted = true

    async function load() {
      setLoading(true)
      try {
        const profileData = await profileService.getProfile(userId)

        if (!profileData) {
          setNotFound(true)
          setLoading(false)
          return
        }

        if (!profileData.is_public && currentUser?.id !== userId) {
          if (isMounted) { setIsPrivate(true); setLoading(false); }
          return
        }

        const [progressData, reviewData, revStats] = await Promise.all([
          progressService.getProgress(userId),
          reviewService.getUserReviews(userId, 6),
          reviewService.getUserReviewStats(userId)
        ])

        if (!isMounted) return
        setProfile(profileData)
        setProgressList(progressData || [])
        setReviews(reviewData || [])
        if (revStats) setReviewStats(revStats)

        if (progressData && progressData.length > 0) {
          setStreak(recommendationService.getWatchingStreak(progressData))
          recommendationService.getFavoriteGenres(progressData).then(genres => {
            if (isMounted && genres.length > 0) {
              setFavoriteGenres(genres)
              setAnimePersonality(recommendationService.getAnimePersonality(genres))
            }
          })
        }

        trackProfileViewed(userId)
      } catch (err) {
        console.error('[UserProfile] Error loading profile:', err)
        if (isMounted) setNotFound(true)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    load()
    return () => { isMounted = false }
  }, [userId, currentUser])

  const stats = useMemo(() => {
    const totalEps = progressList.reduce((acc, p) => acc + (p.episodes_watched || 0), 0)
    const hoursWatched = Math.round((totalEps * 23) / 60)
    return {
      total: progressList.length,
      watching: progressList.filter(p => p.status === 'watching').length,
      completed: progressList.filter(p => p.status === 'completed').length,
      planToWatch: progressList.filter(p => p.status === 'plan_to_watch').length,
      onHold: progressList.filter(p => p.status === 'on_hold').length,
      dropped: progressList.filter(p => p.status === 'dropped').length,
      totalEps,
      hoursWatched
    }
  }, [progressList])

  const completedAnime = useMemo(() => progressList.filter(p => p.status === 'completed').slice(0, 8), [progressList])
  const watchingAnime = useMemo(() => progressList.filter(p => p.status === 'watching').slice(0, 5), [progressList])

  const displayName = profile?.username || `User ${userId?.slice(0, 6)}`
  const avatarUrl = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=1d2430&color=ffffff&size=128`

  if (loading) return <div className="py-20"><LoadingState message="Loading profile..." /></div>

  if (isPrivate) return (
    <div className="py-20 text-center space-y-4">
      <Lock className="h-12 w-12 text-gray-600 mx-auto" />
      <h2 className="text-xl font-bold text-white font-ui">This profile is private</h2>
      <p className="text-sm text-gray-400 font-ui">This user has set their profile to private.</p>
    </div>
  )

  if (notFound) return (
    <div className="py-20 text-center space-y-4">
      <h2 className="text-xl font-bold text-white font-ui">Profile not found</h2>
      <p className="text-sm text-gray-400 font-ui">This user hasn't set up their profile yet.</p>
      <Link to="/" className="inline-block text-brand hover:underline font-ui text-sm">Go Home</Link>
    </div>
  )

  return (
    <>
      <SEO
        title={`${displayName}'s Profile`}
        description={`View ${displayName}'s anime journey on AnimeLoom — stats, level, achievements, and reviews.`}
        pathname={`/user/${userId}`}
        shouldIndex={!!profile?.is_public}
      />
      <div className="space-y-10 pb-12 animate-fade-in font-ui">
        {/* Profile Banner */}
        <div className="bg-surface-card border border-white/5 rounded-3xl overflow-hidden shadow-xl">
          <div className="h-36 bg-gradient-to-r from-brand via-brand/60 to-surface-chrome relative">
            <div className="absolute inset-0 bg-black/20" />
          </div>
          <div className="relative px-6 pb-6 flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16">
            <div className="w-28 h-28 rounded-2xl border-4 border-surface-card overflow-hidden flex-shrink-0 shadow-lg bg-surface-card">
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            </div>
            <div className="flex-grow space-y-2 mb-1 w-full">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-white">{displayName}</h1>
                  <LevelBadge level={gamification.xp?.level || 1} title={gamification.xp?.title || animePersonality} />
                </div>
                {isOwnProfile && (
                  <Link to="/profile" className="text-xs text-brand hover:underline font-bold">Edit Profile</Link>
                )}
              </div>

              {profile?.bio && <p className="text-sm text-gray-300 leading-relaxed max-w-2xl">{profile.bio}</p>}
              
              <div className="flex items-center gap-4 text-xs text-gray-400 pt-1">
                {profile?.created_at && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Joined {formatJoinDate(profile.created_at)}
                  </div>
                )}
              </div>

              {/* XP Bar */}
              <div className="pt-2 max-w-xl">
                <XPBar
                  level={gamification.xp?.level || 1}
                  title={gamification.xp?.title || 'Anime Rookie'}
                  xpInCurrentLevel={gamification.xp?.xpInCurrentLevel || 0}
                  xpNeededForNextLevel={gamification.xp?.xpNeededForNextLevel || 100}
                  progressPercent={gamification.xp?.progressPercent || 0}
                  size="sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <section className="space-y-3">
          <SectionHeader title="Earned Badges" subtitle="Special designations & community roles" useLogoFont={false} />
          <BadgeDisplay earnedBadges={gamification.badges?.badges || []} />
        </section>

        {/* Extended Statistics */}
        <section className="space-y-4">
          <SectionHeader title="Anime Analytics & Statistics" subtitle="Detailed breakdown of watching activity" useLogoFont={false} />
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            <StatsCard label="Total" value={stats.total} icon={<Activity className="h-4 w-4 text-indigo-400" />} className="border-indigo-500/10 p-4" />
            <StatsCard label="Watching" value={stats.watching} icon={<Eye className="h-4 w-4 text-emerald-400" />} className="border-emerald-500/10 p-4" />
            <StatsCard label="Completed" value={stats.completed} icon={<CheckCircle2 className="h-4 w-4 text-purple-400" />} className="border-purple-500/10 p-4" />
            <StatsCard label="Plan To Watch" value={stats.planToWatch} icon={<Clock className="h-4 w-4 text-blue-400" />} className="border-blue-500/10 p-4" />
            <StatsCard label="On Hold" value={stats.onHold} icon={<Pause className="h-4 w-4 text-yellow-400" />} className="border-yellow-500/10 p-4" />
            <StatsCard label="Dropped" value={stats.dropped} icon={<XCircle className="h-4 w-4 text-red-400" />} className="border-red-500/10 p-4" />
            <StatsCard label="Episodes" value={stats.totalEps} icon={<Film className="h-4 w-4 text-pink-400" />} className="border-pink-500/10 p-4" />
            <StatsCard label="Hours Watched" value={`~${stats.hoursWatched}h`} icon={<Clock className="h-4 w-4 text-amber-400" />} className="border-amber-500/10 p-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface-chrome/40 border border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-glow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                  <Flame className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Watching Streak</p>
                  <h4 className="text-xl font-bold text-white">{streak.current} Days</h4>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-500">Longest</p>
                <p className="text-sm font-semibold text-white">{streak.longest} Days</p>
              </div>
            </div>

            <div className="bg-surface-chrome/40 border border-white/5 rounded-2xl p-5 flex items-center gap-4 shadow-glow">
              <div className="p-3 bg-brand/10 rounded-xl border border-brand/20 flex-shrink-0">
                <Tag className="h-6 w-6 text-brand" />
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Favorite Genres</p>
                <div className="flex gap-2 flex-wrap">
                  {favoriteGenres.length > 0 ? favoriteGenres.slice(0, 3).map(g => (
                    <span key={g} className="px-2 py-1 bg-surface-card border border-white/5 rounded text-xs font-semibold text-gray-300">{g}</span>
                  )) : <span className="text-xs text-gray-500">Not enough data</span>}
                </div>
              </div>
            </div>

            <div className="bg-surface-chrome/40 border border-white/5 rounded-2xl p-5 flex items-center gap-4 shadow-glow">
              <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20 flex-shrink-0">
                <Star className="h-6 w-6 text-yellow-400 fill-current" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Average Rating Given</p>
                <h4 className="text-xl font-bold text-white">{reviewStats.count > 0 ? reviewStats.average.toFixed(1) : 'N/A'} <span className="text-xs font-normal text-gray-500">/10</span></h4>
              </div>
            </div>
          </div>
        </section>

        {/* Achievements Engine Section */}
        <section className="space-y-4">
          <SectionHeader title="Achievements & Milestones" subtitle="Gamification progress and unlocks" useLogoFont={false} />
          <AchievementsGrid achievements={gamification.achievements?.allAchievements || []} loading={gamification.achievements?.loading} />
        </section>

        {/* Currently Watching */}
        {watchingAnime.length > 0 && (
          <section className="space-y-4">
            <SectionHeader title="Currently Watching" subtitle="In progress" useLogoFont={false} />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {watchingAnime.map(item => <AnimeCard key={item.id} anime={mapProgressToCard(item)} />)}
            </div>
          </section>
        )}

        {/* Completed Anime */}
        {completedAnime.length > 0 && (
          <section className="space-y-4">
            <SectionHeader title="Completed Anime" subtitle="Finished titles" useLogoFont={false} />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {completedAnime.map(item => <AnimeCard key={item.id} anime={mapProgressToCard(item)} />)}
            </div>
          </section>
        )}

        {/* Recent Reviews */}
        {reviews.length > 0 && (
          <section className="space-y-4">
            <SectionHeader title="Recent Reviews" subtitle={`${displayName}'s ratings and thoughts`} useLogoFont={false} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map(review => (
                <ReviewCard key={review.id} review={{ ...review, profiles: { full_name: displayName, avatar_url: profile?.avatar_url } }} currentUser={currentUser} onEdit={() => {}} onDelete={() => {}} />
              ))}
            </div>
          </section>
        )}

        {/* Activity Timeline */}
        <section className="space-y-4">
          <SectionHeader title="Activity Timeline" subtitle="Chronological log of activities" useLogoFont={false} />
          <ActivityFeed limit={20} userId={userId} emptyMessage="No activity recorded yet." />
        </section>
      </div>
    </>
  )
}
