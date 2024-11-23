"use client"

import { LeftSidebar } from "@/components/homepage/homepage"
import HeroSection from "@/components/homepage/homecontent"
import { MusicProvider } from "@/contexts/MusicContext"

export default function Page() {
  return (
    <>
    <MusicProvider>
      <div className="flex flex-col ">
        <div className="flex-1 flex overflow-hidden">
          <LeftSidebar />
          <HeroSection />
          {/* <RightSidebar /> */}
        </div>
        {/* <Player /> */}
      </div>
    </MusicProvider>
    </>
    
  )
}

