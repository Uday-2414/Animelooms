import React from 'react'

export default function LevelBadge({ level = 1, title = 'Anime Rookie', size = 'md' }) {
  if (size === 'sm') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand/20 text-white border border-brand/30 font-ui shadow-sm">
        <span className="text-brand">Lv.{level}</span> {title}
      </span>
    )
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-card border border-brand/30 rounded-xl shadow-glow font-ui">
      <div className="w-6 h-6 rounded-lg bg-brand text-white flex items-center justify-center text-xs font-black">
        {level}
      </div>
      <div className="text-left">
        <p className="text-[9px] font-bold uppercase tracking-widest text-brand leading-tight">Level</p>
        <p className="text-xs font-bold text-white leading-tight">{title}</p>
      </div>
    </div>
  )
}
