import SEO from '../components/seo/SEO'
import { Shield, Lock, FileSpreadsheet, HeartHandshake, Mail } from 'lucide-react'

export default function Privacy() {
  return (
    <>
      <SEO
        title="Privacy Policy"
        description="Read the AnimeLoom Privacy Policy. Learn about our Google Authentication, Supabase backend integration, analytics, and privacy guarantees."
        pathname="/privacy"
      />
      <div className="space-y-10 pb-12 animate-fade-in font-ui max-w-4xl mx-auto">
        {/* Title Hero */}
        <section className="text-center space-y-4 py-6">
          <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mx-auto mb-2 border border-brand/20">
            <Shield className="h-8 w-8 text-brand" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white font-logo tracking-wide">
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-sm">Last updated: June 14, 2026</p>
        </section>

        {/* Content Modules */}
        <div className="space-y-6">
          {/* Module: Google Auth */}
          <section className="bg-surface-card border border-white/5 p-6 md:p-8 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-brand" />
              <h2 className="text-xl font-bold text-white font-logo">Google Authentication</h2>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              AnimeLoom uses Google OAuth for secure, passwordless authentication. When you log in, we only retrieve your basic profile information (such as email, name, and profile picture url). This data is strictly used to create your profile and personalize your dashboard. We do not access or store any of your other Google account data.
            </p>
          </section>

          {/* Module: Supabase */}
          <section className="bg-surface-card border border-white/5 p-6 md:p-8 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-brand" />
              <h2 className="text-xl font-bold text-white font-logo">Supabase Infrastructure</h2>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Our backend database is securely hosted on Supabase. Your watchlist selections, preferences, and account status are stored on encrypted servers with strict access controls. Supabase operates under enterprise-grade security standard protocols to ensure user data remains confidential and highly available.
            </p>
          </section>

          {/* Module: Analytics */}
          <section className="bg-surface-card border border-white/5 p-6 md:p-8 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-5 w-5 text-brand" />
              <h2 className="text-xl font-bold text-white font-logo">Analytics Usage</h2>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              We employ lightweight analytics tools (Vercel Analytics and Google Analytics) to monitor platform load speed, performance, and general routing statistics. This data is aggregated and anonymized. It does not track personal browsing habits outside of AnimeLoom, and is used solely to optimize application responsiveness and fix functional bottlenecks.
            </p>
          </section>

          {/* Module: No Selling */}
          <section className="bg-surface-card border border-white/5 p-6 md:p-8 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <HeartHandshake className="h-5 w-5 text-brand" />
              <h2 className="text-xl font-bold text-white font-logo">No Selling of Data</h2>
            </div>
            <div className="border-l-2 border-brand pl-4 py-1">
              <p className="text-sm text-white font-semibold leading-relaxed">
                AnimeLoom has a zero-monetization policy on user data. We do not, and will never, sell, trade, rent, or lease your personal information to marketing firms, advertisers, or any third-party entities.
              </p>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your trust is our highest priority. All data collection is limited exclusively to what is technically required to serve you a functioning, high-quality watchlist tracker.
            </p>
          </section>

          {/* Contact Section */}
          <section className="bg-surface-card border border-white/5 p-6 md:p-8 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-brand" />
              <h2 className="text-xl font-bold text-white font-logo">Contact Privacy Support</h2>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              If you have any questions about this Privacy Policy, your stored data, or if you want to request data deletion, please contact us at:
            </p>
            <div className="flex items-center gap-2 text-sm text-white font-mono bg-background-base/50 px-4 py-3 rounded-xl border border-white/5 w-fit">
              <span>animelooms@zohomail.in</span>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
