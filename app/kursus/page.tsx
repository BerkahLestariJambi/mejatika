"use client"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Tag, Loader2, Info, X } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

export default function KursusPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null)

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("https://backend.mejatika.com/api/courses")
        const data = await res.json()
        // Pastikan mengambil array dari property 'data' jika ada
        setCourses(Array.isArray(data) ? data : data.data || [])
      } catch (err) {
        console.error("Error fetching courses:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  const handleEnroll = (courseId: number) => {
    router.push(`/login?redirect=/kursus&course_id=${courseId}`)
  }

  return (
    <div className="min-h-screen bg-[#fcfcf9] flex flex-col">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-16">
        <div className="max-w-3xl mb-12">
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 mb-4 px-4 py-1 uppercase tracking-widest font-black text-[10px]">
            Akademi Mejatika
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-black italic uppercase tracking-tighter text-zinc-900 mb-6 leading-none">
            Program <span className="text-amber-500">Kursus</span>
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-amber-500" />
          </div>
        ) : (
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card 
                key={course.id} 
                className="group cursor-pointer border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-white rounded-[2.5rem] overflow-hidden flex flex-col"
                onClick={() => setSelectedCourse(course)}
              >
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="p-4">
                    <div className="relative h-56 w-full rounded-[2rem] overflow-hidden bg-zinc-100">
                      <img 
                        src={course.thumbnail_url || "/placeholder.svg"} 
                        alt={course.title} 
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                         <Info size={18} className="text-amber-600" />
                      </div>
                    </div>
                  </div>

                  <div className="p-8 pt-2 flex flex-col flex-grow">
                    <h3 className="text-2xl font-black italic uppercase text-zinc-900 mb-3 group-hover:text-amber-500 transition-colors leading-tight">
                      {course.title}
                    </h3>
                    
                    <div className="bg-zinc-50 rounded-3xl p-5 space-y-3 mb-6">
                      <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-zinc-400">
                        <span className="flex items-center gap-2"><Clock size={14} className="text-amber-500" /> Durasi</span>
                        <span className="text-zinc-800">{course.duration}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-zinc-400">
                        <span className="flex items-center gap-2"><Tag size={14} className="text-amber-500" /> Investasi</span>
                        <span className="text-amber-600">
                          {course.price ? formatRupiah(Number(course.price)) : "Free"}
                        </span>
                      </div>
                    </div>

                    {/* FOTO MENTOR & LABEL MENTOR DI CARD */}
                    {course.main_mentor && (
                      <div className="flex items-center gap-4 mb-6 px-2">
                        <div className="relative">
                          <img 
                            /* PERBAIKAN: Menggunakan profile_photo_url dari Accessor Laravel */
                            src={course.main_mentor.profile_photo_url} 
                            alt={course.main_mentor.name} 
                            className="w-14 h-14 rounded-full border-2 border-amber-500 object-cover shadow-md transition-transform group-hover:scale-105"
                          />
                          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-[9px] font-black uppercase tracking-[0.15em] text-amber-600 mb-0.5 bg-amber-50 self-start px-2 py-0.5 rounded-full border border-amber-100">
                            Mentor Kursus
                          </span>
                          <span className="text-sm font-black text-zinc-900 leading-tight">
                            {course.main_mentor.name}
                          </span>
                          <span className="text-[10px] font-medium text-zinc-400 italic">
                            {/* PERBAIKAN: Menggunakan field specialist dari model User */}
                            {course.main_mentor.specialist || "Professional Instructor"}
                          </span>
                        </div>
                      </div>
                    )}

                    <Button className="mt-auto w-full bg-zinc-900 hover:bg-amber-600 text-white rounded-2xl h-14 font-black uppercase text-xs tracking-[0.2em]">
                      Detail Kursus
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* MODAL DETAIL KURSUS */}
      <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-[2rem] border-none bg-white shadow-2xl max-h-[90vh] flex flex-col z-[9999]">
          {selectedCourse && (
            <>
              <button 
                onClick={() => setSelectedCourse(null)}
                className="absolute top-4 right-4 z-50 p-2 bg-white/80 hover:bg-white backdrop-blur rounded-full text-zinc-900 shadow-sm transition-all"
              >
                <X size={20} />
              </button>

              <div className="overflow-y-auto custom-scrollbar flex-grow bg-[#fcfcf9]">
                <div className="relative h-64 md:h-80 w-full">
                  <img src={selectedCourse.thumbnail_url || "/placeholder.svg"} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#fcfcf9] via-transparent to-black/20" />
                </div>

                <div className="px-4 md:px-10 pb-10 -mt-12 relative z-10">
                  <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-xl border border-zinc-50 w-full overflow-hidden">
                    <div className="flex justify-between items-start mb-6">
                      <Badge className="bg-amber-500 text-white px-4 py-1 rounded-full uppercase font-black text-[10px] tracking-widest border-none">
                        {selectedCourse.category?.name || "Premium Course"}
                      </Badge>
                      
                      {/* MENTOR DI MODAL (Desktop) */}
                      {selectedCourse.main_mentor && (
                        <div className="hidden md:flex items-center gap-4 bg-zinc-50 p-3 pr-6 rounded-full border border-zinc-100 shadow-sm">
                           <img 
                            /* PERBAIKAN: Menggunakan profile_photo_url */
                            src={selectedCourse.main_mentor.profile_photo_url} 
                            className="w-12 h-12 rounded-full border-2 border-amber-500 object-cover" 
                            alt={selectedCourse.main_mentor.name} 
                          />
                          <div className="flex flex-col">
                            <span className="text-xs font-black uppercase leading-none mb-1">{selectedCourse.main_mentor.name}</span>
                            <span className="text-[9px] font-bold text-amber-600 uppercase tracking-tighter">
                              {selectedCourse.main_mentor.specialist || "Mentor"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-zinc-900 mb-6 leading-tight break-words">
                      {selectedCourse.title}
                    </h2>

                    {/* MENTOR DI MODAL (Mobile Only) */}
                    {selectedCourse.main_mentor && (
                      <div className="flex md:hidden items-center gap-4 mb-6 p-5 bg-zinc-50 rounded-3xl border border-zinc-100">
                         <img 
                          src={selectedCourse.main_mentor.profile_photo_url} 
                          className="w-16 h-16 rounded-full border-2 border-amber-500 object-cover shadow-md" 
                          alt="" 
                        />
                        <div className="flex flex-col">
                          <span className="text-base font-black text-zinc-900 uppercase italic leading-none mb-1">
                            {selectedCourse.main_mentor.name}
                          </span>
                          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-widest">
                            {selectedCourse.main_mentor.specialist || "Professional Instructor"}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-8 border-y border-zinc-100 py-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Durasi</span>
                        <span className="font-bold text-zinc-900 flex items-center gap-2"><Clock size={16} className="text-amber-500" /> {selectedCourse.duration}</span>
                      </div>
                      <div className="flex flex-col text-right md:text-left">
                        <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Investasi</span>
                        <span className="font-bold text-amber-600 flex items-center gap-2 justify-end md:justify-start">
                          <Tag size={16} /> {selectedCourse.price ? formatRupiah(Number(selectedCourse.price)) : "Gratis"}
                        </span>
                      </div>
                    </div>

                    <div className="prose-content mb-10 w-full max-w-full">
                      <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4 flex items-center gap-2">
                        <span className="w-6 h-[1px] bg-zinc-300"></span> Deskripsi Kurikulum
                      </h4>
                      <div 
                        className="text-zinc-600 leading-relaxed text-sm md:text-base break-words overflow-x-auto"
                        dangerouslySetInnerHTML={{ __html: selectedCourse.description }}
                      />
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-zinc-100">
                      <Button 
                        onClick={() => handleEnroll(selectedCourse.id)}
                        className="flex-1 bg-zinc-900 hover:bg-amber-600 text-white h-14 rounded-xl font-black uppercase tracking-[0.2em] shadow-lg transition-all"
                      >
                        Daftar Sekarang
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setSelectedCourse(null)} 
                        className="flex-1 h-14 rounded-xl border-2 border-zinc-100 font-black uppercase tracking-[0.2em] text-zinc-400 hover:bg-zinc-50"
                      >
                        Kembali
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
