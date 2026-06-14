import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/**
 * ScrollToTop component to reset window scroll position on route changes.
 * Bypasses scrolling on POP navigation (back/forward buttons) to preserve
 * native browser scroll restoration.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    if (navigationType !== 'POP') {
      window.scrollTo({
        top: 0,
        behavior: 'instant'
      })
    }
  }, [pathname, navigationType])

  return null
}
