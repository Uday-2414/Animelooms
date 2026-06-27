import { useState, useEffect } from 'react'
import { Cookie, ShieldAlert } from 'lucide-react'
import Button from './Button'

const CONSENT_KEY = 'animeloom_cookie_consent'

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const hasConsented = localStorage.getItem(CONSENT_KEY)
    if (!hasConsented) {
      setIsVisible(true)
    }
  }, [])

  const handleAcceptAll = () => {
    localStorage.setItem(CONSENT_KEY, 'all')
    setIsVisible(false)
    window.dispatchEvent(new Event('cookie_consent_updated'))
  }

  const handleRejectNonEssential = () => {
    localStorage.setItem(CONSENT_KEY, 'essential')
    setIsVisible(false)
    window.dispatchEvent(new Event('cookie_consent_updated'))
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 pointer-events-none animate-fade-in">
      <div className="max-w-4xl mx-auto bg-surface-card border border-brand/30 shadow-[0_0_40px_rgba(192,57,43,0.15)] rounded-2xl p-6 pointer-events-auto flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-brand/10 rounded-xl hidden sm:block">
            <Cookie className="h-6 w-6 text-brand" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-ui flex items-center gap-2">
              We value your privacy <ShieldAlert className="h-4 w-4 text-brand" />
            </h3>
            <p className="text-sm text-gray-400 font-ui mt-1 leading-relaxed max-w-2xl">
              AnimeLoom uses cookies to enhance your browsing experience, serve personalized recommendations, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <button 
            onClick={handleRejectNonEssential}
            className="px-6 py-2.5 rounded-xl border border-white/10 hover:bg-surface-chrome text-gray-300 font-semibold text-sm transition-colors focus-ring active-press whitespace-nowrap"
          >
            Essential Only
          </button>
          <Button variant="primary" onClick={handleAcceptAll} className="whitespace-nowrap">
            Accept All
          </Button>
        </div>
      </div>
    </div>
  )
}
