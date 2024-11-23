"use client"

import {LeftSidebar} from "@/components/dashboard/left-sidebar"
import { MainContent } from "@/components/dashboard/main-content"
import { MusicProvider } from "@/contexts/MusicContext"

export default function Page() {
  return (
    <>
    <MusicProvider>
      <div className="flex flex-col ">
        <div className="flex-1 flex overflow-hidden">
          <LeftSidebar />
          <MainContent />
          {/* <RightSidebar /> */}
        </div>
        {/* <Player /> */}
      </div>
    </MusicProvider>
    </>
    
  )
}

