"use client"

import { AnalyticsSidebar } from "@/components/analytics/analytics-sidebar"
import { AnalyticsContent } from "@/components/analytics/analytics-content"
import { AnalyticsProvider } from "@/contexts/AnalyticsContext"

export default function AnalyticsPage() {
  return (
    <AnalyticsProvider>
      <div className="min-h-screen ">
        <AnalyticsSidebar />
        <AnalyticsContent />
      </div>
    </AnalyticsProvider>
  )
}

