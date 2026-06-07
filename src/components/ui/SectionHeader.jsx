import React from 'react'

/**
 * SectionHeader component incorporating double typeface rules (Cinzel Decorative / Albert Sans)
 * @param {Object} props
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {boolean} [props.useLogoFont=true] - Uses Cinzel Decorative for high-prestige moments
 * @param {React.ReactNode} [props.actions] - Buttons or tags to render on the right
 */
export default function SectionHeader({
  title,
  subtitle,
  useLogoFont = true,
  actions,
  className = ''
}) {
  return (
    <div className={`flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-white/5 pb-4 mb-6 ${className}`}>
      <div className="space-y-1">
        <h2 className={`text-2xl font-bold tracking-wide text-white ${useLogoFont ? 'font-logo' : 'font-ui'}`}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-gray-400 font-ui">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 self-start md:self-end">
          {actions}
        </div>
      )}
    </div>
  )
}
