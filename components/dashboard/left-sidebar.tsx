"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, Library, Plus, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useMusic } from "@/contexts/MusicContext";
import { useState, useEffect } from "react";
import { useSpotifyUserData } from "@/lib/useSpotifyUserData";
import Image from "next/image";

export function LeftSidebar() {
  const { playlists, selectedPlaylist, setSelectedPlaylist, isLoading } = useMusic();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPlaylists, setFilteredPlaylists] = useState(playlists);
  const { userData, savedTracks, error } = useSpotifyUserData();

  // Filter playlists based on search query
  useEffect(() => {
    const filtered = playlists.filter((playlist) =>
      playlist.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPlaylists(filtered);
  }, [searchQuery, playlists]);

  // Select the first playlist as default
  useEffect(() => {
    if (playlists.length > 0 && !selectedPlaylist) {
      setSelectedPlaylist(playlists[0]);
    }
  }, [playlists, selectedPlaylist, setSelectedPlaylist]);

  if (isLoading) {
    return (
      <div className="fixed top-24 left-4 bottom-4 w-[340px] bg-black/80 backdrop-blur-xl border border-white/[0.02] rounded-3xl p-4 space-y-4">
        <div className="animate-pulse">
          <div className="h-12 bg-white/10 rounded-full mb-4"></div>
          <div className="h-8 bg-white/10 rounded mb-4"></div>
          <div className="h-8 bg-white/10 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed top-24 left-4 bottom-4 w-[340px] bg-black/80 backdrop-blur-xl border border-white/[0.02] rounded-3xl p-4 space-y-4">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

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

        {/* Library Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Library className="w-5 h-5 text-white/60" />
            <span className="font-semibold text-sm text-white">Your Library</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 hover:bg-white/10 text-white/60"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 hover:bg-white/10 text-white/60"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Statistics Badges */}
        <div className="flex gap-2">
          <Badge
            variant="secondary"
            className="bg-white/[0.07] hover:bg-white/[0.1] text-white border-0 rounded-full"
          >
            {savedTracks?.total || 0} Liked Songs
          </Badge>
          <Badge
            variant="secondary"
            className="bg-white/[0.07] hover:bg-white/[0.1] text-white border-0 rounded-full"
          >
            {playlists.length || 0} Playlists
          </Badge>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-white/40" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in Library"
            className="w-full h-9 pl-8 bg-white/[0.07] hover:bg-white/[0.1] focus:bg-white/[0.1] rounded-md text-sm text-white placeholder:text-white/40 border-0 focus:ring-0 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Playlists */}
      <ScrollArea className="flex-1 px-2 pb-4">
        <div className="p-2 space-y-2">
          {/* Liked Songs */}
          <div
            className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors
              ${selectedPlaylist?.id === "liked" ? "bg-white/10" : "hover:bg-white/[0.07]"}
            `}
            onClick={() =>
              setSelectedPlaylist({
                id: "liked",
                name: "Liked Songs",
                type: "playlist",
                cover: "/placeholder.svg",
              })
            }
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Library className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-medium text-sm text-white">Liked Songs</div>
              <div className="text-xs text-white/60">{savedTracks?.total || 0} songs</div>
            </div>
          </div>

          {/* Filtered Playlists */}
          {filteredPlaylists.map((playlist) => (
            <div
              key={playlist.id}
              onClick={() => setSelectedPlaylist(playlist)}
              className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors
                ${selectedPlaylist?.id === playlist.id ? "bg-white/10" : "hover:bg-white/[0.07]"}
              `}
            >
              <Image
              width={1000}
              height={1000}
                src={playlist?.images?.[0]?.url || "/placeholder.svg"}
                alt={playlist?.name || "Playlist"}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div>
                <div className="font-medium text-sm text-white line-clamp-1">
                  {playlist.name}
                </div>
                <div className="text-xs text-white/60 line-clamp-1">{playlist.type}</div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
