
/**
 * LoadingState component with a sleek, themed spinner
 * @param {Object} props
 * @param {string} [props.message='Loading cinematic content...']
 * @param {boolean} [props.fullPage=false]
 */
export default function LoadingState({
  message = 'Loading content...',
  fullPage = false,
  className = ''
}) {
  const containerStyles = fullPage 
    ? 'fixed inset-0 z-50 bg-background-base flex flex-col items-center justify-center' 
    : 'w-full py-16 flex flex-col items-center justify-center'

  return (
    <div className={`${containerStyles} ${className}`}>
      <div className="relative w-16 h-16">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full border-2 border-brand/20 animate-ping"></div>
        {/* Spinning track */}
        <div className="absolute inset-0 rounded-full border-2 border-white/5"></div>
        {/* Spinning indicator */}
        <div className="absolute inset-0 rounded-full border-t-2 border-brand animate-spin"></div>
      </div>
      {message && (
        <p className="mt-4 text-sm font-ui text-gray-400 tracking-widest uppercase animate-pulse">
          {message}
        </p>
      )}
    </div>
  )
}
