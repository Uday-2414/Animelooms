import { animeService } from './src/services/animeService.js'

// Simple colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
}

function printSuccess(message) {
  console.log(`${colors.green}✔ ${message}${colors.reset}`)
}

function printFailure(message, error) {
  console.error(`${colors.red}✘ ${message}${colors.reset}`)
  if (error) {
    console.error(error)
  }
}

function validateAnimeObject(anime, context) {
  const requiredFields = ['mal_id', 'title', 'image_url', 'genres']
  for (const field of requiredFields) {
    if (anime[field] === undefined) {
      throw new Error(`[${context}] Missing required field: "${field}"`)
    }
  }
  
  if (typeof anime.mal_id !== 'number') {
    throw new Error(`[${context}] mal_id must be a number, got ${typeof anime.mal_id}`)
  }
  if (typeof anime.title !== 'string' || !anime.title.trim()) {
    throw new Error(`[${context}] title must be a non-empty string`)
  }
  if (typeof anime.image_url !== 'string' || !anime.image_url.startsWith('http')) {
    throw new Error(`[${context}] image_url must be a valid absolute URL`)
  }
  if (!Array.isArray(anime.genres)) {
    throw new Error(`[${context}] genres must be an array`)
  }
}

async function runTests() {
  console.log(`${colors.cyan}--- Starting Jikan API Service Layer Verification ---${colors.reset}\n`)

  // Test 1: getTrendingAnime()
  try {
    console.log(`${colors.yellow}Testing getTrendingAnime()...${colors.reset}`)
    const trending = await animeService.getTrendingAnime()
    if (!Array.isArray(trending) || trending.length === 0) {
      throw new Error('Expected a non-empty array of trending anime')
    }
    
    // Validate first item
    validateAnimeObject(trending[0], 'Trending Anime Item 0')
    printSuccess(`getTrendingAnime() returned ${trending.length} items. First item: "${trending[0].title}" (ID: #${trending[0].mal_id})`)
  } catch (error) {
    printFailure('getTrendingAnime() failed', error)
  }

  console.log('')

  // Test 2: getTopAnime()
  try {
    console.log(`${colors.yellow}Testing getTopAnime()...${colors.reset}`)
    const top = await animeService.getTopAnime()
    if (!Array.isArray(top) || top.length === 0) {
      throw new Error('Expected a non-empty array of top anime')
    }
    
    validateAnimeObject(top[0], 'Top Anime Item 0')
    printSuccess(`getTopAnime() returned ${top.length} items. First item: "${top[0].title}" (ID: #${top[0].mal_id})`)
  } catch (error) {
    printFailure('getTopAnime() failed', error)
  }

  console.log('')

  // Test 3: getAnimeDetails(id)
  try {
    const testId = 16498 // Attack on Titan
    console.log(`${colors.yellow}Testing getAnimeDetails(${testId})...${colors.reset}`)
    const details = await animeService.getAnimeDetails(testId)
    
    if (!details) {
      throw new Error('Expected valid details object')
    }
    
    validateAnimeObject(details, 'Anime Details')
    
    if (typeof details.synopsis !== 'string' || !details.synopsis.trim()) {
      throw new Error('Anime details should contain a non-empty synopsis')
    }

    printSuccess(`getAnimeDetails(${testId}) succeeded. Title: "${details.title}", Score: ${details.score || 'N/A'}, Format: ${details.type || 'N/A'}`)
  } catch (error) {
    printFailure('getAnimeDetails() failed', error)
  }

  console.log('')

  // Test 4: searchAnime(query)
  try {
    const query = 'Frieren'
    console.log(`${colors.yellow}Testing searchAnime("${query}")...${colors.reset}`)
    const searchResults = await animeService.searchAnime(query)
    
    if (!Array.isArray(searchResults) || searchResults.length === 0) {
      throw new Error(`Expected search results for query "${query}"`)
    }
    
    validateAnimeObject(searchResults[0], 'Search Result Item 0')
    printSuccess(`searchAnime("${query}") returned ${searchResults.length} results. First result: "${searchResults[0].title}" (ID: #${searchResults[0].mal_id})`)
  } catch (error) {
    printFailure(`searchAnime("${query}") failed`, error)
  }

  console.log(`\n${colors.cyan}--- Verification Completed ---${colors.reset}`)
}

runTests()
