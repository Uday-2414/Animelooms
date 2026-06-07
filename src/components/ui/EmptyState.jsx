import React from 'react'
import { Inbox } from 'lucide-react'

/**
 * Reusable empty state component with theme alignment
 * @param {Object} props
 * @param {React.ReactNode} [props.icon]
 * @param {string} props.title
 * @param {string} props.description
 * @param {React.ReactNode} [props.action]
 */
export default function EmptyState({
  icon = <Inbox className="h-10 w-10 text-gray-500" />,
  title,
  description,
  action,
  className = ''
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-16 px-4 bg-surface-chrome/30 border border-white/5 rounded-xl max-w-lg mx-auto ${className}`}>
      <div className="p-4 bg-surface-card rounded-full border border-white/5 mb-4 shadow-inner">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white font-ui mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-400 font-ui mb-6 max-w-sm">
        {description}
      </p>
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  )
}
