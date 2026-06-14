import SEO from '../components/seo/SEO'
import { Scale, BookOpen, Database, AlertCircle, ShieldAlert } from 'lucide-react'

export default function Terms() {
  return (
    <>
      <SEO
        title="Terms of Service"
        description="Read the AnimeLoom Terms of Service. Understand our platform usage guidelines, third-party data attributes, user responsibilities, and disclaimers."
        pathname="/terms"
      />
      <div className="space-y-10 pb-12 animate-fade-in font-ui max-w-4xl mx-auto">
        {/* Title Hero */}
        <section className="text-center space-y-4 py-6">
          <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mx-auto mb-2 border border-brand/20">
            <Scale className="h-8 w-8 text-brand" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white font-logo tracking-wide">
            Terms of Service
          </h1>
          <p className="text-gray-400 text-sm">Last updated: June 14, 2026</p>
        </section>

        {/* Content Modules */}
        <div className="space-y-6">
          {/* Module: Educational Platform */}
          <section className="bg-surface-card border border-white/5 p-6 md:p-8 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-brand" />
              <h2 className="text-xl font-bold text-white font-logo">1. Educational & Informational Platform</h2>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              AnimeLoom is built as an educational project designed to showcase React frontend development, oauth login states, database syncing, and responsive UI layout styling. All content, recommendations, and dashboards provided on this platform are for informational and demonstration purposes only.
            </p>
          </section>

          {/* Module: Third-Party Data */}
          <section className="bg-surface-card border border-white/5 p-6 md:p-8 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-brand" />
              <h2 className="text-xl font-bold text-white font-logo">2. Third-Party Anime Data Sources</h2>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              AnimeLoom uses the open-source Jikan API to retrieve community indices, images, genres, ratings, and synopsis details from MyAnimeList. We do not host, broadcast, or stream any video media or copyrighted anime content. All images, characters, titles, and trademarked designations belong to their respective creators, publishers, and licensing companies.
            </p>
          </section>

          {/* Module: User Responsibilities */}
          <section className="bg-surface-card border border-white/5 p-6 md:p-8 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 text-brand" />
              <h2 className="text-xl font-bold text-white font-logo">3. User Responsibilities</h2>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              By using our service, you agree to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-400">
              <li>Use the platform in compliance with all local laws and browser security standards.</li>
              <li>Avoid any automated scraping, rate-limiting violations, or attempts to disrupt backend API connectivity.</li>
              <li>Maintain your Google account authentication credentials securely.</li>
            </ul>
          </section>

          {/* Module: Disclaimer */}
          <section className="bg-surface-card border border-white/5 p-6 md:p-8 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-brand" />
              <h2 className="text-xl font-bold text-white font-logo">4. Disclaimer & Liability Waiver</h2>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              THE WEBSITE AND SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. ANIMELOOM MAKES NO WARRANTIES, EXPRESS OR IMPLIED, REGARDING THE ACCURACY OF SEARCH RESULTS, THE AVAILABILITY OF THE DATABASE INFRASTRUCTURE, OR THE PERMANENCE OF SAVED PROFILE LOGS. IN NO EVENT SHALL ANIMELOOM BE LIABLE FOR DATA LOSS OR PERFORMANCE INTERRUPTIONS ARISING FROM API OUTAGES.
            </p>
          </section>
        </div>
      </div>
    </>
  )
}
