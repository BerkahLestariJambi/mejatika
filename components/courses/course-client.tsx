"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Clock, Tag, Loader2, AlertCircle } from "lucide-react"
import { CourseModal } from "./course-modal"
import { useRouter } from "next/navigation"

// Pastikan URL mengarah ke Backend Laravel Anda
const API_BASE_URL = "https://backend.mejatika.com/api/courses";

export function CourseClient({ initialData }: { initialData: any[] }) {
  const [courses, setCourses] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const router = useRouter()

  // 1. Fungsi Refresh Data (Mengambil dari Laravel)
  const refreshData = async () => {
    setLoading(true)
    try {
      const res = await fetch(API_BASE_URL, {
        headers: { "Accept": "application/json" }
      })
      const data = await res.json()
      
      // Laravel biasanya mengembalikan array langsung atau di dalam { data: [] }
      const finalData = Array.isArray(data) ? data : data.data || []
      setCourses(finalData)
      router.refresh()
    } catch (error) {
      console.error("Gagal mengambil data dari Laravel:", error)
    } finally {
      setLoading(false)
    }
  }

  // 2. Fungsi Delete (Sesuai dengan route destroy di Laravel)
  const onDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kursus ini secara permanen dari database?")) return
    
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`, { 
        method: "DELETE",
        headers: { "Accept": "application/json" }
      })

      if (res.status === 204 || res.ok) {
        refreshData()
      } else {
        alert("Gagal menghapus: Server menolak permintaan.")
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.")
    }
  }

  return (
    <div className="space-y-10">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-10 rounded-[3rem] shadow-sm border border-zinc-100">
        <div>
          <Badge className="bg-amber-100 text-amber-700 border-none mb-3 px-4 py-1 uppercase tracking-widest font-black text-[10px]">
            Admin Dashboard
          </Badge>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-zinc-900 leading-none">
            Course <span className="text-amber-500">Management</span>
          </h1>
          <p className="text-zinc-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-3">
            Total {courses.length} Program Pembelajaran Terdaftar
          </p>
        </div>
        
        <Button 
          onClick={() => { setSelectedCourse(null); setIsOpen(true); }}
          className="bg-zinc-900 hover:bg-amber-500 text-white font-black uppercase text-xs tracking-widest px-10 py-8 rounded-[1.8rem] shadow-xl transition-all duration-300"
        >
          <Plus className="mr-2 h-5 w-5" /> Add New Course
        </Button>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="flex items-center justify-center py-10 bg-white/50 backdrop-blur-sm rounded-[2rem]">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mr-3" />
          <span className="font-black uppercase tracking-widest text-xs">Syncing with Laravel...</span>
        </div>
      )}

      {/* GRID LIST */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {courses.length > 0 ? (
          courses.map((course) => (
            <Card key={course.id} className="group overflow-hidden flex flex-col shadow-md hover:shadow-2xl transition-all duration-500 border-none bg-white rounded-[2.5rem]">
              <CardContent className="p-0 flex flex-col flex-grow">
                {/* THUMBNAIL AREA */}
                <div className="px-6 pt-6">
                  <div className="relative h-52 w-full bg-zinc-100 rounded-[2.2rem] overflow-hidden shadow-inner">
                    <img 
                      src={course.thumbnail || "/placeholder.svg"} 
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      alt={course.title} 
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/90 backdrop-blur-md text-zinc-900 border-none font-black uppercase text-[9px] px-4 py-1.5 rounded-full shadow-sm">
                        {course.category?.name || "Uncategorized"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* CONTENT AREA */}
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="text-2xl font-black italic uppercase text-zinc-900 mb-2 line-clamp-1 group-hover:text-amber-500 transition-colors duration-300">
                    {course.title}
                  </h3>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6">
                    Slug: {course.slug}
                  </p>
                  
                  {/* DETAILS BOX */}
                  <div className="grid grid-cols-1 gap-3 mb-8 bg-zinc-50 p-5 rounded-[2rem] border border-zinc-100/50">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                      <span className="text-zinc-400 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-amber-500" /> Duration
                      </span>
                      <span className="text-zinc-800">{course.duration || "N/A"}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest pt-2 border-t border-zinc-200/50">
                      <span className="text-zinc-400 flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-amber-500" /> Price
                      </span>
                      <span className="text-amber-600">Rp {Number(course.price || 0).toLocaleString("id-ID")}</span>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex gap-3 mt-auto">
                    <Button 
                      variant="outline" 
                      onClick={() => { setSelectedCourse(course); setIsOpen(true); }}
                      className="flex-1 border-2 border-zinc-100 hover:border-amber-500 hover:bg-amber-50 rounded-2xl h-14 font-black uppercase text-[10px] tracking-widest transition-all"
                    >
                      <Edit className="mr-2 h-4 w-4" /> Edit Data
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => onDelete(course.id)}
                      className="w-14 h-14 border-2 border-zinc-100 hover:border-red-500 hover:bg-red-50 rounded-2xl transition-all flex items-center justify-center"
                    >
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          !loading && (
            <div className="col-span-full py-20 text-center bg-zinc-50 rounded-[3rem] border-2 border-dashed border-zinc-200">
              <AlertCircle className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
              <p className="font-black uppercase tracking-widest text-zinc-400">Belum ada kursus di Database Laravel</p>
            </div>
          )
        )}
      </div>

      {/* MODAL COMPONENT */}
      <CourseModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        course={selectedCourse} 
        onSuccess={refreshData}
      />
    </div>
  )
}
