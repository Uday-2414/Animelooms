
/**
 * GenreBadge component for categorical tags in AnimeLoom
 * @param {Object} props
 * @param {string} props.name
 * @param {string} [props.color='brand'] - Option to customize the tint
 */
export default function GenreBadge({
  name,
  color = 'brand',
  className = ''
}) {
  const colorClasses = {
    brand: 'bg-brand/10 text-white border-brand/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  }

  const selectedColor = colorClasses[color] || colorClasses.brand

  return (
    <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded border font-ui ${selectedColor} ${className}`}>
      {name}
    </span>
  )
}
