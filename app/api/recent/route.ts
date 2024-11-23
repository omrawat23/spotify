import { cookies } from 'next/headers';

export async function GET() {
  const accessToken = cookies().get('spotify_access_token')?.value;

  if (!accessToken) {
    return Response.json(
      { error: "Spotify access token not found in cookies" },
      { status: 401 }
    );
  }

  try {
    const response = await fetch(
      "https://api.spotify.com/v1/me/player/recently-played?limit=5",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.statusText}`);
    }

    const data = await response.json();
    const tracks = data.items.map((item: any) => item.track);

    return Response.json({ tracks });
  } catch (error) {
    console.error("Error fetching recent tracks:", error);
    return Response.json(
      { error: "Failed to fetch recent tracks" },
      { status: 500 }
    );
  }
}