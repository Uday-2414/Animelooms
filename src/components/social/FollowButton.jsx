import React, { useState, useEffect, useContext } from 'react'
import { UserPlus, UserMinus, UserCheck, Loader2 } from 'lucide-react'
import AuthContext from '../../context/AuthContext'
import socialService from '../../services/socialService'
import Button from '../ui/Button'

export default function FollowButton({ targetUserId, onFollowChange, variant = 'primary', className = '' }) {
  const { user } = useContext(AuthContext)
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function checkStatus() {
      if (!user || !targetUserId || user.id === targetUserId) {
        if (isMounted) setLoading(false)
        return
      }

      try {
        const following = await socialService.checkIsFollowing(user.id, targetUserId)
        if (isMounted) {
          setIsFollowing(following)
          setLoading(false)
        }
      } catch (e) {
        if (isMounted) setLoading(false)
      }
    }

    checkStatus()

    return () => { isMounted = false }
  }, [user, targetUserId])

  const toggleFollow = async () => {
    if (!user) return // Redirect to login could go here
    if (user.id === targetUserId) return

    setLoading(true)
    const previousState = isFollowing

    // Optimistic UI Update
    setIsFollowing(!previousState)
    if (onFollowChange) onFollowChange(!previousState)

    try {
      if (previousState) {
        await socialService.unfollowUser(user.id, targetUserId)
      } else {
        await socialService.followUser(user.id, targetUserId)
      }
    } catch (e) {
      // Revert on failure
      setIsFollowing(previousState)
      if (onFollowChange) onFollowChange(previousState)
    } finally {
      setLoading(false)
    }
  }

  // Don't render button for oneself or unauthenticated users
  if (!user || user.id === targetUserId) return null

  if (loading) {
    return (
      <Button variant="ghost" disabled className={`min-w-[100px] ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    )
  }

  if (isFollowing) {
    return (
      <Button 
        variant="ghost" 
        onClick={toggleFollow} 
        className={`group bg-surface-chrome/50 hover:bg-red-500/10 hover:text-red-400 border border-white/5 hover:border-red-500/20 text-gray-300 min-w-[100px] ${className}`}
      >
        <UserCheck className="h-4 w-4 mr-1.5 group-hover:hidden" />
        <UserMinus className="h-4 w-4 mr-1.5 hidden group-hover:block" />
        <span className="group-hover:hidden">Following</span>
        <span className="hidden group-hover:inline">Unfollow</span>
      </Button>
    )
  }

  return (
    <Button 
      variant={variant} 
      onClick={toggleFollow} 
      className={`min-w-[100px] ${className}`}
    >
      <UserPlus className="h-4 w-4 mr-1.5" />
      Follow
    </Button>
  )
}
