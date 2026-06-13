import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from './services/analytics'

// Shell Layout
import AppLayout from './layout/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'

// Pages
import Home from './pages/Home'
import Search from './pages/Search'
import AnimeDetails from './pages/AnimeDetails'
import Watchlist from './pages/Watchlist'
import Profile from './pages/Profile'
import Rankings from './pages/Rankings'
import News from './pages/News'
import Login from './pages/Login'
import NotFound from './pages/NotFound'

// Styling
import './App.css'

function AnalyticsTracker() {
  const location = useLocation()

  useEffect(() => {
    trackPageView(location.pathname + location.search)
  }, [location])

  return null
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AnalyticsTracker />
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Main Application Shell Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="search" element={<Search />} />
            <Route path="anime/:id" element={<AnimeDetails />} />
            <Route path="watchlist" element={<Watchlist />} />
            <Route path="profile" element={<Profile />} />
            <Route path="rankings" element={<Rankings />} />
            <Route path="news" element={<News />} />
          </Route>

          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
