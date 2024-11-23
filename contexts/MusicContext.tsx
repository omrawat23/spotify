import React, { createContext, useState, useContext, useEffect } from 'react';

type SpotifyImage = {
  url: string;
  height: number;
  width: number;
};

type Playlist = {
  id: string;
  name: string;
  type: string;
  images: SpotifyImage[];
};

type Song = {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    images: SpotifyImage[];
  };
  duration_ms: number;
  popularity: number;
};

type MusicContextType = {
  selectedPlaylist: Playlist | null;
  setSelectedPlaylist: (playlist: Playlist | null) => void;
  currentSong: Song | null;
  setCurrentSong: (song: Song | null) => void;
  playlists: Playlist[];
  songs: Song[];
  isLoading: boolean;
  error: string | null;
};

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch playlists
  useEffect(() => {
    const fetchPlaylists = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/playlists');
        if (!response.ok) {
          throw new Error('Failed to fetch playlists');
        }
        const data = await response.json();
        setPlaylists(data.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch playlists');
        console.error('Error fetching playlists:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  // Fetch songs when a playlist is selected
  useEffect(() => {
    const fetchPlaylistTracks = async () => {
      if (!selectedPlaylist?.id) {
        setSongs([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/playlists/${selectedPlaylist.id}/tracks`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch tracks');
        }
        const data = await response.json();
        
        // Transform the tracks data to match our Song type
        const transformedTracks = data.items
          .filter((item: any) => item?.track && item.track.id) // Filter out null tracks or tracks without IDs
          .map((item: any, index: number) => ({
            id: `${item.track.id}-${index}`, // Add index to make keys unique
            name: item.track.name || 'Unknown Track',
            artists: item.track.artists || [{ name: 'Unknown Artist' }],
            album: {
              images: item.track.album?.images || []
            },
            duration_ms: item.track.duration_ms || 0,
            popularity: item.track.popularity || 0
          }));

        setSongs(transformedTracks);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tracks');
        console.error('Error fetching tracks:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylistTracks();
    console.log(selectedPlaylist)
  }, [selectedPlaylist]);

  // Format duration from milliseconds to mm:ss
  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
  };

  // Format song data for display
  const formattedSongs = songs.map(song => ({
    ...song,
    formattedDuration: formatDuration(song.duration_ms),
    mainArtist: song.artists[0]?.name || 'Unknown Artist',
    coverUrl: song.album.images[0]?.url || '/placeholder.svg'
  }));

  return (
    <MusicContext.Provider 
      value={{ 
        selectedPlaylist, 
        setSelectedPlaylist, 
        currentSong, 
        setCurrentSong, 
        playlists,
        songs: formattedSongs,
        isLoading,
        error
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};

export const usePlaylistTracks = (playlistId: string) => {
  const { songs, isLoading, error } = useMusic();
  return {
    tracks: songs,
    isLoading,
    error
  };
};