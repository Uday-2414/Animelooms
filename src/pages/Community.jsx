import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { Users, Zap } from 'lucide-react'
import SEO from '../components/seo/SEO'
import SectionHeader from '../components/ui/SectionHeader'
import ActivityFeed from '../components/community/ActivityFeed'
import AuthContext from '../context/AuthContext'
import { trackActivityViewed } from '../services/analyticsService'
import { useEffect } from 'react'

export default function Community() {
  const { user } = useContext(AuthContext)

  useEffect(() => {
    trackActivityViewed('community_page')
  }, [])

  return (
    <>
      <SEO
        title="Community"
        description="See what the AnimeLoom community is watching, rating, and reviewing right now. Join the conversation."
        pathname="/community"
      />
      <div className="space-y-10 pb-12 animate-fade-in">
        {/* Hero */}
        <section className="relative rounded-3xl overflow-hidden bg-surface-chrome border border-white/5 shadow-2xl p-8 md:p-12">
          <div className="absolute inset-0 bg-gradient-to-r from-brand/15 via-brand/5 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 text-brand border border-brand/20 rounded-full text-xs font-bold uppercase tracking-wider font-ui">
              <Zap className="h-3.5 w-3.5 animate-pulse" />
              Live Community
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white font-logo">What's Happening</h1>
            <p className="text-base text-gray-300 font-ui leading-relaxed">
              See what the AnimeLoom community is watching, completing, and rating in real time.
            </p>
            {!user && (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand/90 text-white text-sm font-bold rounded-lg transition-all duration-300 font-ui"
              >
                <Users className="h-4 w-4" />
                Join the Community
              </Link>
            )}
          </div>
        </section>

        {/* Community Activity Feed */}
        <section className="space-y-6">
          <SectionHeader
            title="Recent Activity"
            subtitle="Latest actions across the AnimeLoom platform"
            useLogoFont={false}
          />
          <ActivityFeed limit={30} emptyMessage="No community activity yet. Be the first to rate or review an anime!" />
        </section>
      </div>
    </>
  )
}
