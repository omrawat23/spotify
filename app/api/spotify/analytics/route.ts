import { NextRequest, NextResponse } from 'next/server';
import { spotifyApiRequest } from '@/utils/spotifyApi';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const view = searchParams.get('view')
  const timeRange = searchParams.get('time_range') || 'medium_term'

  try {
    let data;
    switch (view) {
      case 'top-tracks':
        data = await spotifyApiRequest(`/me/top/tracks?limit=20&time_range=${timeRange}`);
        break;
      case 'top-artists':
        data = await spotifyApiRequest(`/me/top/artists?limit=20&time_range=${timeRange}`);
        break;
        case 'recent':
            data = await spotifyApiRequest('/me/player/recently-played?limit=50');
            // Restructure the data to match the expected format
            data = {
              items: data.items.map((item: any) => ({
                ...item.track,
                played_at: item.played_at
              }))
            };
            break;
      case 'genres':
        const artists = await spotifyApiRequest(`/me/top/artists?limit=50&time_range=${timeRange}`);
        const genres = artists.items.flatMap((artist: any) => artist.genres);
        const genreCounts = genres.reduce((acc: any, genre: string) => {
          acc[genre] = (acc[genre] || 0) + 1;
          return acc;
        }, {});
        data = Object.entries(genreCounts)
          .sort((a: any, b: any) => b[1] - a[1])
          .slice(0, 20);
        break;
      case 'listening-time':
        const recentTracks = await spotifyApiRequest('/me/player/recently-played?limit=50');
        const listeningTimes = recentTracks.items.map((item: any) => new Date(item.played_at));
        data = listeningTimes.reduce((acc: any, time: Date) => {
          const hour = time.getHours();
          acc[hour] = (acc[hour] || 0) + 1;
          return acc;
        }, {});
        break;
      case 'popularity':
        const tracks = await spotifyApiRequest(`/me/top/tracks?limit=50&time_range=${timeRange}`);
        const popularityScores = tracks.items.map((track: any) => track.popularity);
        const averagePopularity = popularityScores.reduce((a: number, b: number) => a + b, 0) / popularityScores.length;
        data = { averagePopularity, popularityScores };
        break;
      case 'recommendations':
        const topTracks = await spotifyApiRequest('/me/top/tracks?limit=5&time_range=short_term');
        const seedTracks = topTracks.items.map((track: any) => track.id).join(',');
        data = await spotifyApiRequest(`/recommendations?seed_tracks=${seedTracks}&limit=20`);
        break;
      default:
        return NextResponse.json({ error: 'Invalid view parameter' }, { status: 400 });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error fetching ${view} data:`, error);
    return NextResponse.json({ error: `Failed to fetch ${view} data` }, { status: 500 });
  }
}

