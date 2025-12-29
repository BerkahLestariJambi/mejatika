"use client"

import { useEffect, useState } from "react"
import { Calendar, Clock, MapPin, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Schedule {
  id: string
  course_id: string
  start_time: string
  end_time: string
  location: string
  // Jika backend belum menyediakan field ini, kita beri nilai default
  maxParticipants?: number
  currentParticipants?: number
  course: {
    title: string
  }
}

export function ScheduleSidebar() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Sesuaikan URL dengan endpoint publik yang kita buat di api.php
    fetch("https://backend.mejatika.com/api/schedules")
      .then((res) => res.json())
      .then((data) => {
        // Ambil 4 jadwal terdekat saja untuk sidebar
        const limitedData = Array.isArray(data) ? data.slice(0, 4) : []
        setSchedules(limitedData)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Failed to load schedules:", error)
        setLoading(false)
      })
  }, [])

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white">
        <CardHeader className="bg-zinc-900 pb-6">
          <CardTitle className="flex items-center gap-2 text-white font-black uppercase italic tracking-tighter text-lg">
            <Calendar className="w-5 h-5 text-amber-500" />
            Jadwal Terdekat
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              <p className="text-xs font-bold text-zinc-400 uppercase italic">Memuat Jadwal...</p>
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-zinc-400 font-bold uppercase italic text-xs tracking-widest">Tidak ada jadwal tersedia</p>
            </div>
          ) : (
            <div className="space-y-6">
              {schedules.map((schedule) => {
                // Logic untuk ketersediaan (jika ada data partisipan)
                const isFull = (schedule.currentParticipants || 0) >= (schedule.maxParticipants || 99)
                
                return (
                  <div key={schedule.id} className="group relative border-l-4 border-amber-500 pl-4 transition-all hover:pl-6">
                    <div className="flex flex-col gap-1 mb-2">
                      <h4 className="font-black text-sm text-zinc-900 uppercase italic leading-tight group-hover:text-amber-600 transition-colors">
                        {schedule.course?.title || "Kursus Mejatika"}
                      </h4>
                      <Badge 
                        variant="secondary" 
                        className={`w-fit text-[10px] font-black uppercase tracking-widest border-none ${
                          isFull ? "bg-zinc-100 text-zinc-400" : "bg-amber-100 text-amber-600"
                        }`}
                      >
                        {isFull ? "Penuh" : "Tersedia"}
                      </Badge>
                    </div>

                    <div className="space-y-1.5 text-[11px] font-bold uppercase tracking-tight text-zinc-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-zinc-400" />
                        {new Date(schedule.start_time).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        {new Date(schedule.start_time).toLocaleTimeString("id-ID", {
                           hour: '2-digit',
                           minute: '2-digit'
                        })} WIB
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-zinc-400" />
                        <span className="truncate">{schedule.location || "Online Zoom"}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mejatika Style Ads Placeholder */}
      <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-amber-500">
        <CardContent className="p-6 text-center text-white">
          <p className="font-black uppercase italic text-xs tracking-[0.2em] mb-4">Space Iklan</p>
          <div className="h-[200px] bg-zinc-900/10 rounded-[1.5rem] flex flex-col items-center justify-center border-2 border-dashed border-white/20">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Sewa Slot Iklan</span>
            <span className="text-xs font-bold italic">300 x 250</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
