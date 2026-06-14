import { useState, useEffect } from 'react'
import { ExternalLink, FileText } from 'lucide-react'
import SectionHeader from '../components/ui/SectionHeader'
import NewsCard from '../components/news/NewsCard'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'
import SEO from '../components/seo/SEO'
import { newsService } from '../services/newsService'
import { NewsCardSkeleton, Skeleton } from '../components/ui/Skeleton'

export default function News() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const loadNews = async () => {
      try {
        setLoading(true)
        setError(null)
        const newsData = await newsService.fetchNews({ signal: controller.signal })
        if (isMounted) {
          setNews(newsData)
        }
      } catch (err) {
        if (err.name === 'AbortError') return
        console.error('Unable to load news:', err)
        if (isMounted) {
          setError('News data is temporarily unavailable.')
          setNews([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadNews()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [refreshKey])

  const handleRetry = () => {
    setRefreshKey((prev) => prev + 1)
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <SectionHeader 
          title="Industry News" 
          subtitle="Stay updated with anime industry reports and database releases" 
        />
        <EmptyState
          icon={<FileText className="h-10 w-10 text-brand" />}
          title="News data is temporarily unavailable"
          description="We couldn't load the latest news articles. Please try again."
          action={
            <Button variant="primary" onClick={handleRetry}>
              Retry Loading
            </Button>
          }
        />
      </div>
    )
  }

  if (!loading && news.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <SectionHeader 
          title="Industry News" 
          subtitle="Stay updated with anime industry reports and database releases" 
        />
        <EmptyState
          icon={<FileText className="h-10 w-10 text-gray-500" />}
          title="No news available"
          description="Please check back later."
        />
      </div>
    )
  }

  return (
    <>
      <SEO
        title="Anime News & Updates"
        description="Keep up with anime industry news, release updates, and featured articles curated by AnimeLoom."
        pathname="/news"
      />
      <div className="space-y-8 animate-fade-in">
        <SectionHeader 
          title="Industry News" 
          subtitle="Stay updated with anime industry reports and database releases" 
        />

        {loading ? (
          <div className="space-y-8">
            {/* Featured Article Skeleton */}
            <div className="max-w-4xl mx-auto w-full bg-surface-card border border-white/5 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <Skeleton className="h-64 md:h-72 rounded-none" />
                <div className="p-8 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-6 w-11/12 bg-white/20" />
                    <div className="space-y-2">
                      <Skeleton className="h-3.5 w-full" />
                      <Skeleton className="h-3.5 w-full" />
                      <Skeleton className="h-3.5 w-4/5" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-28" />
                </div>
              </div>
            </div>

            {/* Latest News Grid Skeleton */}
            <div className="max-w-4xl mx-auto w-full space-y-4">
              <Skeleton className="h-5 w-32" />
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <NewsCardSkeleton key={`news-skel-${idx}`} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Featured Article */}
            {news[0] && (
              <div className="max-w-4xl mx-auto w-full">
                <div className="relative bg-linear-to-r from-brand/10 to-brand/5 border border-brand/20 rounded-2xl overflow-hidden shadow-lg">
                  {/* Featured Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 bg-brand/80 text-white text-xs font-bold tracking-widest uppercase rounded-full">
                      Featured
                    </span>
                  </div>

                  {/* Featured Content */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                    {/* Image */}
                    {news[0].image_url && (
                      <div className="h-64 md:h-72 overflow-hidden relative">
                        <img
                          src={news[0].image_url}
                          alt={news[0].title}
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
                            {news[0].source}
                          </p>
                          <h3 className="text-2xl font-bold text-white font-ui leading-tight">
                            {news[0].title}
                          </h3>
                        </div>

                        <p className="text-sm text-gray-300 leading-relaxed font-ui">
                          {news[0].excerpt}
                        </p>

                        <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400 font-ui">
                          <span>{news[0].date}</span>
                          {news[0].author && (
                            <>
                              <span className="text-white/10">•</span>
                              <span>By {news[0].author}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Read More Button */}
                      <a
                        href={news[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-brand/10 border border-brand/30 rounded-lg hover:bg-brand/20 hover:border-brand/50 transition-all duration-300 w-fit text-sm font-semibold text-brand group font-ui"
                      >
                        Read Article
                        <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Latest News Section */}
            {news.length > 1 && (
              <div className="max-w-4xl mx-auto w-full">
                <h3 className="text-lg font-bold text-white font-ui mb-4 pb-3 border-b border-white/5">
                  Latest News
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {news.slice(1).map((newsItem, index) => (
                    <NewsCard 
                      key={index}
                      news={newsItem}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
