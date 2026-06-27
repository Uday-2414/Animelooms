import { useEffect, useState, useContext, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, Activity, Eye, CheckCircle2, Clock, XCircle, Pause, Tag, Flame, Star, Lock } from 'lucide-react'
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
  const [authUser, setAuthUser] = useState(null)
  const [progressList, setProgressList] = useState([])
  const [reviews, setReviews] = useState([])
  const [favoriteGenres, setFavoriteGenres] = useState([])
  const [animePersonality, setAnimePersonality] = useState('Otaku Member')
  const [streak, setStreak] = useState({ current: 0, longest: 0 })
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isPrivate, setIsPrivate] = useState(false)

  const isOwnProfile = currentUser?.id === userId

  useEffect(() => {
    if (!userId) return
    let isMounted = true

    async function load() {
      setLoading(true)
      try {
        // Fetch profile row
        const profileData = await profileService.getProfile(userId)

        if (!profileData) {
          // Bootstrap: fetch auth metadata to construct a minimal public view
          const { data: adminData } = await supabase.auth.admin?.getUserById?.(userId) || {}
          if (!isMounted) return
          // Profile doesn't exist yet — show a minimal view or not found
          setNotFound(true)
          setLoading(false)
          return
        }

        if (!profileData.is_public && currentUser?.id !== userId) {
          if (isMounted) { setIsPrivate(true); setLoading(false); }
          return
        }

        // Fetch additional data
        const [progressData, reviewData] = await Promise.all([
          progressService.getProgress(userId),
          reviewService.getUserReviews(userId, 6),
        ])

        if (!isMounted) return
        setProfile(profileData)
        setProgressList(progressData || [])
        setReviews(reviewData || [])

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

  // Also fetch auth user metadata for display name/avatar if profile exists
  useEffect(() => {
    if (!userId) return
    // We use the profiles join in reviewService — for display name we build it from profile + fallback
  }, [userId])

  const stats = useMemo(() => ({
    total: progressList.length,
    watching: progressList.filter(p => p.status === 'watching').length,
    completed: progressList.filter(p => p.status === 'completed').length,
    planToWatch: progressList.filter(p => p.status === 'plan_to_watch').length,
    onHold: progressList.filter(p => p.status === 'on_hold').length,
    dropped: progressList.filter(p => p.status === 'dropped').length,
  }), [progressList])

  const completedAnime = useMemo(() => progressList.filter(p => p.status === 'completed').slice(0, 8), [progressList])
  const watchingAnime = useMemo(() => progressList.filter(p => p.status === 'watching').slice(0, 5), [progressList])

  // Display name: from profile or fallback
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
        description={`View ${displayName}'s anime journey on AnimeLoom — stats, reviews, and favorites.`}
        pathname={`/user/${userId}`}
        shouldIndex={!!profile?.is_public}
      />
      <div className="space-y-10 pb-12 animate-fade-in">
        {/* Profile Banner */}
        <div className="bg-surface-card border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="h-32 bg-gradient-to-r from-brand to-brand/40 relative">
            <div className="absolute inset-0 bg-black/10" />
          </div>
          <div className="relative px-6 pb-6 flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16">
            <div className="w-28 h-28 rounded-2xl border-4 border-surface-card overflow-hidden flex-shrink-0 shadow-lg">
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            </div>
            <div className="flex-grow space-y-1 mb-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-white font-ui">{displayName}</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand/20 text-white border border-brand/30">
                  {animePersonality}
                </span>
                {isOwnProfile && (
                  <Link to="/profile" className="text-xs text-brand hover:underline font-ui">Edit Profile</Link>
                )}
              </div>
              {profile?.bio && <p className="text-sm text-gray-400 font-ui leading-relaxed max-w-lg">{profile.bio}</p>}
              {profile?.created_at && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-ui">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined {formatJoinDate(profile.created_at)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {stats.total > 0 && (
          <section className="space-y-4">
            <SectionHeader title="Anime Statistics" subtitle="Tracking overview" useLogoFont={false} />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              <StatsCard label="Total" value={stats.total} icon={<Activity className="h-4 w-4 text-indigo-400" />} className="border-indigo-500/10" />
              <StatsCard label="Watching" value={stats.watching} icon={<Eye className="h-4 w-4 text-emerald-400" />} className="border-emerald-500/10" />
              <StatsCard label="Completed" value={stats.completed} icon={<CheckCircle2 className="h-4 w-4 text-purple-400" />} className="border-purple-500/10" />
              <StatsCard label="Plan To Watch" value={stats.planToWatch} icon={<Clock className="h-4 w-4 text-blue-400" />} className="border-blue-500/10" />
              <StatsCard label="On Hold" value={stats.onHold} icon={<Pause className="h-4 w-4 text-yellow-400" />} className="border-yellow-500/10" />
              <StatsCard label="Dropped" value={stats.dropped} icon={<XCircle className="h-4 w-4 text-red-400" />} className="border-red-500/10" />
            </div>

            {/* Streak & Genres */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-surface-chrome/40 border border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-glow">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                    <Flame className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 font-ui">Watching Streak</p>
                    <h4 className="text-xl font-bold text-white font-ui">{streak.current} Days</h4>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 font-ui">Longest</p>
                  <p className="text-sm font-semibold text-white font-ui">{streak.longest} Days</p>
                </div>
              </div>
              <div className="bg-surface-chrome/40 border border-white/5 rounded-2xl p-5 flex items-center gap-4 shadow-glow">
                <div className="p-3 bg-brand/10 rounded-xl border border-brand/20 flex-shrink-0">
                  <Tag className="h-6 w-6 text-brand" />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 font-ui mb-1">Favorite Genres</p>
                  <div className="flex gap-2 flex-wrap">
                    {favoriteGenres.length > 0 ? favoriteGenres.slice(0, 4).map(g => (
                      <span key={g} className="px-2 py-1 bg-surface-card border border-white/5 rounded text-xs font-semibold text-gray-300 font-ui">{g}</span>
                    )) : <span className="text-xs text-gray-500 font-ui">Not enough data yet</span>}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

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

        {/* Activity Feed */}
        <section className="space-y-4">
          <SectionHeader title="Recent Activity" subtitle="Latest actions on AnimeLoom" useLogoFont={false} />
          <ActivityFeed limit={20} userId={userId} emptyMessage="No activity recorded yet." />
        </section>

        {/* Achievements Placeholder */}
        <section className="space-y-4">
          <SectionHeader title="Achievements" subtitle="Milestones and badges — coming soon" useLogoFont={false} />
          <div className="rounded-2xl border border-white/5 bg-surface-chrome/10 p-8 text-center">
            <p className="text-sm text-gray-500 font-ui">Achievements will be unlocked here in a future update. Keep watching!</p>
          </div>
        </section>
      </div>
    </>
  )
}
