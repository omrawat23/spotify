import { cookies } from 'next/headers';

export async function spotifyApiRequest(endpoint: string) {
  const accessToken = cookies().get('spotify_access_token')?.value;

  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch data from Spotify API: ${response.statusText}`);
  }

  return response.json();
}

