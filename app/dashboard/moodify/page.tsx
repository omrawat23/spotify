"use client"

import { AnalyticsSidebar } from "@/components/analytics/analytics-sidebar"
import { AnalyticsContent } from "@/components/analytics/analytics-content"
import { AnalyticsProvider } from "@/contexts/AnalyticsContext"
import { LeftSidebar } from "@/components/homepage/homepage"
import Moodify from "@/components/Moodify"

export default function AnalyticsPage() {
  return (
    <div>
      <div className="min-h-screen">
        <LeftSidebar />
        <Moodify />
      </div>
    </div>
  )
}

