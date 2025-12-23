"use client"

import { useEffect, useState } from "react"
import { Calendar, Clock, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Schedule {
  id: string
  title: string
  startDate: string
  time: string
  location: string
  status: string
  maxParticipants: number
  currentParticipants: number
  course: {
    title: string
  }
}

export function ScheduleSidebar() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/schedules?limit=4")
      .then((res) => res.json())
      .then((data) => {
        setSchedules(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Failed to load schedules:", error)
        setLoading(false)
      })
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-chart-1" />
            Jadwal Pembelajaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-l-4 border-muted pl-4 pb-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                  <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                </div>
              ))}
            </div>
          ) : schedules.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">Tidak ada jadwal tersedia</p>
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule) => {
                const isFull = schedule.currentParticipants >= schedule.maxParticipants
                return (
                  <div key={schedule.id} className="border-l-4 border-chart-1 pl-4 pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm text-balance">{schedule.course.title}</h4>
                      <Badge variant={isFull ? "secondary" : "default"} className="text-xs">
                        {isFull ? "Penuh" : "Tersedia"}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(schedule.startDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {schedule.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        {schedule.location}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Google Ads Placeholder */}
      <Card className="bg-muted">
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground text-sm">
            <p className="font-semibold mb-2">Advertisement</p>
            <p className="text-xs">Google Ads Space</p>
            <div className="mt-4 h-[200px] bg-background rounded flex items-center justify-center">
              <span className="text-xs">300 x 250</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
