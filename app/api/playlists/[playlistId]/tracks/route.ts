// app/api/spotify/playlists/[playlistId]/tracks/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(
  request: Request,
  { params }: { params: { playlistId: string } }
) {
  const accessToken = cookies().get('spotify_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    // Handle liked songs specially
    if (params.playlistId === 'liked') {
      const response = await fetch('https://api.spotify.com/v1/me/tracks?limit=50', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        next: {
          revalidate: 60 // Cache for 1 minute
        }
      });

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.statusText}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    }

    // Fetch regular playlist tracks
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${params.playlistId}/tracks?limit=50`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        next: {
          revalidate: 60 // Cache for 1 minute
        }
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        cookies().delete('spotify_access_token');
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        );
      }
      throw new Error(`Spotify API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching playlist tracks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playlist tracks' },
      { status: 500 }
    );
  }
}