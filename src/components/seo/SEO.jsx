import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'AnimeLoom'
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://animelooms.com'
const DEFAULT_IMAGE = `${SITE_URL}/web-app-manifest-512x512.png`

export default function SEO({
  title,
  description,
  pathname = '/',
  image = DEFAULT_IMAGE,
  type = 'website',
  keywords = 'anime, anime tracker, watchlist, rankings, anime discovery',
  shouldIndex = true,
  noFollow = false,
  schemas = [],
}) {
  const pageTitle = title
    ? title.includes(SITE_NAME)
      ? title
      : `${title} | ${SITE_NAME}`
    : SITE_NAME

  const canonicalUrl = `${SITE_URL}${pathname}`
  const robots = shouldIndex
    ? noFollow
      ? 'index, nofollow'
      : 'index, follow'
    : 'noindex, nofollow'

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {schemas.map((schema, i) => (
        <script key={`schema-${i}`} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  )
}
