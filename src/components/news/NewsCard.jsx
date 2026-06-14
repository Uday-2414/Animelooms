import { Calendar, ExternalLink } from 'lucide-react'

/**
 * NewsCard component styled according to AnimeLoom design rules
 * @param {Object} props
 * @param {Object} props.news - News article data
 * @param {string} props.news.title
 * @param {string} props.news.excerpt
 * @param {string} props.news.image_url
 * @param {string} props.news.date
 * @param {string} props.news.author
 * @param {string} [props.news.url]
 */
export default function NewsCard({
  news,
  className = ''
}) {
  const { title, excerpt, image_url, date, source, author, url } = news

  return (
    <article className={`flex flex-col md:flex-row bg-surface-card border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:border-brand/20 hover:shadow-glow ${className}`}>
      {/* Article Image */}
      {image_url && (
        <div className="w-full md:w-48 h-48 md:h-auto relative overflow-hidden flex-shrink-0">
          <img
            src={image_url}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
        </div>
      )}

      {/* Article Content */}
      <div className="p-6 flex flex-col justify-between flex-grow gap-4">
        <div className="space-y-2">
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 font-ui">
            {source && (
              <span className="text-brand uppercase tracking-widest">
                {source}
              </span>
            )}
            {source && date && <span className="text-white/10">•</span>}
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-brand" />
              {date}
            </span>
            {author && (
              <>
                <span className="text-white/10">•</span>
                <span>By {author}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-white font-ui tracking-wide line-clamp-2 hover:text-brand transition-colors duration-300">
            {title}
          </h3>

          {/* Excerpt */}
          <p className="text-sm text-gray-400 font-ui line-clamp-3 leading-relaxed">
            {excerpt}
          </p>
        </div>

        {/* Read More Link */}
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Read full article: ${title}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand hover:text-brand/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background-base rounded transition-colors duration-300 self-start"
          >
            Read Article
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </article>
  )
}
