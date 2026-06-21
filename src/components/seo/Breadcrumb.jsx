import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ChevronRight } from 'lucide-react'

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://animelooms.com'

/**
 * Reusable breadcrumb component with BreadcrumbList JSON-LD schema.
 * @param {{ items: Array<{ label: string, href?: string }> }} props
 * items — ordered breadcrumb entries. The last item is treated as the current page (no link).
 */
export default function Breadcrumb({ items = [] }) {
  if (items.length === 0) return null

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
    })),
  }

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>

      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center flex-wrap gap-1 text-sm font-ui">
          {items.map((item, index) => {
            const isLast = index === items.length - 1
            return (
              <li key={index} className="flex items-center gap-1">
                {index > 0 && (
                  <ChevronRight className="h-3.5 w-3.5 text-brand/60 flex-shrink-0" />
                )}
                {isLast || !item.href ? (
                  <span className="text-white font-semibold truncate max-w-[200px]">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.href}
                    className="text-gray-400 hover:text-brand transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
