"use client"

import { Bell } from "lucide-react"
import { useEffect, useState } from "react"

export function RunningText() {
  const [newsText, setNewsText] = useState("")

  useEffect(() => {
    fetch("/api/settings?key=running_text")
      .then((res) => res.json())
      .then((data) => {
        if (data.value) {
          setNewsText(data.value)
        }
      })
      .catch((error) => {
        console.error("Failed to load running text:", error)
      })
  }, [])

  const newsItems = newsText.split("|").map((item) => item.trim())

  return (
    <div className="bg-accent text-accent-foreground rounded-lg overflow-hidden">
      <div className="flex items-center gap-3 p-3">
        <div className="flex items-center gap-2 shrink-0">
          <Bell className="w-5 h-5 text-chart-1" />
          <span className="font-semibold">Pengumuman:</span>
        </div>
        <div className="overflow-hidden">
          <div className="animate-marquee whitespace-nowrap">
            {newsItems.map((item, index) => (
              <span key={index} className="inline-block mx-8">
                • {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
