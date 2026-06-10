import React, { useState, useEffect } from 'react'
import { ExternalLink } from 'lucide-react'
import SectionHeader from '../components/ui/SectionHeader'
import NewsCard from '../components/news/NewsCard'
import LoadingState from '../components/ui/LoadingState'
import EmptyState from '../components/ui/EmptyState'
import { newsService } from '../services/newsService'

export default function News() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true)
        setError(null)
        const newsData = await newsService.fetchNews()
        setNews(newsData)
      } catch (_err) {
        setError('Unable to load anime news at this time. Please try again later.')
        setNews([])
      } finally {
        setLoading(false)
      }
    }

    loadNews()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <SectionHeader 
          title="Industry News" 
          subtitle="Stay updated with anime industry reports and database releases" 
        />
        <LoadingState message="Fetching anime news..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <SectionHeader 
          title="Industry News" 
          subtitle="Stay updated with anime industry reports and database releases" 
        />
        <EmptyState
          title="Unable to Load News"
          description={error}
        />
      </div>
    )
  }

  if (news.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <SectionHeader 
          title="Industry News" 
          subtitle="Stay updated with anime industry reports and database releases" 
        />
        <EmptyState
          title="No anime news available right now."
          description="Check back later for the latest industry updates and releases."
        />
      </div>
    )
  }

  const featuredNews = news[0]
  const latestNews = news.slice(1)

  return (
    <div className="space-y-8 animate-fade-in">
      <SectionHeader 
        title="Industry News" 
        subtitle="Stay updated with anime industry reports and database releases" 
      />

      {/* Featured Article */}
      <div className="max-w-4xl mx-auto w-full">
        <div className="relative bg-linear-to-r from-brand/10 to-brand/5 border border-brand/20 rounded-2xl overflow-hidden">
          {/* Featured Badge */}
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3 py-1 bg-brand/80 text-white text-xs font-bold tracking-widest uppercase rounded-full">
              Featured
            </span>
          </div>

          {/* Featured Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Image */}
            {featuredNews.image_url && (
              <div className="h-64 md:h-72 overflow-hidden relative">
                <img
                  src={featuredNews.image_url}
                  alt={featuredNews.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
            )}

            {/* Text Content */}
            <div className="p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs text-brand font-bold tracking-widest uppercase">
                    {featuredNews.source}
                  </p>
                  <h3 className="text-2xl font-bold text-white font-ui leading-tight">
                    {featuredNews.title}
                  </h3>
                </div>

                <p className="text-sm text-gray-300 leading-relaxed">
                  {featuredNews.excerpt}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400 font-ui">
                  <span>{featuredNews.date}</span>
                  {featuredNews.author && (
                    <>
                      <span className="text-white/10">•</span>
                      <span>By {featuredNews.author}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Read More Button */}
              <a
                href={featuredNews.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-brand/10 border border-brand/30 rounded-lg hover:bg-brand/20 hover:border-brand/50 transition-all duration-300 w-fit text-sm font-semibold text-brand group"
              >
                Read Article
                <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Latest News Section */}
      {latestNews.length > 0 && (
        <div className="max-w-4xl mx-auto w-full">
          <h3 className="text-lg font-bold text-white font-ui mb-4 pb-3 border-b border-white/5">
            Latest News
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {latestNews.map((newsItem, index) => (
              <NewsCard 
                key={index}
                news={newsItem}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
