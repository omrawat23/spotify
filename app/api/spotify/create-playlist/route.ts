import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const accessToken = cookies().get('spotify_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Playlist name is required' }, { status: 400 });
    }

    // First, get the user's Spotify ID
    const userResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data');
    }

    const userData = await userResponse.json();
    const userId = userData.id;

    // Create the playlist
    const createPlaylistResponse = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description: description || '',
        public: false, // You can make this configurable if needed
      }),
    });

    if (!createPlaylistResponse.ok) {
      throw new Error('Failed to create playlist');
    }

    const playlistData = await createPlaylistResponse.json();
    return NextResponse.json(playlistData);
  } catch (error) {
    console.error('Error creating playlist:', error);
    return NextResponse.json({ error: 'Failed to create playlist' }, { status: 500 });
  }
}

