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
import { progressService } from '../services/progressService'
import { recommendationService } from '../services/recommendationService'
import { reviewService } from '../services/reviewService'
import { profileService } from '../services/profileService'
import { trackGenrePreference, trackAchievementUnlock } from '../services/analyticsService'


const STATUS_LABELS = {
  plan_to_watch: 'Plan To Watch',
  watching: 'Watching',
  completed: 'Completed',
  on_hold: 'On Hold',
  dropped: 'Dropped'
}

function formatJoinDate(date) {
  if (!date) return null

  return new Intl.DateTimeFormat('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

function mapProgressToAnimeCard(item) {
  return {
    mal_id: item.anime_id,
    title: item.anime_title,
    image_url: item.anime_image,
    score: null, // user_anime_progress doesn't store MAL score, which is fine
  }
}

export default function Profile() {
  const { user, loading: authLoading } = useContext(AuthContext)
  const [progressList, setProgressList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Intelligence State
  const [favoriteGenres, setFavoriteGenres] = useState([])
  const [animePersonality, setAnimePersonality] = useState('Otaku Member')
  const [streak, setStreak] = useState({ current: 0, longest: 0 })
  const [achievements, setAchievements] = useState([])
  const [reviewStats, setReviewStats] = useState({ count: 0, average: 0, highestRatedAnimeId: null })

  // Bio edit state
  const [bio, setBio] = useState('')
  const [bioEditing, setBioEditing] = useState(false)
  const [bioSaving, setBioSaving] = useState(false)

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

      try {
        const [data, revStats] = await Promise.all([
          progressService.getProgress(user.id),
          reviewService.getUserReviewStats(user.id)
        ])
        if (isMounted) {
          setProgressList(data || [])
          if (revStats) setReviewStats(revStats)
          
          if (data && data.length > 0) {
            // Calculate offline stats
            setStreak(recommendationService.getWatchingStreak(data))
            
            const earnedAchievements = recommendationService.getUserAchievements(data)
            setAchievements(earnedAchievements)
            // Track unlocks (in a real app we'd only track on newly unlocked, but doing it here for demo)
            earnedAchievements.forEach(ach => trackAchievementUnlock(ach.id, ach.title))

            // Fetch async intelligence
            recommendationService.getFavoriteGenres(data).then(genres => {
              if (isMounted && genres.length > 0) {
                setFavoriteGenres(genres)
                const personality = recommendationService.getAnimePersonality(genres)
                setAnimePersonality(personality)
                
                if (genres[0]) trackGenrePreference(genres[0])
              }
            })
          }
        }
      } catch (err) {
        console.error('Unable to load profile progress:', err)
        if (isMounted) {
          setProgressList([])
          setError(true)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadProfileData()

    return () => {
      isMounted = false
    }
  }, [authLoading, user])

  // Load bio from profile
  useEffect(() => {
    if (!user) return
    profileService.ensureProfile(user.id, user.user_metadata || {}).then(p => {
      if (p?.bio) setBio(p.bio)
    })
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
      role: animePersonality,
    }
  }, [user, animePersonality])

  const stats = useMemo(() => {
    return {
      total: progressList.length,
      watching: progressList.filter((item) => item.status === 'watching').length,
      completed: progressList.filter((item) => item.status === 'completed').length,
      planToWatch: progressList.filter((item) => item.status === 'plan_to_watch').length,
      onHold: progressList.filter((item) => item.status === 'on_hold').length,
      dropped: progressList.filter((item) => item.status === 'dropped').length,
    }
  }, [progressList])

  const recentAnime = progressList.slice(0, 5)

  // Visually rich grid displaying stats for all statuses
  const profileStats = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard
          label="Total Tracked"
          value={stats.total}
          icon={<Activity className="h-5 w-5 text-indigo-400" />}
          description="Total tracked titles"
          className="border-indigo-500/10 hover:border-indigo-500/20"
        />
        <StatsCard
          label="Watching"
          value={stats.watching}
          icon={<Eye className="h-5 w-5 text-emerald-400" />}
          description="Currently watching"
          className="border-emerald-500/10 hover:border-emerald-500/20"
        />
        <StatsCard
          label="Completed"
          value={stats.completed}
          icon={<CheckCircle2 className="h-5 w-5 text-purple-400" />}
          description="Finished shows"
          className="border-purple-500/10 hover:border-purple-500/20"
        />
        <StatsCard
          label="Plan To Watch"
          value={stats.planToWatch}
          icon={<Clock className="h-5 w-5 text-blue-400" />}
          description="Plan to watch next"
          className="border-blue-500/10 hover:border-blue-500/20"
        />
        <StatsCard
          label="On Hold"
          value={stats.onHold}
          icon={<Pause className="h-5 w-5 text-yellow-400" />}
          description="On temporary pause"
          className="border-yellow-500/10 hover:border-yellow-500/20"
        />
        <StatsCard
          label="Dropped"
          value={stats.dropped}
          icon={<XCircle className="h-5 w-5 text-red-400" />}
          description="Discontinued titles"
          className="border-red-500/10 hover:border-red-500/20"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Streak Card */}
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

        {/* Favorite Genres */}
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
               )) : (
                 <span className="text-xs text-gray-500 font-ui">Not enough data</span>
               )}
             </div>
           </div>
        </div>
      </div>

      {/* Review & Reputation Stats */}
      <div className="space-y-4">
        <SectionHeader title="Community Reputation" subtitle="Your contributions to AnimeLoom" useLogoFont={false} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-card border border-white/5 rounded-xl p-4 shadow-glow text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 font-ui">Reviews Written</p>
            <p className="text-2xl font-black text-white font-ui mt-1">{reviewStats.count}</p>
          </div>
          <div className="bg-surface-card border border-white/5 rounded-xl p-4 shadow-glow text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 font-ui">Average Rating Given</p>
            <p className="text-2xl font-black text-brand font-ui mt-1">
              {reviewStats.count > 0 ? reviewStats.average.toFixed(1) : 'N/A'}
            </p>
          </div>
          <div className="bg-surface-card border border-white/5 rounded-xl p-4 shadow-glow text-center flex flex-col justify-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 font-ui">Highest Rated Anime</p>
            <p className="text-sm font-semibold text-white font-ui mt-1 truncate">
              {reviewStats.highestRatedAnimeId ? (
                <a href={`/anime/${reviewStats.highestRatedAnimeId}`} className="hover:text-brand transition-colors">
                  View Anime #{reviewStats.highestRatedAnimeId}
                </a>
              ) : 'None yet'}
            </p>
          </div>
        </div>
      </div>
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
    <>
      <SEO
        title="My Profile"
        description="View your AnimeLoom profile and recent activity. Track counts for Completed, Watching, Plan to Watch, On Hold, and Dropped."
        pathname="/profile"
        shouldIndex={false}
        noFollow={true}
      />
      <div className="space-y-10 animate-fade-in">
        <SectionHeader
          title="My Profile"
          subtitle="Manage user configurations and review status analytics"
        />

        <div className="w-full">
          <ProfileCard user={profileUser} stats={profileStats} />
        </div>

        {/* Bio + Public Profile link row */}
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="flex-grow bg-surface-card border border-white/5 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 font-ui">Bio</p>
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
              <p className="text-sm text-gray-400 font-ui leading-relaxed">{bio || 'No bio yet. Click Edit to add one!'}</p>
            )}
          </div>
          {user && (
            <Link
              to={`/user/${user.id}`}
              className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-surface-card border border-white/10 hover:border-brand/30 rounded-xl text-sm font-semibold text-white font-ui transition-all duration-200 hover:text-brand"
            >
              <User className="h-4 w-4" />
              View Public Profile
              <ExternalLink className="h-3.5 w-3.5 text-gray-500" />
            </Link>
          )}
        </div>

        {error ? (
          <EmptyState
            icon={<Search className="h-10 w-10 text-gray-500" />}
            title="Profile data unavailable"
            description="We couldn't load your tracking history. Please try again later."
          />
        ) : progressList.length === 0 ? (
          <EmptyState
            icon={<Bookmark className="h-10 w-10 text-gray-500" />}
            title="No activity yet"
            description="Your anime journey starts here. Explore and add shows to track!"
          />
        ) : (
          <>
            <section className="space-y-6">
              <SectionHeader
                title="Recent Activity"
                subtitle="Most recently updated tracked titles"
                useLogoFont={false}
              />

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {recentAnime.map((item) => (
                  <div key={item.id} className="space-y-2">
                    <AnimeCard anime={mapProgressToAnimeCard(item)} />
                    <div className="px-2 py-1 bg-surface-chrome/40 border border-white/5 rounded-lg flex justify-between items-center text-[10px] font-semibold text-gray-400 font-ui">
                      <span className="truncate max-w-[80px]">{STATUS_LABELS[item.status]}</span>
                      <span className="text-brand">{item.episodes_watched}/{item.total_episodes || '?'} ep</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Achievements Section */}
            {achievements.length > 0 && (
              <section className="space-y-6 pt-6 border-t border-white/5">
                <SectionHeader
                  title="Achievements"
                  subtitle="Milestones unlocked in your anime journey"
                  useLogoFont={false}
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {achievements.map((ach) => (
                    <div key={ach.id} className="bg-surface-card border border-brand/20 hover:border-brand/40 transition-colors p-4 rounded-2xl flex flex-col items-center text-center space-y-2 shadow-glow group">
                      <div className="text-3xl bg-surface-chrome p-3 rounded-full border border-white/5 group-hover:scale-110 transition-transform duration-300">
                        {ach.icon}
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-white font-ui">{ach.title}</h5>
                        <p className="text-[10px] text-gray-400 font-ui mt-1 leading-tight">{ach.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </>
  )
}
