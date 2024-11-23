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
  
  export async function POST(request: Request) {
    let retries = 0;
    let requestBody: RequestBody;
  
    try {
      requestBody = await request.json();
    } catch (error) {
      return Response.json(error);
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
  
        const prompt = `Create a curated playlist of 10 songs that blend the musical elements of both "${song1}" and "${song2}". This playlist should feel like the musical offspring of these two songs, incorporating elements from both while maintaining a cohesive flow. For each song, provide:
  
          1. Song title
          2. Artist name
          3. Album name (if applicable)
          4. Release year
          5. Genre(s)
          6. A brief explanation (1-2 sentences) of how this song combines elements from both "${song1}" and "${song2}" in terms of style, mood, or musical characteristics.
  
          Ensure a diverse selection that bridges the musical gap between the two input songs. Include both well-known and lesser-known artists. Avoid duplicate artists unless they have a particularly relevant song. Format the response as a JSON array of objects, each containing the fields: name, artist, album, year, genres (as an array), and explanation. Ensure the JSON is valid and properly formatted. Do not include any markdown formatting, code block syntax, or additional text in your response. The response should be a valid JSON array and nothing else.`;
  
        const result = (await Promise.race([
          model.generateContent(prompt),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), TIMEOUT)
          ),
        ])) as GenerateContentResult;
  
        const responseText = result.response.text();
  
        // Clean up the response
        const cleanedResponse = responseText
          .replace(/```json\s*|\s*```/g, "")
          .replace(/^\s*\[|\]\s*$/g, "")
          .replace(/},\s*{/g, "},\n{")
          .trim();
  
        let playlist: Song[];
        try {
          // Attempt to parse the entire array
          playlist = JSON.parse(`[${cleanedResponse}]`);
        } catch (parseError) {
          console.error("JSON parsing failed:", parseError);
          // If parsing fails, try to parse each object separately
          const lines = cleanedResponse.split("\n");
          playlist = lines.flatMap((line) => {
            try {
              const parsedLine = JSON.parse(line);
              if (typeof parsedLine === "object" && parsedLine !== null) {
                return [parsedLine];
              }
            } catch (lineError) {
              console.error("Error parsing line:", lineError);
            }
            return [];
          });
        }
  
        if (!Array.isArray(playlist) || playlist.length === 0) {
          throw new Error("Failed to generate a valid playlist");
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
  
        // After generating and parsing the playlist, add Spotify track IDs
        const playlistWithSpotifyIds = await Promise.all(
          playlist.map(async (song) => {
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
  
    // This should never be reached, but TypeScript requires a return statement
    return Response.json({ error: "Unexpected error occurred" }, { status: 500 });
  }