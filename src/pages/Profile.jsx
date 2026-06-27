import { useContext, useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Clock, Eye, Pause, XCircle, Activity, Flame, Trophy, Sparkles, Tag, Search, Bookmark, ExternalLink, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import SectionHeader from '../components/ui/SectionHeader'
import ProfileCard from '../components/profile/ProfileCard'
import StatsCard from '../components/ui/StatsCard'
import AnimeCard from '../components/anime/AnimeCard'
import LoadingState from '../components/ui/LoadingState'
import EmptyState from '../components/ui/EmptyState'
import SEO from '../components/seo/SEO'
import AuthContext from '../context/AuthContext'
import { useProgress } from '../context/ProgressContext'
import { progressService } from '../services/progressService'
import { recommendationService } from '../services/recommendationService'
import { reviewService } from '../services/reviewService'
import { profileService } from '../services/profileService'
import { achievementService } from '../services/achievementService'
import { badgeService } from '../services/badgeService'
import { trackGenrePreference } from '../services/analyticsService'
import { useGamification } from '../hooks/useGamification'
import DashboardGamificationPanel from '../components/gamification/DashboardGamificationPanel'
import ChallengesPanel from '../components/gamification/ChallengesPanel'
import AchievementsGrid from '../components/gamification/AchievementsGrid'
import BadgeDisplay from '../components/gamification/BadgeDisplay'

const STATUS_LABELS = {
  plan_to_watch: 'Plan To Watch',
  watching: 'Watching',
  completed: 'Completed',
  on_hold: 'On Hold',
  dropped: 'Dropped'
}

function formatJoinDate(date) {
  if (!date) return null
  return new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(date))
}

function mapProgressToAnimeCard(item) {
  return {
    mal_id: item.anime_id,
    title: item.anime_title,
    image_url: item.anime_image,
    score: null,
  }
}

export default function Profile() {
  const { user, loading: authLoading } = useContext(AuthContext)
  const { progressList, loading: progressLoading, error } = useProgress()

  const safeProgressList = useMemo(() => (Array.isArray(progressList) ? progressList : []), [progressList])
  const gamification = useGamification(user?.id)

  // Intelligence State
  const [favoriteGenres, setFavoriteGenres] = useState([])
  const [animePersonality, setAnimePersonality] = useState('Otaku Member')
  const [streak, setStreak] = useState({ current: 0, longest: 0 })
  const [reviewStats, setReviewStats] = useState({ count: 0, average: 0, highestRatedAnimeId: null })

  // Bio edit state
  const [bio, setBio] = useState('')
  const [bioEditing, setBioEditing] = useState(false)
  const [bioSaving, setBioSaving] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadAuxiliaryData() {
      if (authLoading || !user) return

      try {
        const revStats = await reviewService.getUserReviewStats(user.id)
        if (isMounted && revStats) setReviewStats(revStats)
        
        if (safeProgressList.length > 0) {
          const calculatedStreak = recommendationService.getWatchingStreak(safeProgressList)
          if (isMounted) setStreak(calculatedStreak)

          recommendationService.getFavoriteGenres(safeProgressList).then(async (genres) => {
            if (isMounted && Array.isArray(genres) && genres.length > 0) {
              setFavoriteGenres(genres)
              const personality = recommendationService.getAnimePersonality(genres)
              setAnimePersonality(personality)
              if (genres[0]) trackGenrePreference(genres[0])

              await achievementService.checkAndUnlock(user.id, {
                progressList: safeProgressList,
                reviewStats: revStats,
                streak: calculatedStreak
              })
              await badgeService.checkAndAwardBadges(user.id, {
                progressList: safeProgressList,
                reviewStats: revStats,
                genres,
                level: gamification.xp?.level || 1
              })
              if (gamification.refetchAll) gamification.refetchAll()
            }
          }).catch(e => console.warn('[Profile] Genre calculation error:', e))
        }
      } catch (err) {
        console.error('Error loading auxiliary profile data:', err)
      }
    }

    loadAuxiliaryData()

    return () => { isMounted = false }
  }, [authLoading, user, safeProgressList])

  useEffect(() => {
    if (!user) return
    profileService.ensureProfile(user.id, user.user_metadata || {}).then(p => {
      if (p?.bio) setBio(p.bio)
    }).catch(e => console.warn('[Profile] Profile fetch error:', e))
  }, [user])

  const handleSaveBio = async () => {
    if (!user) return
    setBioSaving(true)
    try {
      await profileService.upsertProfile(user.id, { bio: bio.trim(), avatar_url: user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null })
      setBioEditing(false)
    } catch (e) { console.error('[Profile] Bio save error:', e) } finally { setBioSaving(false) }
  }

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
      role: gamification.xp?.title || animePersonality,
    }
  }, [user, animePersonality, gamification.xp?.title])

  const stats = useMemo(() => {
    const total = safeProgressList.length
    const watching = safeProgressList.filter((item) => item?.status === 'watching').length
    const completed = safeProgressList.filter((item) => item?.status === 'completed').length
    const planToWatch = safeProgressList.filter((item) => item?.status === 'plan_to_watch').length
    const onHold = safeProgressList.filter((item) => item?.status === 'on_hold').length
    const dropped = safeProgressList.filter((item) => item?.status === 'dropped').length
    const totalEpisodesWatched = safeProgressList.reduce((acc, p) => acc + (p?.episodes_watched || 0), 0)
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      total,
      watching,
      completed,
      planToWatch,
      onHold,
      dropped,
      totalEpisodesWatched,
      completionRate
    }
  }, [safeProgressList])

  const recentAnime = safeProgressList.slice(0, 5)
  const personalInsights = useMemo(() => recommendationService.getPersonalInsights(safeProgressList), [safeProgressList])

  const profileStats = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard label="Total Tracked" value={stats.total} icon={<Activity className="h-5 w-5 text-indigo-400" />} className="border-indigo-500/10" />
        <StatsCard label="Watching" value={stats.watching} icon={<Eye className="h-5 w-5 text-emerald-400" />} className="border-emerald-500/10" />
        <StatsCard label="Completed" value={stats.completed} icon={<CheckCircle2 className="h-5 w-5 text-purple-400" />} className="border-purple-500/10" />
        <StatsCard label="Plan To Watch" value={stats.planToWatch} icon={<Clock className="h-5 w-5 text-blue-400" />} className="border-blue-500/10" />
        <StatsCard label="On Hold" value={stats.onHold} icon={<Pause className="h-5 w-5 text-yellow-400" />} className="border-yellow-500/10" />
        <StatsCard label="Dropped" value={stats.dropped} icon={<XCircle className="h-5 w-5 text-red-400" />} className="border-red-500/10" />
      </div>

      {/* AI Personal Insights Card */}
      <div className="bg-gradient-to-r from-brand/15 via-surface-card to-surface-chrome border border-brand/25 rounded-2xl p-5 shadow-glow space-y-3">
        <div className="flex items-center gap-2 text-brand font-bold text-xs uppercase tracking-wider font-ui">
          <Sparkles className="h-4 w-4 animate-pulse text-brand" />
          <span>AI Personal Viewing Insights</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-ui pt-1">
          <div className="bg-surface-chrome/40 p-3 rounded-xl border border-white/5">
            <span className="text-gray-400 font-semibold block">Format Preference</span>
            <span className="text-white font-bold text-sm">{personalInsights.epPreference}</span>
          </div>
          <div className="bg-surface-chrome/40 p-3 rounded-xl border border-white/5">
            <span className="text-gray-400 font-semibold block">Completion Rate</span>
            <span className="text-brand font-bold text-sm">{personalInsights.completionRate}% Completed</span>
          </div>
          <div className="bg-surface-chrome/40 p-3 rounded-xl border border-white/5">
            <span className="text-gray-400 font-semibold block">Viewing Persona</span>
            <span className="text-emerald-400 font-bold text-sm">{personalInsights.activeHabit}</span>
          </div>
        </div>
      </div>

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
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 font-ui">Longest</p>
            <p className="text-sm font-semibold text-white font-ui">{streak.longest} Days</p>
          </div>
        </div>

        <div className="bg-surface-chrome/40 border border-white/5 rounded-2xl p-5 flex items-center shadow-glow gap-4 overflow-hidden">
          <div className="p-3 bg-brand/10 rounded-xl border border-brand/20 flex-shrink-0">
            <Tag className="h-6 w-6 text-brand" />
          </div>
          <div className="flex-grow min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 font-ui mb-1">Top Genres</p>
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {favoriteGenres.length > 0 ? favoriteGenres.slice(0, 3).map(g => (
                <span key={g} className="px-2 py-1 bg-surface-card border border-white/5 rounded text-xs font-semibold text-gray-300 font-ui whitespace-nowrap">
                  {g}
                </span>
              )) : <span className="text-xs text-gray-500 font-ui">Not enough data</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (progressLoading || authLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <SectionHeader title="My Profile" subtitle="Manage user configurations and review status analytics" />
        <LoadingState message="Loading profile dashboard..." />
      </div>
    )
  }

  return (
    <>
      <SEO title="My Profile" description="View your AnimeLoom profile, level progress, and achievements." pathname="/profile" shouldIndex={false} noFollow={true} />
      <div className="space-y-10 animate-fade-in font-ui">
        <SectionHeader title="My Profile" subtitle="Manage user configurations and review status analytics" />

        {/* Gamification Progression Panel */}
        {user && (
          <DashboardGamificationPanel
            xp={gamification.xp?.levelInfo || gamification.xp}
            streak={streak.current}
            achievementsCount={(gamification.achievements?.unlocked || []).length}
            challenges={gamification.challenges?.challenges || []}
          />
        )}

        <div className="w-full">
          <ProfileCard user={profileUser} stats={profileStats} />
        </div>

        {/* Bio + Public Profile link row */}
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="flex-grow bg-surface-card border border-white/5 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Bio</p>
              {!bioEditing && <button onClick={() => setBioEditing(true)} className="text-xs text-brand hover:underline font-ui">Edit</button>}
            </div>
            {bioEditing ? (
              <div className="space-y-2">
                <textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={500} rows={3}
                  placeholder="Tell the community about yourself..."
                  className="w-full bg-surface-chrome border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-ui focus:outline-none focus:border-brand/50 resize-none placeholder:text-gray-600" />
                <div className="flex gap-2">
                  <button onClick={handleSaveBio} disabled={bioSaving} className="px-4 py-1.5 bg-brand text-white text-xs font-bold rounded-lg hover:bg-brand/90 transition-all disabled:opacity-50 font-ui">{bioSaving ? 'Saving...' : 'Save Bio'}</button>
                  <button onClick={() => setBioEditing(false)} className="px-4 py-1.5 text-gray-400 hover:text-white text-xs font-ui transition-colors">Cancel</button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 leading-relaxed">{bio || 'No bio yet. Click Edit to add one!'}</p>
            )}
          </div>
          {user && (
            <Link
              to={`/user/${user.id}`}
              className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-surface-card border border-white/10 hover:border-brand/30 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:text-brand"
            >
              <User className="h-4 w-4" />
              View Public Profile
              <ExternalLink className="h-3.5 w-3.5 text-gray-500" />
            </Link>
          )}
        </div>

        {/* Badges Display */}
        <section className="space-y-3">
          <SectionHeader title="Earned Badges" subtitle="Special designations & roles" useLogoFont={false} />
          <BadgeDisplay earnedBadges={gamification.badges?.badges || []} />
        </section>

        {/* Weekly Challenges Panel */}
        <section className="space-y-4">
          <ChallengesPanel challenges={gamification.challenges?.challenges || []} loading={gamification.challenges?.loading} />
        </section>

        {/* Achievements Engine Section */}
        <section className="space-y-4 pt-4 border-t border-white/5">
          <SectionHeader title="Achievements & Milestones" subtitle="All unlockable badges and progress" useLogoFont={false} />
          <AchievementsGrid achievements={gamification.achievements?.allAchievements || []} loading={gamification.achievements?.loading} />
        </section>

        {error ? (
          <EmptyState icon={<Search className="h-10 w-10 text-gray-500" />} title="Profile data unavailable" description="We couldn't load your tracking history." />
        ) : safeProgressList.length === 0 ? (
          <EmptyState icon={<Bookmark className="h-10 w-10 text-gray-500" />} title="No activity yet" description="Your anime journey starts here." />
        ) : (
          <section className="space-y-6 pt-4 border-t border-white/5">
            <SectionHeader title="Recent Activity" subtitle="Most recently updated tracked titles" useLogoFont={false} />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {recentAnime.map((item) => (
                <div key={item.id} className="space-y-2">
                  <AnimeCard anime={mapProgressToAnimeCard(item)} />
                  <div className="px-2 py-1 bg-surface-chrome/40 border border-white/5 rounded-lg flex justify-between items-center text-[10px] font-semibold text-gray-400">
                    <span className="truncate max-w-[80px]">{STATUS_LABELS[item.status]}</span>
                    <span className="text-brand">{item.episodes_watched}/{item.total_episodes || '?'} ep</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
