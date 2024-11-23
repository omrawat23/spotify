"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, Library, Plus, Search, Music, Headphones, Mic2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useMusic } from "@/contexts/MusicContext";
import { useSpotifyUserData } from "@/lib/useSpotifyUserData";

export function LeftSidebar() {
  const router = useRouter();
  // const { playlists } = useMusic();
  const { userData, savedTracks, error } = useSpotifyUserData();

  return (
    <div className="fixed top-24 left-4 bottom-4 w-[340px] bg-black/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl flex flex-col overflow-hidden">
      <div className="p-6 space-y-6">
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
            {/* {playlists.length || 0} Playlists */}
          </Badge>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            placeholder="Search in Library"
            className="w-full h-11 pl-10 bg-white/[0.07] hover:bg-white/[0.1] focus:bg-white/[0.1] rounded-xl text-sm text-white placeholder:text-white/40 border-0 focus:ring-1 focus:ring-primary focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Playlists */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-1">
          <h3 className="px-2 mb-2 text-sm font-semibold text-white/60">Your Playlists</h3>
          <PlaylistButton 
            icon={<Mic2 className="w-4 h-4" />}
            label="AI Playlist"
            onClick={() => router.push("/dashboard/ai-playlist")}
          />
          <PlaylistButton 
            icon={<Music className="w-4 h-4" />}
            label="Prego Mix"
            onClick={() => router.push("/dashboard/prego")}
          />
          <PlaylistButton 
            icon={<Headphones className="w-4 h-4" />}
            label="Moodify"
            onClick={() => router.push("/dashboard/moodify")}
          />
        </div>
      </ScrollArea>

      {/* Create New Playlist Button */}
      <div className="p-4">
        <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => {}}>
          <Plus className="w-4 h-4 mr-2" /> Create New Playlist
        </Button>
      </div>
    </div>
  );
}

function PlaylistButton({ icon, label, onClick }) {
  return (
    <Button
      variant="ghost"
      className="w-full justify-start px-2 py-4 text-white/80 hover:text-white hover:bg-white/[0.08] transition-all rounded-xl"
      onClick={onClick}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </Button>
  );
}

