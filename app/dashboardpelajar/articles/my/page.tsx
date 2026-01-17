"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { 
  Plus, Search, Eye, Edit3, Trash2, MoreVertical, 
  FileText, ExternalLink, Loader2, AlertCircle, 
  Calendar, Layers, ArrowRight
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Swal from "sweetalert2"

// --- SKELETON COMPONENT (Biar pas loading tetap estetik) ---
const SkeletonCard = () => (
  <div className="w-full h-40 bg-zinc-50 animate-pulse rounded-[2.5rem] border border-zinc-100 mb-4" />
)

export default function MyArticlesPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // 1. FUNGSI AMBIL DATA (Sangat Detail & Aman)
  const fetchMyArticles = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("https://backend.mejatika.com/api/student/articles/my", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
          "Cache-Control": "no-cache"
        },
      })
      
      const json = await res.json()
      
      if (res.ok && json.success) {
        // Handle data jika dibungkus pagination atau array biasa
        const actualData = Array.isArray(json.data) ? json.data : (json.data?.data || [])
        setArticles(actualData)
      } else {
        setArticles([])
        if (res.status === 401) toast.error("Sesi login berakhir")
      }
    } catch (err) {
      console.error("Fetch Error:", err)
      toast.error("Gagal terhubung ke server backend")
    } finally {
      // Kasih delay sedikit biar transisinya halus
      setTimeout(() => setLoading(false), 500)
    }
  }, [])

  useEffect(() => {
    fetchMyArticles()
  }, [fetchMyArticles])

  // 2. FUNGSI HAPUS (Dengan SweetAlert Gahar)
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'BUANG KARYA?',
      text: "Data yang sudah dibuang akan masuk ke arsip sistem dan tidak bisa dikembalikan olehmu!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000000',
      cancelButtonColor: '#f4f4f5',
      confirmButtonText: 'YA, HAPUS PERMANEN',
      cancelButtonText: 'BATAL',
      reverseButtons: true,
      customClass: {
        popup: 'rounded-[3rem] border-none italic font-black',
        confirmButton: 'rounded-2xl px-8 py-4 uppercase text-[10px] tracking-widest',
        cancelButton: 'rounded-2xl px-8 py-4 uppercase text-[10px] tracking-widest text-zinc-400'
      }
    })

    if (result.isConfirmed) {
      try {
        const res = await fetch(`https://backend.mejatika.com/api/student/articles/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Accept": "application/json"
          },
        })
        if (res.ok) {
          toast.success("Karya berhasil dimusnahkan")
          fetchMyArticles()
        }
      } catch (err) {
        toast.error("Gagal menghapus karya")
      }
    }
  }

  // 3. FILTER SEARCHING
  const filteredArticles = articles.filter((art: any) =>
    art.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    art.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-10 min-h-screen uppercase tracking-tight italic">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-amber-500 mb-2 not-italic">
            <Layers className="w-5 h-5" />
            <span className="text-[10px] font-black tracking-[0.5em]">ARTICLE DATABASE V.1.0</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-zinc-900 leading-[0.8]">
            ARSIP <span className="text-amber-500">KARYA</span>
          </h1>
          <p className="text-zinc-400 font-bold text-[11px] uppercase tracking-[0.3em] not-italic">
            Kelola dan pantau seluruh tulisanmu dalam satu dashboard
          </p>
        </div>
        
        <Link href="/dashboardpelajar/articles/create">
          <Button className="bg-zinc-900 hover:bg-amber-500 text-white rounded-2xl px-10 h-20 font-black uppercase text-xs tracking-widest shadow-2xl transition-all hover:-rotate-2 active:scale-95 group">
            Tulis Karya Baru <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </Button>
        </Link>
      </div>

      {/* FILTER & STATS SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 not-italic">
        <div className="md:col-span-3 relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5 group-focus-within:text-amber-500 transition-colors" />
          <Input 
            placeholder="Cari judul atau kategori karya..." 
            className="pl-16 h-20 rounded-[2rem] border-none shadow-xl bg-white focus:ring-4 ring-amber-500/10 text-sm font-bold transition-all placeholder:text-zinc-300 uppercase italic"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="bg-amber-500 rounded-[2rem] flex flex-col items-center justify-center text-white p-4 shadow-xl shadow-amber-500/20">
            <span className="text-[9px] font-black tracking-widest uppercase">Total Karya</span>
            <span className="text-3xl font-black italic line-height-none">{articles.length}</span>
        </div>
      </div>

      {/* LIST CONTENT */}
      {loading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filteredArticles.length > 0 ? (
        <div className="grid gap-6">
          {filteredArticles.map((article: any) => (
            <Card key={article.id} className="rounded-[3rem] border-none shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white group hover:-translate-y-1">
              <CardContent className="p-2 md:p-3">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  
                  {/* Image Container */}
                  <div className="w-full md:w-56 h-40 rounded-[2.5rem] bg-zinc-100 overflow-hidden flex-shrink-0 relative border-4 border-transparent group-hover:border-zinc-50 transition-all">
                    {article.cover_image ? (
                      <img 
                        src={article.cover_image} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                        alt="cover"
                        onError={(e) => { (e.currentTarget.src = "https://placehold.co/600x400?text=IMAGE+NOT+FOUND") }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-300">
                        <FileText className="w-12 h-12 opacity-20" />
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4">
                       <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-xl ${article.status === 'published' ? 'bg-green-500 text-white' : 'bg-zinc-900 text-white'}`}>
                          ● {article.status}
                       </span>
                    </div>
                  </div>

                  {/* Information Detail */}
                  <div className="flex-grow space-y-3 py-4 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest not-italic">
                        {article.category?.name || "UNSET CATEGORY"}
                        </span>
                    </div>
                    
                    <h3 className="text-2xl md:text-3xl font-black text-zinc-800 line-clamp-1 group-hover:text-amber-500 transition-colors uppercase italic tracking-tighter">
                      {article.title}
                    </h3>

                    <div className="flex items-center justify-center md:justify-start gap-6 text-zinc-400 text-[10px] font-bold uppercase tracking-widest not-italic">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-amber-500" /> 
                        <span className="text-zinc-900">{article.views || 0}</span> Views
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(article.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  {/* Action Section */}
                  <div className="flex items-center gap-3 pr-8 pb-6 md:pb-0 not-italic">
                    <Link href={`/articles/read/${article.slug}`} target="_blank">
                      <Button variant="outline" size="icon" className="rounded-2xl w-14 h-14 border-zinc-100 hover:bg-zinc-900 hover:text-white transition-all">
                        <ExternalLink className="w-5 h-5" />
                      </Button>
                    </Link>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-2xl w-14 h-14 bg-zinc-50 hover:bg-zinc-100">
                          <MoreVertical className="w-5 h-5 text-zinc-900" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-[2rem] p-4 border-none shadow-2xl bg-white min-w-[200px]">
                        <Link href={`/dashboardpelajar/articles/edit/${article.id}`}>
                          <DropdownMenuItem className="rounded-xl gap-4 py-4 font-black uppercase text-[10px] focus:bg-amber-50 focus:text-amber-600 cursor-pointer transition-all italic">
                            <Edit3 className="w-5 h-5" /> Edit Konten Karya
                          </DropdownMenuItem>
                        </Link>

                        <DropdownMenuItem 
                          onClick={() => handleDelete(article.id)}
                          className="rounded-xl gap-4 py-4 font-black uppercase text-[10px] focus:bg-red-50 focus:text-red-600 text-red-500 cursor-pointer transition-all italic"
                        >
                          <Trash2 className="w-5 h-5" /> Buang ke Tempat Sampah
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-50 rounded-[4rem] py-32 text-center border-4 border-dashed border-zinc-100 flex flex-col items-center justify-center italic">
          <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center mb-8 shadow-xl">
            <AlertCircle className="w-12 h-12 text-zinc-200" />
          </div>
          <h3 className="text-3xl font-black uppercase italic text-zinc-300 tracking-tighter leading-none">DATABASE KOSONG</h3>
          <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-[0.4em] mt-4 mb-10 not-italic">Sepertinya kamu belum mempublikasikan karya apapun hari ini.</p>
          <Link href="/dashboardpelajar/articles/create">
            <Button className="bg-amber-500 hover:bg-zinc-900 text-white rounded-2xl px-12 h-16 font-black uppercase text-[11px] tracking-widest transition-all shadow-2xl shadow-amber-500/20">
              MULAI MENULIS SEKARANG
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
