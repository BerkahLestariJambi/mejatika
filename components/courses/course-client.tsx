"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Clock, User, Tag, Image as ImageIcon, Loader2 } from "lucide-react"
import { CourseModal } from "./course-modal"
import { useRouter } from "next/navigation"

export function CourseClient({ initialData }: { initialData: any[] }) {
  const [courses, setCourses] = useState(initialData)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const router = useRouter()

  // Fungsi Refresh Data
  const refreshData = async () => {
    const res = await fetch("/api/courses")
    const data = await res.json()
    setCourses(data)
    router.refresh()
  }

  // Fungsi Delete
  const onDelete = async (id: string) => {
    if (!confirm("Hapus kursus ini secara permanen?")) return
    try {
      await fetch(`/api/courses?id=${id}`, { method: "DELETE" })
      refreshData()
    } catch (error) {
      alert("Gagal menghapus")
    }
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-100">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-zinc-900">
            Course <span className="text-amber-500">Management</span>
          </h1>
          <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">
            Total {courses.length} Materi Pembelajaran
          </p>
        </div>
        <Button 
          onClick={() => { setSelectedCourse(null); setIsOpen(true); }}
          className="bg-amber-500 hover:bg-zinc-900 text-white font-black uppercase text-xs tracking-widest px-8 py-6 rounded-2xl shadow-lg transition-all"
        >
          <Plus className="mr-2 h-5 w-5" /> Add New Course
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="group overflow-hidden flex flex-col shadow-md hover:shadow-2xl transition-all border-none bg-white rounded-[2.5rem]">
            <CardContent className="p-0 flex flex-col flex-grow">
              <div className="px-5 pt-5">
                <div className="relative h-48 w-full bg-zinc-100 rounded-[2rem] overflow-hidden shadow-inner border border-zinc-50">
                  <img src={course.image || "/placeholder.svg"} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-zinc-900/80 backdrop-blur-md text-white border-none font-black uppercase text-[9px] px-3 py-1 rounded-full">{course.status}</Badge>
                  </div>
                </div>
              </div>

              <div className="p-7 flex flex-col flex-grow">
                <h3 className="text-xl font-black italic uppercase text-zinc-900 mb-3 line-clamp-2">{course.title}</h3>
                
                <div className="grid grid-cols-1 gap-3 mb-8 bg-zinc-50 p-5 rounded-3xl border border-zinc-100/50">
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                    <span className="text-zinc-400 flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-amber-500" /> Durasi</span>
                    <span className="text-zinc-700">{course.duration}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                    <span className="text-zinc-400 flex items-center gap-2"><Tag className="w-3.5 h-3.5 text-amber-500" /> Harga</span>
                    <span className="text-amber-600 font-black">Rp {course.price.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                <div className="flex gap-3 mt-auto">
                  <Button 
                    variant="outline" 
                    onClick={() => { setSelectedCourse(course); setIsOpen(true); }}
                    className="flex-1 border-2 border-zinc-100 hover:border-amber-500 rounded-2xl h-12 font-black uppercase text-[10px] tracking-widest transition-all"
                  >
                    <Edit className="mr-2 h-4 w-4 text-amber-600" /> Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => onDelete(course.id)}
                    className="w-12 h-12 border-2 border-zinc-100 hover:border-red-500 rounded-2xl transition-all"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CourseModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        course={selectedCourse} 
        onSuccess={refreshData}
      />
    </>
  )
}
