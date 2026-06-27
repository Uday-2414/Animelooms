import React, { useState, useEffect, useContext } from 'react'
import { Bell, Check, UserPlus, Heart, MessageSquare, Award } from 'lucide-react'
import { Link } from 'react-router-dom'
import { notificationService } from '../../services/notificationService'
import AuthContext from '../../context/AuthContext'

export default function NotificationDropdown() {
  const { user } = useContext(AuthContext)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!user) return

    let isMounted = true

    const loadNotifications = async () => {
      const [notifs, count] = await Promise.all([
        notificationService.getNotifications(user.id, 10),
        notificationService.getUnreadCount(user.id)
      ])
      
      if (isMounted) {
        setNotifications(notifs)
        setUnreadCount(count)
      }
    }

    loadNotifications()

    // Subscribe to realtime updates
    const unsubscribe = notificationService.subscribeToNotifications(user.id, (newNotif) => {
      if (!isMounted) return
      
      // Optionally fetch full profile if actor_id is present, but for now just prepend
      // A production app might trigger a full re-fetch or use edge functions to join data
      setNotifications(prev => [newNotif, ...prev].slice(0, 10))
      setUnreadCount(prev => prev + 1)
    })

    return () => {
      isMounted = false
      if (unsubscribe) unsubscribe()
    }
  }, [user])

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
    if (!isOpen && unreadCount > 0) {
      notificationService.markAllRead(user.id)
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    }
  }

  const renderIcon = (type) => {
    switch (type) {
      case 'follow': return <UserPlus className="h-4 w-4 text-blue-400" />
      case 'like_review': 
      case 'like_collection': return <Heart className="h-4 w-4 text-red-400" />
      case 'comment': return <MessageSquare className="h-4 w-4 text-emerald-400" />
      default: return <Award className="h-4 w-4 text-brand" /> // Fallback Gamification
    }
  }

  if (!user) return null

  return (
    <div className="relative">
      <button 
        onClick={toggleDropdown}
        className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-surface-card" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-surface-card border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden font-ui animate-fade-in">
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-surface-chrome/50">
              <h3 className="font-bold text-white text-sm">Notifications</h3>
              {notifications.length > 0 && (
                <button 
                  onClick={() => {
                    notificationService.markAllRead(user.id)
                    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
                  }}
                  className="text-xs text-brand hover:underline font-semibold"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400 space-y-2">
                  <Bell className="h-8 w-8 mx-auto opacity-20" />
                  <p className="text-sm">No notifications yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map(notif => {
                    const isGamification = !notif.actor_id
                    
                    return (
                      <div 
                        key={notif.id} 
                        className={`p-4 flex gap-3 hover:bg-white/5 transition-colors ${!notif.is_read ? 'bg-brand/5' : ''}`}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {isGamification ? (
                            <div className="p-2 bg-brand/10 rounded-full border border-brand/20">
                              {renderIcon(notif.type)}
                            </div>
                          ) : (
                            <Link to={`/user/${notif.actor_id}`} onClick={() => setIsOpen(false)}>
                              <img 
                                src={notif.actor?.avatar_url || `https://ui-avatars.com/api/?name=${notif.actor?.username || 'U'}&background=1d2430&color=ffffff`}
                                className="w-10 h-10 rounded-full border border-white/10"
                                alt=""
                              />
                            </Link>
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          {isGamification ? (
                            <>
                              <p className="text-sm font-bold text-white">{notif.title}</p>
                              {notif.body && <p className="text-xs text-gray-400 mt-0.5">{notif.body}</p>}
                            </>
                          ) : (
                            <p className="text-sm text-gray-300">
                              <Link to={`/user/${notif.actor_id}`} className="font-bold text-white hover:text-brand" onClick={() => setIsOpen(false)}>
                                {notif.actor?.display_name || notif.actor?.username || 'Someone'}
                              </Link>
                              {' '}
                              {notif.type === 'follow' ? 'started following you.' : 
                               notif.type === 'like_collection' ? 'liked your collection.' : 'interacted with you.'}
                            </p>
                          )}
                        </div>
                        {!notif.is_read && (
                          <div className="flex-shrink-0 mt-2">
                            <div className="w-2 h-2 bg-brand rounded-full" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
