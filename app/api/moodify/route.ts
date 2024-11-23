import { GoogleGenerativeAI, GenerateContentResult } from "@google/generative-ai";
import { NextResponse } from 'next/server';

interface Song {
  name: string;
  artist: string;
  album?: string;
  year?: string;
  genres?: string[];
  explanation?: string;
  spotifyId?: string;
}

interface SpotifyTrack {
  name: string;
  artists: { name: string }[];
  album: { name: string; release_date: string };
  id: string;
}

const MAX_RETRIES = 4;
const TIMEOUT = 120000; // 120 seconds

async function getSpotifyAccessToken(): Promise<string | null> {
  const basic = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    console.error("Failed to get Spotify access token");
    return null;
  }

  const data = await response.json();
  return data.access_token;
}

async function getRecentTracks(accessToken: string): Promise<SpotifyTrack[]> {
  try {
    const response = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=5", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.items.map((item: any) => item.track);
  } catch (error) {
    console.error("Error fetching recent tracks:", error);
    throw error;
  }
}

async function getTrackFeatures(trackId: string, accessToken: string) {
  try {
    const response = await fetch(`https://api.spotify.com/v1/audio-features/${trackId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching track features:", error);
    throw error;
  }
}

async function analyzeMood(tracks: SpotifyTrack[], accessToken: string) {
  const features = await Promise.all(
    tracks.map((track) => getTrackFeatures(track.id, accessToken))
  );

  const avgFeatures = features.reduce(
    (acc, feat) => ({
      valence: acc.valence + feat.valence,
      energy: acc.energy + feat.energy,
      danceability: acc.danceability + feat.danceability,
      tempo: acc.tempo + feat.tempo,
    }),
    { valence: 0, energy: 0, danceability: 0, tempo: 0 }
  );

  const count = features.length;
  const mood = {
    valence: avgFeatures.valence / count,
    energy: avgFeatures.energy / count,
    danceability: avgFeatures.danceability / count,
    tempo: avgFeatures.tempo / count,
  };

  let dominantMood = "";
  if (mood.valence > 0.6 && mood.energy > 0.6) {
    dominantMood = "upbeat and energetic";
  } else if (mood.valence > 0.6 && mood.energy <= 0.6) {
    dominantMood = "happy and relaxed";
  } else if (mood.valence <= 0.4 && mood.energy > 0.6) {
    dominantMood = "intense and moody";
  } else if (mood.valence <= 0.4 && mood.energy <= 0.6) {
    dominantMood = "melancholic and calm";
  } else {
    dominantMood = "balanced and moderate";
  }

  return { mood, dominantMood };
}

async function searchSpotifyTrack(song: Song, accessToken: string): Promise<string | undefined> {
  const query = `${song.name} ${song.artist}`;
  const encodedQuery = encodeURIComponent(query);
  const url = `https://api.spotify.com/v1/search?q=${encodedQuery}&type=track&limit=1`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.tracks.items.length > 0) {
      return data.tracks.items[0].id;
    }
  } catch (error) {
    console.error("Error searching Spotify:", error);
  }

  return undefined;
}

function sanitizeJSONString(jsonString: string): string {
  const jsonStart = jsonString.indexOf('[');
  const jsonEnd = jsonString.lastIndexOf(']') + 1;
  if (jsonStart === -1 || jsonEnd === 0) {
    throw new Error("Invalid JSON structure");
  }
  return jsonString.slice(jsonStart, jsonEnd);
}

export async function POST(request: Request) {
  let retries = 0;

  try {
    const accessToken = await getSpotifyAccessToken();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Failed to obtain Spotify access token" },
        { status: 401 }
      );
    }

    while (retries <= MAX_RETRIES) {
      try {
        const recentTracks = await getRecentTracks(accessToken);
        const { mood, dominantMood } = await analyzeMood(recentTracks, accessToken);

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error("GEMINI_API_KEY is not set");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const recentTracksString = recentTracks
          .map((track) => `${track.name} by ${track.artists[0].name}`)
          .join(", ");

        const prompt = `Create a curated playlist of 10 songs that match the mood and style of these recently played tracks: ${recentTracksString}. 
        The overall mood analysis shows: ${dominantMood} (Valence: ${mood.valence.toFixed(2)}, Energy: ${mood.energy.toFixed(2)}, 
        Danceability: ${mood.danceability.toFixed(2)}, Average Tempo: ${mood.tempo.toFixed(0)} BPM).

        For each recommended song, provide:
        1. Song title
        2. Artist name
        3. Album name (if applicable)
        4. Release year
        5. Genre(s)
        6. A brief explanation (1-2 sentences) of how this song matches the mood and style of the user's recent listening history.

        Ensure a mix of both familiar and discovery-worthy tracks that maintain the identified mood while providing some variety. 
        Format the response as a JSON array of objects, each containing the fields: name, artist, album, year, genres (as an array), 
        and explanation. Do not include any markdown formatting or additional text.`;

        const result = (await Promise.race([
          model.generateContent(prompt),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), TIMEOUT)
          ),
        ])) as GenerateContentResult;

        const responseText = result.response.text();

        const cleanedResponse = sanitizeJSONString(responseText.trim());

        console.log("Cleaned response:", cleanedResponse); // Log the cleaned response for debugging

        let playlist: Song[];
        try {
          playlist = JSON.parse(cleanedResponse);
          if (!Array.isArray(playlist)) {
            throw new Error("Parsed result is not an array");
          }
        } catch (parseError) {
          console.error("JSON parsing failed:", parseError);
          console.error("Problematic JSON string:", cleanedResponse);
          throw new Error(`Failed to parse AI-generated playlist:`);
        }

        if (playlist.length === 0) {
          throw new Error("Generated playlist is empty");
        }

        playlist = playlist
          .filter((song): song is Song => song && typeof song === "object")
          .map((song) => ({
            name: song.name || "Unknown",
            artist: song.artist || "Unknown",
            album: song.album,
            year: song.year,
            genres: Array.isArray(song.genres) ? song.genres : [],
            explanation: song.explanation,
          }));

        if (playlist.length === 0) {
          throw new Error("Failed to generate a valid playlist after filtering");
        }

        const playlistWithSpotifyIds = await Promise.all(
          playlist.map(async (song) => {
            const spotifyId = await searchSpotifyTrack(song, accessToken);
            return { ...song, spotifyId };
          })
        );

        return NextResponse.json({ 
          playlist: playlistWithSpotifyIds,
          mood: {
            dominant: dominantMood,
            metrics: mood
          }
        });

      } catch (error: unknown) {
        console.error(
          `Error in modify-playlist route (attempt ${retries + 1}):`,
          error
        );
        retries++;

        if (retries > MAX_RETRIES) {
          return NextResponse.json(
            {
              error: "Failed to generate playlist after multiple attempts",
              details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
          );
        }
      }
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request format" },
      { status: 400 }
    );
  }

  return NextResponse.json({ error: "Unexpected error occurred" }, { status: 500 });
}

