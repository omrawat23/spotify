'use client';

import { motion } from 'framer-motion';
import { Headphones, ArrowRight } from 'lucide-react';
import Link from "next/link";
import { BorderBeam } from '@/components/magicui/border-beam';
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function HeroSection() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/spotify/user');
      if (response.ok) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    window.location.href = '/api/spotify/auth';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 mt-44">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6">
          Discover Your Perfect Playlist with <span className="text-green-400">Spotifind</span>
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-gray-300 mb-8">
          Create personalized Spotify playlists tailored to your unique taste. Let AI curate your musical journey.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isAuthenticated ? (
            <Link href="/dashboard/ai-playlist">
              <Button 
                size="lg" 
                className="w-full sm:w-auto animate-pulse bg-green-500 hover:bg-green-600 text-black font-bold"
              >
                <Headphones className="mr-2 h-5 w-5" /> Your Playlists
              </Button>
            </Link>
          ) : (
            <Button 
              onClick={handleLogin} 
              size="lg" 
              className="w-full sm:w-auto animate-pulse bg-green-500 hover:bg-green-600 text-black font-bold"
            >
              <Headphones className="mr-2 h-5 w-5" /> Get Started
            </Button>
          )}
          <Link href="#how-it-works" className="w-full sm:w-auto">
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto text-white bg-green-900 hover:bg-green-700 hover:text-black transition-colors duration-300"
            >
              Learn More <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mt-12 relative"
      >
        <div className="relative rounded-xl overflow-hidden shadow-2xl">
          <Image
            width={1200}
            height={675}
            src="/home.png"
            alt="Spotifind Dashboard"
            className="w-full max-w-4xl object-cover"
          />
          <BorderBeam size={400} duration={10} delay={5} />
        </div>
      </motion.div>
    </div>
  );
}

