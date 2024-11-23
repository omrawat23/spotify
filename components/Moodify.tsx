"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import PlaylistResult from "@/components/PlaylistResult"
import { Loader2, Music, Clock, Disc, AudioWaveformIcon as Waveform } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface Song {
  name: string;
  artist: string;
  album?: string;
  year?: string;
  genres?: string[];
  explanation?: string;
  spotifyId?: string;
}

interface RecentTrack {
  name: string;
  artists: { name: string }[];
  album: { name: string; release_date: string };
  id: string;
}

interface MoodMetrics {
  valence: number;
  energy: number;
  danceability: number;
  tempo: number;
}

interface PlaylistResponse {
  playlist: Song[];
  mood: {
    dominant: string;
    metrics: MoodMetrics;
  };
}

export default function Moodify() {
  const [playlist, setPlaylist] = useState<Song[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [userPlaylistName, setUserPlaylistName] = useState("")
  const [recentTracks, setRecentTracks] = useState<RecentTrack[]>([])
  const [loadingRecent, setLoadingRecent] = useState(false)
  const [moodAnalysis, setMoodAnalysis] = useState<{
    dominant: string;
    metrics: MoodMetrics;
  } | null>(null)

  useEffect(() => {
    fetchRecentTracks();
  }, []);

  const fetchRecentTracks = async () => {
    setLoadingRecent(true);
    try {
      const response = await fetch("/api/recent", {
        method: "GET",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please log in to Spotify to view recent tracks");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRecentTracks(data.tracks);
    } catch (error) {
      console.error("Error fetching recent tracks:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch recent tracks");
    } finally {
      setLoadingRecent(false);
    }
  };

  const generatePlaylist = async () => {
    setLoading(true)
    setError("")
    setPlaylist([])
    setMoodAnalysis(null)

    try {
      const response = await fetch("/api/moodify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 401) {
          throw new Error("Please log in to Spotify to continue")
        }
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        )
      }

      const data: PlaylistResponse = await response.json()
      setPlaylist(data.playlist)
      setMoodAnalysis(data.mood)
      setUserPlaylistName(`Your Mood-Based Playlist`)
    } catch (error) {
      console.error("Error generating playlist:", error)
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      )
    } finally {
      setLoading(false)
    }
  }

  const renderRecentTracks = () => {
    if (loadingRecent) {
      return (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-5 w-5 animate-spin text-green-400" />
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {recentTracks.map((track, index) => (
          <div
            key={`${track.id}-${index}`}
            className="flex items-center space-x-2 p-2 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Disc className="h-4 w-4 text-green-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">
                {track.name}
              </p>
              <p className="text-xs text-green-300 truncate">
                {track.artists.map(artist => artist.name).join(", ")}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMoodAnalysis = () => {
    if (!moodAnalysis) return null;

    return (
      <Card className="w-full bg-white/5 border-green-500/20 mb-4">
        <CardHeader className="p-4">
          <CardTitle className="text-lg font-semibold text-green-400 flex items-center gap-2">
            <Waveform className="h-4 w-4" />
            Mood Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-sm font-medium text-white mb-3">
            Dominant Mood: <span className="text-green-400">{moodAnalysis.dominant}</span>
          </p>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(moodAnalysis.metrics).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-green-300 capitalize">{key}</p>
                  <p className="text-xs font-medium text-white">
                    {key === 'tempo' ? Math.round(value) : (value * 100).toFixed(0)}
                    {key === 'tempo' ? ' BPM' : '%'}
                  </p>
                </div>
                <Progress value={key === 'tempo' ? (value / 200) * 100 : value * 100} className="h-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="fixed top-24 right-4 bottom-4 left-[380px] bg-black/80 backdrop-blur-xl rounded-3xl overflow-hidden flex flex-col">
      <ScrollArea className="flex-grow">
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold text-center text-white">
              Mood-Based Playlists <span className="text-green-400">✨</span>
            </h1>
            <p className="text-sm text-green-300 text-center max-w-md mx-auto">
              Generate a personalized playlist based on your current mood and recent listening history.
            </p>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={generatePlaylist}
              disabled={loading}
              className="w-full max-w-xs bg-green-500 hover:bg-green-600 text-black py-2 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ease-in-out"
              aria-label={loading ? "Generating playlist" : "Generate playlist"}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
              ) : (
                <Music className="h-4 w-4 mr-2" aria-hidden="true" />
              )}
              {loading ? "Generating..." : "Generate Playlist"}
            </Button>
          </div>

          {error && (
            <div className="w-full p-3 bg-red-500/20 border border-red-500/50 rounded-md" role="alert">
              <p className="text-red-300 text-xs text-center">{error}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-green-500/20">
              <CardHeader className="p-4">
                <CardTitle className="text-lg font-semibold text-green-400 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Recent Tracks
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {renderRecentTracks()}
              </CardContent>
            </Card>

            {moodAnalysis && renderMoodAnalysis()}
          </div>
          
          {!loading && playlist.length > 0 && (
            <PlaylistResult 
              playlist={playlist} 
              playlistName={userPlaylistName} 
            />
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

