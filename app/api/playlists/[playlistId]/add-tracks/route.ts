import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: { playlistId: string } }
) {
  const accessToken = cookies().get('spotify_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { uris } = await request.json();

    if (!uris || !Array.isArray(uris)) {
      return NextResponse.json({ error: 'Invalid track URIs' }, { status: 400 });
    }

    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${params.playlistId}/tracks`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uris })
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        cookies().delete('spotify_access_token');
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
      }
      throw new Error(`Spotify API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error adding tracks to playlist:', error);
    return NextResponse.json({ error: 'Failed to add tracks to playlist' }, { status: 500 });
  }
}

