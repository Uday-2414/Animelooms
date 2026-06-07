import React from 'react'
import { User, Mail, Shield } from 'lucide-react'

/**
 * ProfileCard component aligned with AnimeLoom's premium layout rules
 * @param {Object} props
 * @param {Object} props.user - The user object from supabase auth
 * @param {string} props.user.name
 * @param {string} props.user.email
 * @param {string} [props.user.avatar_url]
 * @param {string} [props.user.role='Otaku Elite']
 * @param {React.ReactNode} [props.stats] - Quick statistics metrics
 */
export default function ProfileCard({
  user,
  stats,
  className = ''
}) {
  const { name, email, avatar_url, role = 'Otaku Member' } = user

  return (
    <div className={`bg-surface-card border border-white/5 rounded-2xl overflow-hidden shadow-xl ${className}`}>
      {/* Visual Banner */}
      <div className="h-32 bg-gradient-to-r from-brand to-brand/40 relative">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
      </div>

      {/* Profile Details Container */}
      <div className="relative px-6 pb-6 flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16">
        {/* Avatar */}
        <div className="w-28 h-28 rounded-2xl border-4 border-surface-card bg-surface-chrome overflow-hidden flex-shrink-0 shadow-lg">
          {avatar_url ? (
            <img src={avatar_url} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <User className="h-12 w-12" />
            </div>
          )}
        </div>

        {/* User Credentials */}
        <div className="flex-grow space-y-1 mb-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-bold text-white font-ui">{name}</h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand/20 text-white border border-brand/30">
              <Shield className="h-3 w-3" />
              {role}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-400 font-ui">
            <Mail className="h-4 w-4 text-gray-500" />
            <span>{email}</span>
          </div>
        </div>
      </div>

      {/* Embedded statistics layout */}
      {stats && (
        <div className="border-t border-white/5 bg-surface-chrome/40 p-6">
          {stats}
        </div>
      )}
    </div>
  )
}
