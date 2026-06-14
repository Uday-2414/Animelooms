
/**
 * StatsCard component designed for analytics or user profile summaries
 * @param {Object} props
 * @param {string} props.label
 * @param {string|number} props.value
 * @param {React.ReactNode} [props.icon]
 * @param {string} [props.description]
 */
export default function StatsCard({
  label,
  value,
  icon,
  description,
  className = ''
}) {
  return (
    <div className={`p-6 bg-surface-card border border-white/5 rounded-xl transition-all duration-300 hover:border-white/10 hover:shadow-glow ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 font-ui">
          {label}
        </span>
        {icon && <div className="text-brand">{icon}</div>}
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-white font-ui tracking-tight">
          {value}
        </span>
      </div>
      {description && (
        <p className="mt-2 text-xs text-gray-500 font-ui">
          {description}
        </p>
      )}
    </div>
  )
}
