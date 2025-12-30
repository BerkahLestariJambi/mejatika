"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  BookOpen, 
  Download, 
  PlayCircle, 
  FileText, 
  ChevronDown, 
  ChevronUp 
} from "lucide-react"

export default function StudentDashboard() {
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null)

  const fetchData = async () => {
    const token = localStorage.getItem("token")
    try {
      const res = await fetch("https://backend.mejatika.com/api/registrations", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await res.json()
      setRegistrations(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-4xl font-black italic uppercase tracking-tighter text-zinc-900">
        My <span className="text-amber-500">Learning</span>
      </h1>

      <div className="grid gap-6">
        {registrations.map((reg) => (
          <Card key={reg.id} className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white">
            <CardContent className="p-0">
              <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-zinc-900 rounded-2xl flex items-center justify-center text-amber-500 shadow-lg">
                    <BookOpen size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tight text-zinc-900">
                      {reg.course?.title}
                    </h3>
                    <Badge className={`rounded-full px-3 py-1 text-[10px] font-black uppercase border-none mt-1 ${
                      reg.status === 'success' || reg.status === 'aktif' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {reg.status}
                    </Badge>
                  </div>
                </div>

                {/* Tombol Akses Materi */}
                {(reg.status === 'success' || reg.status === 'aktif') && (
                  <Button 
                    onClick={() => setExpandedCourse(expandedCourse === reg.id ? null : reg.id)}
                    className="rounded-xl bg-zinc-900 hover:bg-zinc-800 font-bold uppercase italic text-xs h-12 px-6"
                  >
                    {expandedCourse === reg.id ? <ChevronUp className="mr-2" /> : <PlayCircle className="mr-2 text-amber-500" />}
                    {expandedCourse === reg.id ? "Tutup Materi" : "Mulai Belajar"}
                  </Button>
                )}
              </div>

              {/* SECTION DAFTAR MATERI (Collapsible) */}
              {expandedCourse === reg.id && (
                <div className="bg-zinc-50/50 border-t border-zinc-100 p-6 animate-in slide-in-from-top duration-300">
                  <h4 className="font-black uppercase italic text-xs tracking-widest text-zinc-400 mb-4">
                    Modul Pembelajaran:
                  </h4>
                  
                  {/* Cek jika ada materi di dalam kursus */}
                  {reg.course?.materials && reg.course.materials.length > 0 ? (
                    <div className="grid gap-3">
                      {reg.course.materials.map((material: any) => (
                        <div key={material.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-zinc-100 hover:border-amber-200 transition-all shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                              <FileText size={16} />
                            </div>
                            <span className="font-bold text-zinc-700 text-sm">{material.title}</span>
                          </div>
                          
                          {/* Menggunakan file_url dari Accessor Model Laravel */}
                          <a 
                            href={material.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-zinc-100 hover:bg-zinc-900 hover:text-white p-2 rounded-lg transition-colors"
                          >
                            <Download size={16} />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-400 text-sm italic">Materi belum diunggah oleh instruktur.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
