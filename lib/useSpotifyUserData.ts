import { useState, useEffect } from "react";

type SpotifyUser = {
  display_name: string;
  images: { url: string }[];
  product: string;
};

type SavedTracks = {
  total: number;
};

export function useSpotifyUserData() {
  const [userData, setUserData] = useState<SpotifyUser | null>(null);
  const [savedTracks, setSavedTracks] = useState<SavedTracks | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user profile
        const userResponse = await fetch("/api/spotify/user");
        if (!userResponse.ok) throw new Error("Failed to fetch user data");
        const userData = await userResponse.json();
        setUserData(userData);

        // Fetch user's saved tracks
        const savedTracksResponse = await fetch("/api/library");
        if (!savedTracksResponse.ok) throw new Error("Failed to fetch saved tracks");
        const savedTracksData = await savedTracksResponse.json();
        setSavedTracks(savedTracksData);
      } catch (err) {
        setError((err as Error).message || "An unknown error occurred");
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();
  }, []);

  return { userData, savedTracks, error };
}
