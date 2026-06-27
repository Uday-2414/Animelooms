import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { trackPageView } from './services/analyticsService'

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
import About from './pages/About'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'
import Community from './pages/Community'
import UserProfile from './pages/UserProfile'

import ScrollToTop from './components/layout/ScrollToTop'

// Styling
import './App.css'

function AnalyticsTracker() {
  const location = useLocation()

  useEffect(() => {
    trackPageView(location.pathname + location.search)
  }, [location])

  return (
    <>
      <Analytics route={location.pathname} path={location.pathname + location.search} />
      <SpeedInsights route={location.pathname} />
    </>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <AnalyticsTracker />
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Main Application Shell Layout */}
          <Route element={<AppLayout />}>
            {/* Public Pages */}
            <Route index element={<Home />} />
            <Route path="search" element={<Search />} />
            <Route path="anime/:id" element={<AnimeDetails />} />
            <Route path="rankings" element={<Rankings />} />
            <Route path="news" element={<News />} />
            <Route path="about" element={<About />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />
            <Route path="contact" element={<Contact />} />
            <Route path="community" element={<Community />} />
            <Route path="user/:userId" element={<UserProfile />} />

            {/* Protected Pages */}
            <Route
              element={
                <ProtectedRoute>
                  <Outlet />
                </ProtectedRoute>
              }
            >
              <Route path="watchlist" element={<Watchlist />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
