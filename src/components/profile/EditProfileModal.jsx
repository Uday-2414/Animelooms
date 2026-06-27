import React, { useState, useEffect } from 'react'
import { X, Save, AlertCircle } from 'lucide-react'
import { profileService } from '../../services/profileService'
import Button from '../ui/Button'

export default function EditProfileModal({ isOpen, onClose, userProfile, onProfileUpdated }) {
  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    bio: '',
    theme_accent: 'brand',
    favorite_genres: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const PRESET_THEMES = [
    { value: 'brand', label: 'Crimson (Default)', color: 'bg-brand' },
    { value: 'blue', label: 'Ocean Blue', color: 'bg-blue-500' },
    { value: 'emerald', label: 'Emerald Green', color: 'bg-emerald-500' },
    { value: 'purple', label: 'Royal Purple', color: 'bg-purple-500' },
  ]

  const GENRES = ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Thriller']

  useEffect(() => {
    if (userProfile && isOpen) {
      setFormData({
        username: userProfile.username || '',
        display_name: userProfile.display_name || '',
        bio: userProfile.bio || '',
        theme_accent: userProfile.theme_accent || 'brand',
        favorite_genres: userProfile.favorite_genres || [],
      })
      setError(null)
    }
  }, [userProfile, isOpen])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    // Enforce lowercase alphanumeric for username
    if (name === 'username') {
      const sanitized = value.toLowerCase().replace(/[^a-z0-9_]/g, '')
      setFormData(prev => ({ ...prev, [name]: sanitized }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const toggleGenre = (genre) => {
    setFormData(prev => {
      const genres = prev.favorite_genres.includes(genre)
        ? prev.favorite_genres.filter(g => g !== genre)
        : [...prev.favorite_genres, genre]
      // Limit to 3 favorite genres
      if (genres.length > 3) return prev
      return { ...prev, favorite_genres: genres }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!userProfile?.id) return

    if (formData.username && formData.username.length < 3) {
      setError('Username must be at least 3 characters long.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const updated = await profileService.upsertProfile(userProfile.id, {
        username: formData.username || null,
        display_name: formData.display_name,
        bio: formData.bio,
        theme_accent: formData.theme_accent,
        favorite_genres: formData.favorite_genres,
      })
      onProfileUpdated(updated)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to update profile.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-surface-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden font-ui animate-fade-in flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-surface-chrome/50 shrink-0">
          <h2 className="text-lg font-bold text-white">Edit Profile</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/5">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Username</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">@</span>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  maxLength={20}
                  placeholder="animefan_99"
                  className="w-full bg-surface-chrome border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                />
              </div>
              <p className="text-[10px] text-gray-500">Only lowercase letters, numbers, and underscores.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Display Name</label>
              <input
                type="text"
                name="display_name"
                value={formData.display_name}
                onChange={handleChange}
                maxLength={50}
                placeholder="Your public name"
                className="w-full bg-surface-chrome border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                maxLength={160}
                rows={3}
                placeholder="Tell the community about your anime tastes..."
                className="w-full bg-surface-chrome border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Favorite Genres (Max 3)</label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map(genre => {
                  const isSelected = formData.favorite_genres.includes(genre)
                  const isDisabled = !isSelected && formData.favorite_genres.length >= 3
                  return (
                    <button
                      key={genre}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => toggleGenre(genre)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${isSelected ? 'bg-brand/20 border-brand/50 text-brand' : 'bg-surface-chrome border-white/5 text-gray-400 hover:text-white'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {genre}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Theme Accent</label>
              <div className="flex flex-wrap gap-3">
                {PRESET_THEMES.map(theme => (
                  <button
                    key={theme.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, theme_accent: theme.value }))}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all cursor-pointer ${formData.theme_accent === theme.value ? 'bg-white/10 border-white/20' : 'bg-surface-chrome border-white/5 opacity-70 hover:opacity-100'}`}
                  >
                    <div className={`w-4 h-4 rounded-full ${theme.color}`} />
                    <span className="text-xs font-bold text-white">{theme.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="flex justify-end p-5 border-t border-white/5 bg-surface-chrome/50 gap-3 shrink-0">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="edit-profile-form" variant="primary" isLoading={loading} className="min-w-[100px]">
            <Save className="h-4 w-4 mr-2 inline" />
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}
