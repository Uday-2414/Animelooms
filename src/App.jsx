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
import { ToastProvider } from './components/gamification/ToastNotification'
import { ProgressProvider } from './context/ProgressContext'

import { lazy, Suspense } from 'react'
import GlobalLoader from './components/ui/GlobalLoader'

// Pages (Lazy Loaded)
const Home = lazy(() => import('./pages/Home'))
const Search = lazy(() => import('./pages/Search'))
const AnimeDetails = lazy(() => import('./pages/AnimeDetails'))
const Watchlist = lazy(() => import('./pages/Watchlist'))
const Profile = lazy(() => import('./pages/Profile'))
const Rankings = lazy(() => import('./pages/Rankings'))
const News = lazy(() => import('./pages/News'))
const Login = lazy(() => import('./pages/Login'))
const About = lazy(() => import('./pages/About'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const Contact = lazy(() => import('./pages/Contact'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Community = lazy(() => import('./pages/Community'))
const UserProfile = lazy(() => import('./pages/UserProfile'))
const DiscoverHub = lazy(() => import('./pages/DiscoverHub'))
const Settings = lazy(() => import('./pages/Settings'))

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
      <ToastProvider>
        <ProgressProvider>
          <BrowserRouter>
            <ScrollToTop />
            <AnalyticsTracker />
            <Suspense fallback={<GlobalLoader />}>
              <Routes>
                <Route path="/login" element={<Login />} />

              {/* Main Application Shell Layout */}
              <Route element={<AppLayout />}>
              {/* Public Pages */}
              <Route index element={<Home />} />
              <Route path="discover" element={<DiscoverHub />} />
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
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
      </BrowserRouter>
      </ProgressProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}

