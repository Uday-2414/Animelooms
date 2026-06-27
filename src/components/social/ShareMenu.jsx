import React, { useState } from 'react'
import { Share2, Copy, Check, Twitter, Facebook } from 'lucide-react'
import Button from '../ui/Button'
import { analyticsService } from '../../services/analyticsService'

export default function ShareMenu({ title, text, url, className = '' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleShareClick = async () => {
    analyticsService.trackEvent('share_clicked', { title, url })
    
    // Use native Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url
        })
        return
      } catch (err) {
        // Fallback to menu if aborted or failed
        if (err.name !== 'AbortError') {
          setIsOpen(!isOpen)
        }
      }
    } else {
      setIsOpen(!isOpen)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
        setIsOpen(false)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <Button 
        variant="ghost" 
        onClick={handleShareClick}
        className="bg-surface-chrome border border-white/5 hover:border-brand/50 text-white"
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-48 bg-surface-card border border-white/10 rounded-xl shadow-xl z-50 p-2 animate-fade-in font-ui">
            <button
              onClick={copyToClipboard}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-surface-chrome rounded-lg transition-colors"
            >
              {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-[#1DA1F2] hover:bg-surface-chrome rounded-lg transition-colors"
            >
              <Twitter className="h-4 w-4" />
              Twitter
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-[#4267B2] hover:bg-surface-chrome rounded-lg transition-colors"
            >
              <Facebook className="h-4 w-4" />
              Facebook
            </a>
          </div>
        </>
      )}
    </div>
  )
}
