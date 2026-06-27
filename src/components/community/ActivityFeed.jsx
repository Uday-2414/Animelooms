import { useCommunityActivity } from '../../hooks/useActivity'
import ActivityItem from './ActivityItem'
import { Activity } from 'lucide-react'

export default function ActivityFeed({ limit = 12, userId = null, emptyMessage = 'No community activity yet.' }) {
  const { activity, loading } = useCommunityActivity(limit)

  // Filter by userId if provided (for public profile pages)
  const items = userId ? activity.filter(a => a.user_id === userId) : activity

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-surface-chrome/20 border border-white/5 animate-pulse" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-surface-chrome/10 p-6 text-center">
        <Activity className="h-8 w-8 text-gray-600 mx-auto mb-2" />
        <p className="text-sm text-gray-500 font-ui">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {items.map(item => (
        <ActivityItem key={item.id} item={item} />
      ))}
    </div>
  )
}
