import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const accessToken = cookies().get('spotify_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const response = await fetch('https://api.spotify.com/v1/me/tracks', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch saved tracks');
    }

    const library = await response.json();
    return NextResponse.json(library);
  } catch (error) {
    console.error('Error fetching library:', error);
    return NextResponse.json({ error: 'Failed to fetch library' }, { status: 500 });
  }
}