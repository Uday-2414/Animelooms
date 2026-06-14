import { useNavigate } from 'react-router-dom'
import SEO from '../components/seo/SEO'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <>
      <SEO
        title="Page Not Found"
        description="The page you are looking for does not exist. Return to AnimeLoom's home page or search for anime."
        pathname="/404"
        shouldIndex={false}
        noFollow={true}
      />
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
        {/* 404 Title */}
        <div className="mb-6">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent mb-2">
            404
          </h1>
          <p className="text-2xl font-bold text-slate-100">Page Not Found</p>
        </div>

        {/* Helpful Message */}
        <div className="mb-8">
          <p className="text-slate-400 text-lg mb-4">
            The anime you're looking for doesn't exist in our database, or the page has been moved.
          </p>
          <p className="text-slate-500 text-sm">
            Let's get you back on track with your anime journey.
          </p>
        </div>

        {/* Return Home Button */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          ← Return to Home
        </button>

        {/* Alternative Links */}
        <div className="mt-8 pt-8 border-t border-slate-700">
          <p className="text-slate-500 text-sm mb-4">Quick Navigation:</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => navigate('/search')}
              className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
            >
              Search Anime
            </button>
            <span className="text-slate-600">•</span>
            <button
              onClick={() => navigate('/rankings')}
              className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
            >
              Rankings
            </button>
            <span className="text-slate-600">•</span>
            <button
              onClick={() => navigate('/watchlist')}
              className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
            >
              Watchlist
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
