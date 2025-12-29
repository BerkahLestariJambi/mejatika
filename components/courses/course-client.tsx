"use client"
import { useState } from "react"
import { Plus, Edit, Trash2, Clock, Tag, Loader2, ImagePlus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CourseModal } from "./course-modal"

export function CourseClient({ initialData }: { initialData: any[] }) {
  const [courses, setCourses] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)

  const refreshData = async () => {
    setLoading(true)
    try {
      const res = await fetch("https://backend.mejatika.com/api/courses")
      const json = await res.json()
      setCourses(Array.isArray(json) ? json : json.data || [])
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async (id: number) => {
    if (!confirm("Hapus kursus?")) return
    const token = localStorage.getItem("token")
    await fetch(`https://backend.mejatika.com/api/courses/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    })
    refreshData()
  }

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center bg-white p-10 rounded-[3rem] shadow-sm">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">
          Course <span className="text-amber-500">Management</span>
        </h1>
        <Button onClick={() => { setSelectedCourse(null); setIsOpen(true); }} className="bg-zinc-900 rounded-2xl h-14 px-8">
          <Plus className="mr-2" /> Add Course
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="rounded-[2.5rem] overflow-hidden border-none shadow-lg bg-white">
            <CardContent className="p-6">
              <div className="relative h-48 bg-zinc-100 rounded-[2rem] overflow-hidden mb-6">
                <img src={course.thumbnail || "/placeholder.svg"} className="object-cover w-full h-full" alt="" />
                <Badge className="absolute top-4 right-4 bg-black/50 backdrop-blur-md">{course.category?.name}</Badge>
              </div>
              <h3 className="text-xl font-black uppercase italic mb-4">{course.title}</h3>
              <div className="bg-zinc-50 p-4 rounded-2xl mb-6 space-y-2">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                  <span className="text-zinc-400">Price</span>
                  <span className="text-amber-600">Rp {Number(course.price).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                  <span className="text-zinc-400">Duration</span>
                  <span>{course.duration}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setSelectedCourse(course); setIsOpen(true); }} className="flex-1 rounded-xl">Edit</Button>
                <Button variant="outline" onClick={() => onDelete(course.id)} className="rounded-xl text-red-500 hover:bg-red-50"><Trash2 size={16}/></Button>
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
    </div>
  )
}
