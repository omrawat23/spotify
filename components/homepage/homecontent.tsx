"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import PlaylistResult from "@/components/PlaylistResult"
import { Loader2, Music } from 'lucide-react'
import { FaGithub } from "react-icons/fa"

interface Song {
  name: string
  artist: string
  album?: string
  year?: string
  genres?: string[]
  explanation?: string
}

export default function ScrollableHeroSection() {
  const [inputSong, setInputSong] = useState("")
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
      if (!inputSong.trim()) {
        throw new Error("Please enter a song name")
      }

      const response = await fetch("/api/generate-playlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ song: inputSong }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        )
      }

      const data = await response.json()
      setPlaylist(data.playlist)
      setUserPlaylistName(`Playlist inspired by "${inputSong}"`)
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
    <div className="fixed top-24 right-4 bottom-4 left-[380px] bg-black/80 backdrop-blur-xl rounded-3xl overflow-hidden">
      <ScrollArea className="h-full w-full rounded-md">
        <div className="container mx-auto px-4 py-8">

          <main className="flex flex-col items-center justify-center text-center mt-32">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-green-100">
              Generate Playlists <br className="hidden sm:inline" />
              in Seconds <span className="text-green-400">✨</span>
            </h1>
            <div className="w-full max-w-2xl mt-8">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Enter a song name"
                  value={inputSong}
                  onChange={(e) => setInputSong(e.target.value)}
                  className="w-full bg-green-900/20 text-green-100 pl-4 pr-20 py-6 rounded-xl text-lg placeholder-green-600 focus-visible:ring-1 focus-visible:ring-green-500 focus:border-green-500"
                />
                <Button
                  onClick={generatePlaylist}
                  disabled={loading}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-700 hover:bg-green-600 text-green-100 h-10 px-4 rounded-full flex items-center justify-center text-base"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Generate"
                  )}
                </Button>
              </div>
            </div>

            <div className="mt-8 w-full max-w-2xl">
              {playlist.length === 0 && (
                <div className="w-full">
                  <h3 className="text-xl font-semibold mb-4 text-green-100">
                    Try these suggestions:
                  </h3>
                  <div className="flex flex-wrap justify-center gap-4">
                    {suggestions.map((song, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          setInputSong(`${song.name} by ${song.artist}`)
                        }
                        className="bg-green-700 hover:bg-green-600 text-green-100 px-4 py-2 rounded-full text-sm transition-colors duration-200"
                      >
                        {song.name} - {song.artist}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && <p className="text-red-500 mt-4 mb-7">{error}</p>}
            {!loading && playlist.length > 0 && (
              <PlaylistResult playlist={playlist} playlistName={userPlaylistName} />
            )}
          </main>
        </div>
      </ScrollArea>
    </div>
  )
}

