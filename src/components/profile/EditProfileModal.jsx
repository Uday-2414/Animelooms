import React, { useState, useEffect } from 'react'
import { X, Save, AlertCircle } from 'lucide-react'
import { profileService } from '../../services/profileService'
import Button from '../ui/Button'

export default function EditProfileModal({ isOpen, onClose, userProfile, onProfileUpdated }) {
  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    bio: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (userProfile && isOpen) {
      setFormData({
        username: userProfile.username || '',
        display_name: userProfile.display_name || '',
        bio: userProfile.bio || '',
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
        bio: formData.bio
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
      
      <div className="relative w-full max-w-lg bg-surface-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden font-ui animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-surface-chrome/50">
          <h2 className="text-lg font-bold text-white">Edit Profile</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/5">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
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

          <div className="flex justify-end pt-4 gap-3">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={loading} className="min-w-[100px]">
              <Save className="h-4 w-4 mr-2 inline" />
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
