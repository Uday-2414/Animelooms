import React from 'react'
import SectionHeader from '../components/ui/SectionHeader'

export default function Rankings() {
  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader 
        title="Global Rankings" 
        subtitle="Top rated anime lists compiled by popularity, score, and favorites" 
      />

      <div className="bg-surface-card border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-surface-chrome/30">
          <span className="text-sm font-bold uppercase tracking-wider text-gray-400 font-ui">
            Ranked Index
          </span>
          <span className="text-xs text-gray-500 font-ui">
            Updated hourly
          </span>
        </div>
        
        {/* Placeholder Table / List Skeletons */}
        <div className="divide-y divide-white/5">
          {[1, 2, 3, 4, 5].map((rank) => (
            <div key={rank} className="p-6 flex items-center gap-6 hover:bg-white/5 transition-colors duration-300">
              <span className="text-2xl font-bold font-logo text-brand w-8 text-center">
                #{rank}
              </span>
              <div className="w-12 h-16 bg-surface-chrome/50 rounded-lg animate-pulse flex-shrink-0" />
              <div className="flex-grow space-y-2">
                <div className="h-4 bg-surface-chrome/50 rounded animate-pulse w-1/3" />
                <div className="h-3 bg-surface-chrome/50 rounded animate-pulse w-1/4" />
              </div>
              <div className="h-4 bg-surface-chrome/50 rounded animate-pulse w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
