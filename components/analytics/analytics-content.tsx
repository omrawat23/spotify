"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAnalytics } from "@/contexts/AnalyticsContext"

export function AnalyticsContent() {
  const { currentView, timeRange, setTimeRange, data, loading, error } = useAnalytics()

  const viewTitles: Record<string, { title: string; description: string }> = {
    'top-tracks': {
      title: 'Top Tracks',
      description: 'Your most played songs across different time periods'
    },
    'top-artists': {
      title: 'Top Artists',
      description: 'Artists you listen to the most'
    },
    'recent': {
      title: 'Recently Played',
      description: 'Your listening history and patterns'
    },
    'genres': {
      title: 'Genre Analysis',
      description: 'Breakdown of your music taste by genre'
    },
    'listening-time': {
      title: 'Listening Time',
      description: 'When and how much you listen'
    },
    'popularity': {
      title: 'Popularity Analysis',
      description: 'How mainstream or unique your taste is'
    },
    'recommendations': {
      title: 'Recommendations',
      description: 'Songs and artists you might like'
    }
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-white/[0.03] border-white/[0.05]">
              <CardHeader>
                <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                <div className="h-3 w-32 bg-white/10 rounded animate-pulse mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-white/10 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    if (error) {
      return <div className="text-white">{error}</div>
    }

    if (!data) {
      return <div className="text-white">No data available. Please try again.</div>
    }

    switch (currentView) {
      case 'top-tracks':
      case 'top-artists':
      case 'recent':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(data.items || []).slice(0, 9).map((item: any, index: number) => (
              <Card key={item.id} className="bg-white/[0.03] border-white/[0.05]">
                <CardHeader>
                  <CardTitle className="text-white">
                    #{index + 1} {currentView === 'top-artists' ? 'Artist' : 'Track'}
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    {currentView === 'recent' && item.played_at
                      ? 'Played ' + new Date(item.played_at).toLocaleString()
                      : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-white">
                  <div className="flex items-center gap-4">
                    <img
                      src={currentView === 'top-artists' 
                        ? (item.images && item.images[0] ? item.images[0].url : '/placeholder.svg') 
                        : (item.album && item.album.images && item.album.images[0] ? item.album.images[0].url : '/placeholder.svg')}
                      alt={currentView === 'top-artists' ? item.name : (item.album ? item.album.name : 'Album')}
                      className="w-16 h-16 rounded-lg"
                    />
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-white/60">
                        {currentView === 'top-artists' 
                          ? `Popularity: ${item.popularity || 'N/A'}` 
                          : (item.artists ? item.artists.map((artist: any) => artist.name).join(', ') : 'Unknown Artist')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      case 'genres':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Array.isArray(data) ? data : []).slice(0, 9).map(([genre, count]: [string, number], index: number) => (
              <Card key={genre} className="bg-white/[0.03] border-white/[0.05]">
                <CardHeader>
                  <CardTitle className="text-white">#{index + 1} Genre</CardTitle>
                </CardHeader>
                <CardContent className="text-white">
                  <div className="font-medium">{genre}</div>
                  <div className="text-sm text-white/60">Count: {count}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      case 'listening-time':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(data || {}).map(([hour, count]: [string, any]) => (
              <Card key={hour} className="bg-white/[0.03] border-white/[0.05]">
                <CardHeader>
                  <CardTitle className="text-white">{hour}:00 - {hour}:59</CardTitle>
                </CardHeader>
                <CardContent className="text-white">
                  <div className="font-medium">Tracks played: {count}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      case 'popularity':
        return (
          <Card className="bg-white/[0.03] border-white/[0.05]">
            <CardHeader>
              <CardTitle className="text-white">Popularity Analysis</CardTitle>
            </CardHeader>
            <CardContent className="text-white">
              <div className="font-medium">Average Popularity: {data.averagePopularity ? data.averagePopularity.toFixed(2) : 'N/A'}</div>
              <div className="text-sm text-white/60">
                {data.averagePopularity > 70 ? "Your taste is quite mainstream!" : 
                 data.averagePopularity > 50 ? "You have a balanced taste in music." : 
                 data.averagePopularity ? "You tend to prefer more niche music!" :
                 "Not enough data to determine your music taste."}
              </div>
            </CardContent>
          </Card>
        )
      case 'recommendations':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {((data.tracks && Array.isArray(data.tracks)) ? data.tracks : []).slice(0, 9).map((track: any, index: number) => (
              <Card key={track.id} className="bg-white/[0.03] border-white/[0.05]">
                <CardHeader>
                  <CardTitle className="text-white">Recommendation #{index + 1}</CardTitle>
                </CardHeader>
                <CardContent className="text-white">
                  <div className="flex items-center gap-4">
                    <img
                      src={track.album && track.album.images && track.album.images[0] ? track.album.images[0].url : '/placeholder.svg'}
                      alt={track.album ? track.album.name : 'Album'}
                      className="w-16 h-16 rounded-lg"
                    />
                    <div>
                      <div className="font-medium">{track.name}</div>
                      <div className="text-sm text-white/60">{track.artists ? track.artists.map((artist: any) => artist.name).join(', ') : 'Unknown Artist'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      default:
        return <div className="text-white">Select a view to see analytics</div>
    }
  }

  return (
    <div className="fixed top-24 right-4 bottom-4 left-[380px] bg-black/80 backdrop-blur-xl rounded-3xl overflow-hidden">
      <div className="sticky top-0 z-10 p-4 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="w-8 h-8 bg-black/20 text-white rounded-full">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8 bg-black/20 text-white rounded-full">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant={timeRange === 'short_term' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setTimeRange('short_term')}
            className="text-white"
          >
            Last 4 Weeks
          </Button>
          <Button
            variant={timeRange === 'medium_term' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setTimeRange('medium_term')}
            className="text-white"
          >
            Last 6 Months
          </Button>
          <Button
            variant={timeRange === 'long_term' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setTimeRange('long_term')}
            className="text-white"
          >
            All Time
          </Button>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            {viewTitles[currentView]?.title}
          </h1>
          <p className="text-white/60">
            {viewTitles[currentView]?.description}
          </p>
        </div>

        <ScrollArea className="h-[calc(100vh-220px)]">
          {renderContent()}
        </ScrollArea>
      </div>
    </div>
  )
}
