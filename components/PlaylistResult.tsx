"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Copy, ChevronDown, ChevronUp, Music, Disc } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Song {
  name: string;
  artist: string;
  album?: string;
  year?: string;
  genres?: string[];
  explanation?: string;
  spotifyId?: string;
}

interface PlaylistResultProps {
  playlist: Song[];
  playlistName: string; 
}

export default function PlaylistResult({ playlist, playlistName }: PlaylistResultProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const router = useRouter();

  const copyToClipboard = (text: string, index?: number) => {
    navigator.clipboard.writeText(text).then(() => {
      if (index !== undefined) {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      } else {
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
      }
    });
  };

  const copyAllSongs = () => {
    const allSongs = playlist
      .map((song, index) => `${index + 1}. ${song.name} - ${song.artist}`)
      .join("\n");
    copyToClipboard(allSongs);
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const createSpotifyPlaylist = async () => {
    setCreatingPlaylist(true);
    try {
      const createResponse = await fetch("/api/spotify/create-playlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: playlistName,
          description: `Playlist created by AI: ${playlistName}`,
        }),
      });

      if (!createResponse.ok) {
        throw new Error("Failed to create playlist");
      }

      const { id: playlistId } = await createResponse.json();

      const trackUris = playlist
        .map((song) => song.spotifyId ? `spotify:track:${song.spotifyId}` : null)
        .filter(Boolean);

      const addTracksResponse = await fetch(`/api/playlists/${playlistId}/add-tracks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: trackUris,
        }),
      });

      if (!addTracksResponse.ok) {
        const errorData = await addTracksResponse.json();
        throw new Error(errorData.error || "Failed to add tracks to playlist");
      }

      toast({
        title: "Success",
        description: "Playlist created and tracks added successfully!",
      });
    } catch (error) {
      console.error("Error creating Spotify playlist:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create Spotify playlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreatingPlaylist(false);
      router.push('/dashboard');
    }
  };

  return (
    <Card className="w-[1450px] mt-6 md:mt-10 bg-black/80 border border-green-700/50 rounded-xl shadow-lg overflow-hidden">
      <CardHeader className="bg-green-900/30 border-b border-green-700/30 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-green-400 flex items-center">
            <Music className="mr-2 h-6 w-6" />
            {playlistName}
          </CardTitle>
          {playlist.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-green-400 border-green-700 hover:bg-green-700/50 hover:text-green-100"
              onClick={copyAllSongs}
            >
              {copiedAll ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copiedAll ? "Copied!" : "Copy All"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <ScrollArea className="h-[400px]">
          <div className="grid grid-cols-4 gap-4 pb-4">
            {playlist.map((song, index) => (
              <Card key={index} className="bg-green-900/20 border border-green-700/30 shadow-md hover:shadow-lg transition-shadow duration-300 w-[300px] flex-shrink-0">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-700/30 p-2 rounded-full">
                        <Disc className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-100 truncate w-40">{song.name}</h3>
                        <p className="text-sm text-green-400 truncate w-40">{song.artist}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-green-400 hover:bg-green-700/30 hover:text-green-100"
                      onClick={() => copyToClipboard(`${song.name} - ${song.artist}`, index)}
                    >
                      {copiedIndex === index ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pb-2 ">
                  {(song.album || song.year || song.genres) && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {song.album && <Badge variant="secondary" className="bg-green-700/20 text-green-300">{song.album}</Badge>}
                      {song.year && <Badge variant="secondary" className="bg-green-700/20 text-green-300">{song.year}</Badge>}
                      {song.genres && song.genres.map((genre, i) => (
                        <Badge key={i} variant="secondary" className="bg-green-700/20 text-green-300">{genre}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
                {song.explanation && (
                  <CardFooter className="pt-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-green-400 hover:bg-green-700/30 hover:text-green-100 justify-between"
                      onClick={() => toggleExpand(index)}
                    >
                      {expandedIndex === index ? "Hide explanation" : "Show explanation"}
                      {expandedIndex === index ? (
                        <ChevronUp className="h-4 w-4 ml-2" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-2" />
                      )}
                    </Button>
                    {expandedIndex === index && (
                      <p className="mt-2 text-sm text-green-200">{song.explanation}</p>
                    )}
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="bg-green-900/30 border-t border-green-700/30">
        <Button
          onClick={createSpotifyPlaylist}
          disabled={creatingPlaylist}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2"
        >
          {creatingPlaylist ? "Creating Playlist..." : "Create Spotify Playlist"}
        </Button>
      </CardFooter>
    </Card>
  );
}

