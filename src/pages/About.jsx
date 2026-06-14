import SEO from '../components/seo/SEO'
import { Compass, Bookmark, Trophy, Sparkles } from 'lucide-react'

export default function About() {
  const features = [
    {
      icon: <Compass className="h-8 w-8 text-brand" />,
      title: 'Anime Discovery',
      description: 'Find your next favorite series through real-time trending updates, popular databases, and highly structured catalog browsing.'
    },
    {
      icon: <Bookmark className="h-8 w-8 text-brand" />,
      title: 'Watchlist Management',
      description: 'Organize your anime journey by categorization: group your series into "Watching", "Completed", and "Plan To Watch".'
    },
    {
      icon: <Trophy className="h-8 w-8 text-brand" />,
      title: 'Rankings & Tracking',
      description: 'Stay updated with dynamic ranking charts showing the top-rated airing shows, movies, and all-time classics.'
    },
    {
      icon: <Sparkles className="h-8 w-8 text-brand" />,
      title: 'Modern Companion',
      description: 'Enjoy a lightning-fast, premium desktop-first dashboard designed with glassmorphism aesthetics and high readability.'
    }
  ]

  return (
    <>
      <SEO
        title="About Us"
        description="Learn about the AnimeLoom mission, feature set, and what makes it the ultimate modern anime companion platform."
        pathname="/about"
      />
      <div className="space-y-12 pb-12 animate-fade-in font-ui">
        {/* About Header Hero */}
        <section className="relative rounded-3xl overflow-hidden bg-surface-chrome border border-white/5 shadow-2xl p-8 md:p-16 text-center space-y-6">
          <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&auto=format&fit=crop&q=80')` }} />
          <div className="relative z-10 max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-white font-logo tracking-wide">
              The Ultimate Anime Companion
            </h1>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              AnimeLoom is built from the ground up to provide a premium, clutter-free environment for anime fans to explore, organize, and follow the anime universe.
            </p>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-surface-card/30 border border-white/5 p-8 md:p-12 rounded-2xl">
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white font-logo">Our Mission</h2>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              We believe anime discovery should be intuitive, elegant, and personalized. Instead of navigating cluttered, outdated database layouts, AnimeLoom provides a structured and beautiful web companion to make discovering, saving, and returning to your favorite shows an absolute joy.
            </p>
          </div>
          <div className="border border-white/5 rounded-2xl p-6 bg-surface-chrome/50 shadow-inner">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-brand" />
                <span className="text-sm font-semibold text-white">Clean & Uncluttered Interface</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-brand" />
                <span className="text-sm font-semibold text-white">Real-Time Global Database Synchronization</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-brand" />
                <span className="text-sm font-semibold text-white">Intuitive Watchlist Categorization</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white font-logo">Explore the Features</h2>
            <p className="text-gray-400 text-sm mt-2">Everything you need to track and enhance your anime experience.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, index) => (
              <div
                key={index}
                className="bg-surface-card border border-white/5 hover:border-brand/30 hover:scale-[1.02] p-6 rounded-2xl transition-all duration-300 flex flex-col gap-4 shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-white font-ui">{feat.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
