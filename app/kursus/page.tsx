"use client"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Tag, Loader2, Info, X } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function KursusPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null) // Untuk detail

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 2,
    }).format(number);
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("https://backend.mejatika.com/api/courses")
        const data = await res.json()
        setCourses(Array.isArray(data) ? data : data.data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

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
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-amber-500" /></div>
        ) : (
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card 
                key={course.id} 
                className="group cursor-pointer border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-white rounded-[2.5rem] overflow-hidden flex flex-col"
                onClick={() => setSelectedCourse(course)} // Klik kartu untuk buka detail
              >
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="p-4">
                    <div className="relative h-56 w-full rounded-[2rem] overflow-hidden bg-zinc-100">
                      <img src={course.thumbnail || "/placeholder.svg"} alt={course.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                         <Info size={18} className="text-amber-600" />
                      </div>
                    </div>
                  </div>

                  <div className="p-8 pt-2 flex flex-col flex-grow">
                    <h3 className="text-2xl font-black italic uppercase text-zinc-900 mb-3 group-hover:text-amber-500 transition-colors">
                      {course.title}
                    </h3>
                    
                    <div className="bg-zinc-50 rounded-3xl p-5 space-y-3 mb-8">
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
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-[2.5rem] border-none bg-[#fcfcf9] max-h-[90vh] overflow-y-auto custom-scrollbar">
          {selectedCourse && (
            <div className="flex flex-col">
              {/* Cover Image */}
              <div className="relative h-72 md:h-96 w-full">
                <img src={selectedCourse.thumbnail || "/placeholder.svg"} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#fcfcf9] via-transparent to-black/20" />
                <button 
                  onClick={() => setSelectedCourse(null)}
                  className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 backdrop-blur rounded-full text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="px-8 md:px-12 pb-12 -mt-20 relative z-10">
                <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-zinc-100">
                  <Badge className="bg-amber-500 text-white mb-6 px-6 py-1 rounded-full uppercase font-black text-[10px] tracking-widest border-none">
                    {selectedCourse.category?.name || "Premium Course"}
                  </Badge>
                  
                  <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-zinc-900 mb-6 leading-tight">
                    {selectedCourse.title}
                  </h2>

                  <div className="flex flex-wrap gap-6 mb-10 border-y border-zinc-100 py-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Durasi Belajar</span>
                      <span className="font-bold text-zinc-900 flex items-center gap-2"><Clock size={16} className="text-amber-500" /> {selectedCourse.duration}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Biaya Investasi</span>
                      <span className="font-bold text-amber-600 flex items-center gap-2"><Tag size={16} /> {selectedCourse.price ? formatRupiah(Number(selectedCourse.price)) : "Gratis"}</span>
                    </div>
                  </div>

                  <div className="prose prose-zinc max-w-none">
                    <h4 className="text-[12px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4">Deskripsi Kurikulum</h4>
                    <div 
                      className="text-zinc-600 leading-relaxed space-y-4 prose-table:border prose-table:rounded-xl overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: selectedCourse.description }}
                    />
                  </div>

                  <div className="mt-12 flex flex-col md:flex-row gap-4">
                    <Button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white h-16 rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg shadow-amber-200">
                      Daftar Sekarang
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedCourse(null)} className="flex-1 h-16 rounded-2xl border-2 border-zinc-100 font-black uppercase tracking-[0.2em] text-zinc-400">
                      Kembali
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
