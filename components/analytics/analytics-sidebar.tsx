"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BarChart3, Clock, Headphones, ListMusic, Music2, Search, Star, Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAnalytics } from "@/contexts/AnalyticsContext"
import { useSpotifyUserData } from "@/lib/useSpotifyUserData";

export function AnalyticsSidebar() {
  const { userData, savedTracks, error } = useSpotifyUserData();
  const { currentView, setCurrentView } = useAnalytics()
  const [searchQuery, setSearchQuery] = useState('')

  const analyticsViews = [
    {
      id: 'top-tracks',
      name: 'Top Tracks',
      icon: Music2,
      description: 'Your most played tracks'
    },
    {
      id: 'top-artists',
      name: 'Top Artists',
      icon: Users,
      description: 'Your favorite artists'
    },
    {
      id: 'recent',
      name: 'Recently Played',
      icon: Clock,
      description: 'Your listening history'
    },
    {
      id: 'genres',
      name: 'Genre Analysis',
      icon: ListMusic,
      description: 'Your music taste by genre'
    },
    {
      id: 'listening-time',
      name: 'Listening Time',
      icon: Headphones,
      description: 'Your listening patterns'
    },
    {
      id: 'popularity',
      name: 'Popularity Analysis',
      icon: BarChart3,
      description: 'Mainstream vs. Niche'
    },
    {
      id: 'recommendations',
      name: 'Recommendations',
      icon: Star,
      description: 'Personalized suggestions'
    }
  ]

  return (
    <div className="fixed top-24 left-4 bottom-4 w-[340px] bg-black/80 backdrop-blur-xl border border-white/[0.02] rounded-3xl flex flex-col">
      <div className="p-4 space-y-4">
        {/* User Profile */}
        <div className="flex items-center gap-3 px-2 py-1 rounded-xl bg-white/[0.03]">
          <Avatar className="h-8 w-8">
            <AvatarImage src={userData?.images?.[0]?.url || "/placeholder.svg"} />
            <AvatarFallback>{userData?.display_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-sm text-white">{userData?.display_name}</div>
            <div className="text-xs text-white/60">
              {userData?.product === "premium" ? "Premium" : "Free"} Plan
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-white/40" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search analytics"
            className="w-full h-9 pl-8 bg-white/[0.07] hover:bg-white/[0.1] focus:bg-white/[0.1] rounded-md text-sm text-white placeholder:text-white/40 border-0 focus:ring-0 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Analytics Views */}
      <ScrollArea className="flex-1 px-2">
        <div className="p-2 space-y-2">
          {analyticsViews
            .filter(view => 
              view.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              view.description.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((view) => (
              <button
                key={view.id}
                onClick={() => setCurrentView(view.id as AnalyticsView)}
                className={`w-full flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors
                  ${currentView === view.id ? 'bg-white/10' : 'hover:bg-white/[0.07]'}
                `}
              >
                <div className="w-10 h-10 rounded-lg bg-white/[0.07] flex items-center justify-center">
                  <view.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm text-white">{view.name}</div>
                  <div className="text-xs text-white/60">{view.description}</div>
                </div>
              </button>
            ))}
        </div>
      </ScrollArea>
    </div>
  )
}

