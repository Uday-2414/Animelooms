import React, { useState } from 'react'
import { Bell, Trophy, Zap, Flame, Award, Check } from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications'

const NOTIFICATION_ICONS = {
  achievement: Trophy,
  level_up: Award,
  challenge: Zap,
  streak: Flame
}

export default function NotificationBell({ userId }) {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(userId)
  const [isOpen, setIsOpen] = useState(false)

  if (!userId) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(p => !p)}
        className="relative p-2 text-gray-400 hover:text-white rounded-xl hover:bg-surface-card transition-colors font-ui"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-brand text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse shadow-glow">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-12 md:bottom-auto md:top-12 z-50 w-80 bg-surface-card border border-white/10 rounded-2xl shadow-2xl p-4 space-y-3 font-ui animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Notifications</h4>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[10px] text-brand hover:underline font-semibold flex items-center gap-1"
              >
                <Check className="h-3 w-3" /> Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-6">No notifications yet.</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1 hide-scrollbar">
              {notifications.map(item => {
                const IconComponent = NOTIFICATION_ICONS[item.type] || Bell
                return (
                  <div
                    key={item.id}
                    onClick={() => !item.is_read && markRead(item.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                      item.is_read
                        ? 'bg-surface-chrome/20 border-transparent text-gray-400'
                        : 'bg-surface-chrome/60 border-brand/20 text-white shadow-sm'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-brand/10 text-brand flex-shrink-0 mt-0.5">
                      <IconComponent className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-grow min-w-0 space-y-0.5">
                      <p className="text-xs font-bold leading-tight">{item.title}</p>
                      {item.body && <p className="text-[11px] text-gray-400 leading-tight">{item.body}</p>}
                      <span className="text-[9px] text-gray-500 block pt-0.5">
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
