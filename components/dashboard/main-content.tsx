"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight, Heart, MoreHorizontal, Play } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { useMusic } from "@/contexts/MusicContext"
import Image from "next/image"

export function MainContent() {
  const { selectedPlaylist, songs, setCurrentSong, currentSong } = useMusic();

  return (
    <div className="fixed top-24 right-4 bottom-4 left-[380px] bg-black/80 backdrop-blur-xl rounded-3xl overflow-hidden">
      <div className="sticky top-0 z-10 p-4 flex items-center gap-2 bg-black/20">
        <Button variant="ghost" size="icon" className="w-8 h-8 bg-black/20 text-white rounded-full">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="w-8 h-8 bg-black/20 text-white rounded-full">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="relative mx-4 mt-2 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-lime-400/80 to-lime-500/80 backdrop-blur-sm" />
        <div className="relative p-8 flex items-end gap-6">
        {selectedPlaylist?.images?.[0]?.url ? (
          <Image
          width={1000}
          height={1000}
            src={selectedPlaylist.images[0].url}
            alt="Playlist Cover"
            className="w-52 h-52 object-cover shadow-xl rounded-2xl"
          />
        ) : (
          <div className="w-52 h-52 flex items-center justify-center bg-gray-700 text-white shadow-xl rounded-2xl">
            No Image Available
          </div>
        )}
          <div className="mb-4 z-10">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-black/20 text-white backdrop-blur-sm">
                Playlist
              </Badge>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-md">
              {selectedPlaylist?.name || "Select a Playlist"}
            </h1>
            <div className="text-sm text-white/80">
              {selectedPlaylist?.type || "No playlist selected"}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          {/* <Button size="lg" className="rounded-full bg-lime-500 hover:bg-lime-600">
            <Play className="w-5 h-5 mr-2" /> Play
          </Button>
          <Button variant="outline" size="lg" className="rounded-full border-white/10">
            Follow
          </Button> */}
        </div>
        
        <ScrollArea className="h-[calc(100vh-520px)]">
          <div className="space-y-2 px-2">
            {songs.map((song, index) => (
              <div
                key={song.id}
                className={`flex items-center gap-4 p-2 hover:bg-white/10 rounded-xl group transition-colors cursor-pointer ${
                  currentSong?.id === song.id ? 'bg-white/20' : ''
                }`}
                onClick={() => setCurrentSong(song)}
              >
                <div className="w-6 text-white/60">{index + 1}</div>
                <Image
                width={1000}
                height={1000} 
                  src={song.album.images[0].url} 
                  alt={song.name} 
                  className="w-12 h-12 rounded-xl" 
                />
                <div className="flex-1">
                  <div className="font-medium text-white">{song.name}</div>
                  <div className="text-sm text-white/60">
                    {song.artists[0]?.name} plays
                  </div>
                </div>
                <div className="text-sm text-white/60">{song.duration}</div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 text-white/60 hover:text-white"
                >
                  <Heart className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 text-white/60 hover:text-white"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

