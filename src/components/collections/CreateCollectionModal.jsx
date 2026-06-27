import React, { useState } from 'react'
import { X, Save, AlertCircle } from 'lucide-react'
import { collectionService } from '../../services/collectionService'
import Button from '../ui/Button'

export default function CreateCollectionModal({ isOpen, onClose, userId, onCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_public: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!userId) return
    
    if (!formData.title.trim()) {
      setError('Title is required.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const newCollection = await collectionService.createCollection(userId, formData)
      onCreated(newCollection)
      setFormData({ title: '', description: '', is_public: true })
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to create collection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-surface-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden font-ui animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-surface-chrome/50">
          <h2 className="text-lg font-bold text-white">Create New Collection</h2>
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
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Collection Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              maxLength={100}
              placeholder="e.g., Best Romance Anime"
              required
              className="w-full bg-surface-chrome border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              maxLength={300}
              rows={3}
              placeholder="What is this collection about?"
              className="w-full bg-surface-chrome border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="is_public" checked={formData.is_public} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-surface-chrome peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
              <span className="ml-3 text-sm font-medium text-gray-300">Make collection public</span>
            </label>
          </div>

          <div className="flex justify-end pt-4 gap-3 border-t border-white/5 mt-6">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={loading}>
              <Save className="h-4 w-4 mr-2 inline" />
              Create Collection
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
