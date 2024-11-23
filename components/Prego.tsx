"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import PlaylistResult from "@/components/PlaylistResult"
import { Loader2, Music, Sparkles } from 'lucide-react'
import { FaGithub } from "react-icons/fa"

interface Song {
  name: string
  artist: string
  album?: string
  year?: string
  genres?: string[]
  explanation?: string
  spotifyId?: string
}

export default function Prego() {
  const [inputSong1, setInputSong1] = useState("")
  const [inputSong2, setInputSong2] = useState("")
  const [playlist, setPlaylist] = useState<Song[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [suggestions, setSuggestions] = useState<Song[]>([])
  const [userPlaylistName, setUserPlaylistName] = useState("")

  const allSongs: Song[] = [
    { name: "Bohemian Rhapsody", artist: "Queen" },
    { name: "Imagine", artist: "John Lennon" },
    { name: "Like a Rolling Stone", artist: "Bob Dylan" },
    { name: "Smells Like Teen Spirit", artist: "Nirvana" },
    { name: "Billie Jean", artist: "Michael Jackson" },
    { name: "Hey Jude", artist: "The Beatles" },
    { name: "Purple Rain", artist: "Prince" },
    { name: "Stairway to Heaven", artist: "Led Zeppelin" },
    { name: "What's Going On", artist: "Marvin Gaye" },
    { name: "Respect", artist: "Aretha Franklin" },
    { name: "Born to Run", artist: "Bruce Springsteen" },
    { name: "Hotel California", artist: "Eagles" },
    { name: "Good Vibrations", artist: "The Beach Boys" },
    { name: "London Calling", artist: "The Clash" },
    { name: "Waterloo Sunset", artist: "The Kinks" },
  ]

  useEffect(() => {
    const getRandomSuggestions = (count: number) => {
      const shuffled = [...allSongs].sort(() => 0.5 - Math.random())
      return shuffled.slice(0, count)
    }

    setSuggestions(getRandomSuggestions(3))

    const interval = setInterval(() => {
      setSuggestions(getRandomSuggestions(6))
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const generatePlaylist = async () => {
    setLoading(true)
    setError("")
    setPlaylist([])

    try {
      if (!inputSong1.trim() || !inputSong2.trim()) {
        throw new Error("Please enter both song names")
      }

      const response = await fetch("/api/generate-prego", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          songs: [inputSong1, inputSong2] // Updated to match new API structure
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        )
      }

      const data = await response.json()
      setPlaylist(data.playlist)
      setUserPlaylistName(`Fusion of "${inputSong1}" & "${inputSong2}"`)
    } catch (error) {
      console.error("Error generating playlist:", error)
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed top-24 right-4 bottom-4 left-[380px] bg-black/80 backdrop-blur-xl rounded-3xl overflow-hidden flex flex-col">
      <ScrollArea className="flex-grow">
        <div className="container mx-auto px-4 py-8 min-h-full">
          <header className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-green-100">
              Playlist Fusion <Sparkles className="inline-block text-yellow-400" />
            </h1>
            <p className="text-xl text-green-300">Blend two songs into a unique playlist experience</p>
          </header>

          <Card className="bg-black/50 backdrop-blur-xl border-green-700/50 max-w-2xl mx-auto">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Enter first song name"
                  value={inputSong1}
                  onChange={(e) => setInputSong1(e.target.value)}
                  className="bg-green-900/20 text-green-100 placeholder-green-500 border-green-700 focus:border-green-500 focus:ring-green-500"
                />
                <Input
                  type="text"
                  placeholder="Enter second song name"
                  value={inputSong2}
                  onChange={(e) => setInputSong2(e.target.value)}
                  className="bg-green-900/20 text-green-100 placeholder-green-500 border-green-700 focus:border-green-500 focus:ring-green-500"
                />
                <Button
                  onClick={generatePlaylist}
                  disabled={loading}
                  className="w-full bg-green-700 hover:bg-green-600 text-green-100"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <Music className="h-5 w-5 mr-2" />
                  )}
                  {loading ? "Creating Fusion..." : "Generate Fusion Playlist"}
                </Button>
              </div>

              {error && (
                <p className="text-red-500 mt-4 text-center bg-red-900/20 p-2 rounded">{error}</p>
              )}
            </CardContent>
          </Card>

          {playlist.length === 0 && !loading && (
            <Card className="mt-8 bg-black/30 backdrop-blur-sm border-green-700/30 max-w-2xl mx-auto">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-green-100">
                  Need inspiration? Try these:
                </h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestions.map((song, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => {
                        if (!inputSong1) {
                          setInputSong1(`${song.name} by ${song.artist}`)
                        } else if (!inputSong2) {
                          setInputSong2(`${song.name} by ${song.artist}`)
                        }
                      }}
                      className="bg-green-800/20 hover:bg-green-700/30 text-green-100 border-green-600"
                    >
                      {song.name} - {song.artist}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {!loading && playlist.length > 0 && (
            <div className="mt-8 space-y-4 pb-8">
              <Card className="bg-black/30 backdrop-blur-sm border-green-700/30 max-w-4xl mx-auto">
                <CardContent className="p-6">
                  <PlaylistResult playlist={playlist} playlistName={userPlaylistName} />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}