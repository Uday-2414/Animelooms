
/**
 * Reusable premium button component matching AnimeLoom design system
 * @param {Object} props
 * @param {'primary'|'secondary'|'ghost'} [props.variant='primary']
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean} [props.fullWidth=false]
 * @param {React.ReactNode} props.children
 * @param {React.ButtonHTMLAttributes<HTMLButtonElement>} props
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-ui font-semibold rounded-md transition-all duration-300 active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background-base'
  
  const variants = {
    primary: 'bg-brand text-white hover:bg-brand/90 hover:shadow-[0_0_15px_rgba(192,57,43,0.3)] border-none',
    secondary: 'bg-surface-card text-white border border-white/10 hover:border-white/20 hover:bg-white/5',
    ghost: 'bg-transparent text-white/70 hover:text-white hover:bg-white/5'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base'
  }

  const widthStyle = fullWidth ? 'w-full' : ''

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
