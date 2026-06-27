import React, { createContext, useContext, useState, useCallback } from 'react'
import { Trophy, Award, Zap, Flame, X } from 'lucide-react'

const ToastContext = createContext({ showToast: () => {} })

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback(({ title, message, type = 'achievement', icon }) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, title, message, type, icon }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-surface-card border border-brand/40 shadow-2xl rounded-2xl p-4 flex items-start gap-3.5 font-ui animate-bounce-short text-white"
          >
            <div className="text-2xl p-2 rounded-xl bg-brand/20 border border-brand/30 flex-shrink-0">
              {toast.icon || (toast.type === 'level_up' ? '🎖️' : '🏆')}
            </div>
            <div className="flex-grow min-w-0">
              <h5 className="text-sm font-black text-brand uppercase tracking-wider">{toast.title}</h5>
              <p className="text-xs text-gray-200 mt-0.5 leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-white p-1 rounded-md"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
