import { useState, useEffect, useRef } from 'react'
import { Outlet } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Sidebar from '../components/layout/Sidebar'
import Footer from '../components/layout/Footer'
import CookieConsent from '../components/ui/CookieConsent'
import { useNetworkStatus } from '../hooks/useNetworkStatus'
import { WifiOff, CheckCircle2 } from 'lucide-react'

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://animelooms.com'
const SITE_NAME = 'AnimeLoom'

const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/web-app-manifest-512x512.png`,
}

const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  url: SITE_URL,
  name: SITE_NAME,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}

/**
 * AppLayout layout shell wrapper matching AnimeLoom layout spec
 */
export default function AppLayout() {
  const isOnline = useNetworkStatus()
  const [connectionStatus, setConnectionStatus] = useState('none') // 'none' | 'offline' | 'online'
  const prevOnline = useRef(isOnline)

  useEffect(() => {
    if (prevOnline.current !== isOnline) {
      if (!isOnline) {
        const timer = setTimeout(() => {
          setConnectionStatus('offline')
        }, 0)
        prevOnline.current = isOnline
        return () => clearTimeout(timer)
      } else {
        const timer = setTimeout(() => {
          setConnectionStatus('online')
        }, 0)
        const hideTimer = setTimeout(() => {
          setConnectionStatus('none')
        }, 3000)
        prevOnline.current = isOnline
        return () => {
          clearTimeout(timer)
          clearTimeout(hideTimer)
        }
      }
    }
  }, [isOnline])

  return (
    <div className="min-h-screen bg-background-base flex">
      {/* Global Structured Data */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(ORGANIZATION_SCHEMA)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(WEBSITE_SCHEMA)}
        </script>
      </Helmet>

      {/* Fixed Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-grow pl-[280px] min-h-screen flex flex-col justify-between relative">
        {/* Centered fluid canvas container */}
        <div className="w-full max-w-[1280px] mx-auto px-10 pt-8 pb-12 flex-grow">
          {/* Renders current active sub-route page */}
          <Outlet />
        </div>
        <Footer />

        <CookieConsent />

        {/* Global Connection Toasts */}
        {connectionStatus === 'offline' && (
          <div 
            role="alert" 
            aria-live="assertive"
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-brand/95 backdrop-blur-md border border-brand/20 text-white rounded-2xl shadow-glow animate-fade-in font-ui max-w-sm"
          >
            <div className="p-1.5 bg-white/10 rounded-lg">
              <WifiOff className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-wide">You are offline</p>
              <p className="text-xs text-red-200">Some features may be limited.</p>
            </div>
          </div>
        )}

        {connectionStatus === 'online' && (
          <div 
            role="status" 
            aria-live="polite"
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-emerald-600/95 backdrop-blur-md border border-emerald-500/20 text-white rounded-2xl shadow-glow animate-fade-in font-ui max-w-sm"
          >
            <div className="p-1.5 bg-white/10 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-wide">Back online</p>
              <p className="text-xs text-emerald-250">Connection restored successfully.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

