import { useState, useContext, useEffect } from 'react'
import { User, Lock, Bell, Camera, Shield, Save, LogOut } from 'lucide-react'
import SectionHeader from '../components/ui/SectionHeader'
import Button from '../components/ui/Button'
import SEO from '../components/seo/SEO'
import AuthContext from '../context/AuthContext'
import { profileService } from '../services/profileService'
import { supabase } from '../services/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState('profile')
  
  // Profile State
  const [bio, setBio] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  
  // Privacy State
  const [publicProfile, setPublicProfile] = useState(true)
  
  // Notification State
  const [emailAlerts, setEmailAlerts] = useState(true)
  
  useEffect(() => {
    if (user) {
      setDisplayName(user.user_metadata?.full_name || user.user_metadata?.name || '')
      profileService.getProfile(user.id).then(p => {
        if (p) {
          setBio(p.bio || '')
          setPublicProfile(p.is_public ?? true)
        }
      })
    }
  }, [user])

  const handleSaveProfile = async () => {
    if (!user) return
    setSaving(true)
    try {
      await profileService.upsertProfile(user.id, { 
        bio: bio.trim(), 
        is_public: publicProfile 
      })
      
      // Update auth metadata if name changed
      if (displayName !== user.user_metadata?.full_name) {
        await supabase.auth.updateUser({
          data: { full_name: displayName }
        })
      }
    } catch (e) {
      console.error('Failed to save settings:', e)
    } finally {
      setTimeout(() => setSaving(false), 500)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const tabs = [
    { id: 'profile', label: 'Public Profile', icon: User },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  return (
    <>
      <SEO title="Settings" description="Manage your AnimeLoom account settings." pathname="/settings" shouldIndex={false} />
      
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16 font-ui">
        <SectionHeader title="Account Settings" subtitle="Manage your profile, privacy, and preferences" />
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Settings Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0 space-y-2">
            {tabs.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all focus-ring hover-lift active-press ${
                    isActive 
                      ? 'bg-brand text-white shadow-glow' 
                      : 'bg-transparent text-gray-400 hover:text-white hover:bg-surface-chrome'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
            
            <div className="pt-8 border-t border-white/5 mt-8">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all focus-ring active-press"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
          
          {/* Settings Content */}
          <div className="flex-grow bg-surface-card border border-white/5 rounded-3xl p-6 md:p-8 min-h-[400px]">
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Public Profile</h3>
                  <p className="text-sm text-gray-400">This information will be displayed publicly so be careful what you share.</p>
                </div>
                
                <div className="flex items-center gap-6 pt-4">
                  <div className="relative group cursor-pointer hover-lift">
                    <img 
                      src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${displayName || 'U'}&background=1d2430&color=ffffff`}
                      alt="Avatar" 
                      className="w-24 h-24 rounded-full border-2 border-surface-chrome object-cover transition-opacity group-hover:opacity-75"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <Button variant="secondary" className="text-xs">Change Avatar</Button>
                    <p className="text-[10px] text-gray-500 mt-2 font-semibold">Uses your Google/Discord avatar by default.</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Display Name</label>
                    <input 
                      type="text" 
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      className="w-full max-w-md bg-surface-chrome border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand/50 transition-colors focus-ring"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Bio</label>
                    <textarea 
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      rows={4}
                      className="w-full bg-surface-chrome border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand/50 transition-colors resize-none focus-ring"
                      placeholder="Tell us about your favorite anime..."
                    />
                    <p className="text-xs text-gray-500 mt-1">{bio.length}/500 characters</p>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'privacy' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Privacy & Security</h3>
                  <p className="text-sm text-gray-400">Manage who can see your activity.</p>
                </div>
                
                <div className="pt-4 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-surface-chrome/40 border border-white/5 rounded-2xl hover:border-white/10 transition-colors">
                    <div>
                      <h4 className="font-bold text-sm text-white">Public Profile</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Allow other users to view your Watchlist and Reviews.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer focus-ring rounded-full">
                      <input type="checkbox" className="sr-only peer" checked={publicProfile} onChange={() => setPublicProfile(!publicProfile)} />
                      <div className="w-11 h-6 bg-surface-card peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-surface-chrome/40 border border-white/5 rounded-2xl opacity-50 cursor-not-allowed">
                    <div>
                      <h4 className="font-bold text-sm text-white flex items-center gap-2">Two-Factor Authentication <Lock className="h-3 w-3" /></h4>
                      <p className="text-xs text-gray-400 mt-0.5">Secure your account with 2FA.</p>
                    </div>
                    <span className="text-xs font-bold text-brand uppercase tracking-widest">Coming Soon</span>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'notifications' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Notifications</h3>
                  <p className="text-sm text-gray-400">Control how we communicate with you.</p>
                </div>
                
                <div className="pt-4 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-surface-chrome/40 border border-white/5 rounded-2xl hover:border-white/10 transition-colors">
                    <div>
                      <h4 className="font-bold text-sm text-white">Email Alerts</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Receive emails about community mentions and replies.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer focus-ring rounded-full">
                      <input type="checkbox" className="sr-only peer" checked={emailAlerts} onChange={() => setEmailAlerts(!emailAlerts)} />
                      <div className="w-11 h-6 bg-surface-card peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
              <Button onClick={handleSaveProfile} disabled={saving} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
