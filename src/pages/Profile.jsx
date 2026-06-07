import React from 'react'
import SectionHeader from '../components/ui/SectionHeader'
import ProfileCard from '../components/profile/ProfileCard'
import StatsCard from '../components/ui/StatsCard'
import { PlayCircle, Award, Hourglass } from 'lucide-react'

export default function Profile() {
  const dummyUser = {
    name: 'Sora Kurosawa',
    email: 'sora@animeloom.app',
    avatar_url: null,
    role: 'Otaku Architect'
  }

  const profileStats = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatsCard 
        label="Anime Watched" 
        value="142" 
        icon={<PlayCircle className="h-5 w-5" />} 
        description="Total series cataloged"
      />
      <StatsCard 
        label="Time Spent" 
        value="48.5h" 
        icon={<Hourglass className="h-5 w-5" />} 
        description="Hours of cinematic media"
      />
      <StatsCard 
        label="Rank Tier" 
        value="Gold" 
        icon={<Award className="h-5 w-5" />} 
        description="Profile ranking status"
      />
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader 
        title="My Profile" 
        subtitle="Manage user configurations and review status analytics" 
      />

      <div className="max-w-4xl mx-auto w-full">
        <ProfileCard 
          user={dummyUser}
          stats={profileStats}
        />
      </div>
    </div>
  )
}
