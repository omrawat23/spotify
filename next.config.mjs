/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'mosaic.scdn.co',
      'i.scdn.co',
      'blend-playlist-covers.spotifycdn.com',
      'image-cdn-ak.spotifycdn.com',
      'image-cdn-fa.spotifycdn.com' // Add this domain
    ],
  },
    env: {
      SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
      SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
      SPOTIFY_REDIRECT_URI: process.env.SPOTIFY_REDIRECT_URI,
    },
  };
  
  export default nextConfig;
  