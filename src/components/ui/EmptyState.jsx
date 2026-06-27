import { Inbox } from 'lucide-react'

/**
 * Reusable empty state component with premium AnimeLoom RC-3 styling
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
    <div className={`flex flex-col items-center justify-center text-center py-16 px-6 bg-gradient-to-b from-surface-chrome/40 to-surface-card/40 border border-white/5 rounded-3xl w-full max-w-xl mx-auto shadow-xl ${className}`}>
      <div className="relative mb-6 group animate-[bounce_4s_infinite]">
        <div className="absolute inset-0 bg-brand/10 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="p-5 bg-surface-card rounded-3xl border border-white/10 shadow-glow relative z-10 hover-lift">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold text-white font-ui mb-2 tracking-wide">
        {title}
      </h3>
      <p className="text-sm text-gray-400 font-ui mb-8 max-w-sm leading-relaxed">
        {description}
      </p>
      {action && (
        <div className="flex justify-center w-full animate-fade-in delay-150">
          {action}
        </div>
      )}
    </div>
  )
}
