import {
  GoogleGenerativeAI,
  GenerateContentResult,
} from "@google/generative-ai";

interface Song {
  name: string;
  artist: string;
  album?: string;
  year?: string;
  genres?: string[];
  explanation?: string;
  spotifyId?: string;
}

interface RequestBody {
  songs: [string, string]; // Tuple of exactly two songs
}

const MAX_RETRIES = 4;
const TIMEOUT = 100000; // 50 seconds

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

async function searchSpotifyTrack(song: Song): Promise<string | undefined> {
  const accessToken = await getSpotifyAccessToken();
  if (!accessToken) {
      console.error("Failed to get Spotify access token");
      return undefined;
  }

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

function sanitizeJsonString(text: string): string {
  // Remove any potential markdown code blocks
  let cleaned = text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1');
  
  // Remove any text before the first '{' and after the last '}'
  const firstBrace = cleaned.indexOf('[');
  const lastBrace = cleaned.lastIndexOf(']');
  
  if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  
  // Remove any trailing commas inside arrays and objects
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
  
  return cleaned.trim();
}

function validateAndCleanPlaylist(playlist: any[]): Song[] {
  return playlist
      .filter((song): song is Song => {
          if (!song || typeof song !== "object") return false;
          if (typeof song.name !== "string" || typeof song.artist !== "string") return false;
          return true;
      })
      .map((song) => ({
          name: song.name,
          artist: song.artist,
          album: typeof song.album === "string" ? song.album : undefined,
          year: typeof song.year === "string" || typeof song.year === "number" 
              ? String(song.year) 
              : undefined,
          genres: Array.isArray(song.genres) ? song.genres.filter(g => typeof g === "string") : [],
          explanation: typeof song.explanation === "string" ? song.explanation : undefined,
      }));
}

export async function POST(request: Request) {
  let retries = 0;
  let requestBody: RequestBody;

  try {
      requestBody = await request.json();
  } catch (error) {
      return Response.json(
          { error: "Invalid request body", details: String(error) },
          { status: 400 }
      );
  }

  while (retries <= MAX_RETRIES) {
      try {
          const { songs } = requestBody;

          if (!Array.isArray(songs) || songs.length !== 2 || 
              !songs.every(song => typeof song === "string")) {
              return Response.json(
                  { error: "Please provide exactly two songs" },
                  { status: 400 }
              );
          }

          const [song1, song2] = songs;

          const apiKey = process.env.GEMINI_API_KEY;
          if (!apiKey) {
              throw new Error("GEMINI_API_KEY is not set");
          }

          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-pro" });

          const prompt = `Generate a JSON array of 10 songs that blend the musical elements of "${song1}" and "${song2}". Each object in the array should have these properties: name (string), artist (string), album (string), year (string), genres (array of strings), and explanation (string). The explanation should describe how the song combines elements from both input songs. Return only valid JSON, no additional text or formatting.`;

          const result = (await Promise.race([
              model.generateContent(prompt),
              new Promise((_, reject) =>
                  setTimeout(() => reject(new Error("Timeout")), TIMEOUT)
              ),
          ])) as GenerateContentResult;

          const responseText = result.response.text();
          const cleanedResponse = sanitizeJsonString(responseText);

          let playlist: any[];
          try {
              playlist = JSON.parse(cleanedResponse);
              
              if (!Array.isArray(playlist)) {
                  throw new Error("Response is not an array");
              }
          } catch (parseError) {
              console.error("JSON parsing failed:", parseError, "\nResponse:", cleanedResponse);
              throw new Error(`Failed to parse AI response: ${parseError.message}`);
          }

          const validPlaylist = validateAndCleanPlaylist(playlist);

          if (validPlaylist.length === 0) {
              throw new Error("No valid songs in the generated playlist");
          }

          const playlistWithSpotifyIds = await Promise.all(
              validPlaylist.map(async (song) => {
                  const spotifyId = await searchSpotifyTrack(song);
                  return { ...song, spotifyId };
              })
          );

          return Response.json({ playlist: playlistWithSpotifyIds });

      } catch (error: unknown) {
          console.error(
              `Error in generate-playlist route (attempt ${retries + 1}):`,
              error
          );
          retries++;

          if (retries > MAX_RETRIES) {
              return Response.json(
                  {
                      error: "Failed to generate playlist after multiple attempts",
                      details: error instanceof Error ? error.message : String(error),
                  },
                  { status: 500 }
              );
          }
      }
  }

  return Response.json({ error: "Unexpected error occurred" }, { status: 500 });
}