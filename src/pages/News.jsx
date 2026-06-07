import React from 'react'
import SectionHeader from '../components/ui/SectionHeader'
import NewsCard from '../components/news/NewsCard'

export default function News() {
  const dummyNews = [
    {
      title: 'AnimeLoom Cinematic SaaS Engine Launched',
      excerpt: 'AnimeLoom goes live with high-performance dashboard interfaces, custom layout features, and database search client sync. Read about the roadmap details here.',
      image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=60',
      date: 'June 07, 2026',
      author: 'Editorial Architect',
      url: 'https://github.com'
    },
    {
      title: 'Premium Dark-Obsidian Styling Principles in Modern Design Systems',
      excerpt: 'Exploring spacing rhythm guidelines, z-axis tonal levels, and typographic serif-sans contrasts to achieve luxury user interfaces.',
      image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
      date: 'June 06, 2026',
      author: 'Staff Designer',
      url: 'https://github.com'
    }
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader 
        title="Industry News" 
        subtitle="Stay updated with anime industry reports and database releases" 
      />

      <div className="space-y-6 max-w-4xl mx-auto w-full">
        {dummyNews.map((newsItem, index) => (
          <NewsCard 
            key={index}
            news={newsItem}
          />
        ))}
      </div>
    </div>
  )
}
