/* global process */
import { promises as fs } from 'fs'
import { join } from 'path'

const BASE_URL = process.env.SITE_URL || 'https://animelooms.com'
const CONTENT_PATH = join(process.cwd(), 'public')
const OUTPUT_PATH = join(CONTENT_PATH, 'sitemap.xml')

const staticPages = [
  { path: '/', priority: '1.00', changefreq: 'daily' },
  { path: '/search', priority: '0.80', changefreq: 'weekly' },
  { path: '/rankings', priority: '0.90', changefreq: 'weekly' },
  { path: '/news', priority: '0.85', changefreq: 'daily' },
  { path: '/watchlist', priority: '0.75', changefreq: 'weekly' },
  { path: '/profile', priority: '0.75', changefreq: 'weekly' },
]

const animeIds = [
  52991, 16498, 38000, 40748, 19, 44511, 52299, 21, 41467, 52082, 52588, 54900,
]

function buildUrl({ path, priority, changefreq }) {
  return `  <url>\n    <loc>${BASE_URL}${path}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
}

async function generateSitemap() {
  const urls = [...staticPages, ...animeIds.map((id) => ({ path: `/anime/${id}`, priority: '0.70', changefreq: 'monthly' }))]
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(buildUrl).join('\n')}\n</urlset>`
  await fs.mkdir(CONTENT_PATH, { recursive: true })
  await fs.writeFile(OUTPUT_PATH, sitemap, 'utf8')
  console.log(`Sitemap written to ${OUTPUT_PATH}`)
}

generateSitemap().catch((error) => {
  console.error('Failed to generate sitemap:', error)
  process.exit(1)
})
