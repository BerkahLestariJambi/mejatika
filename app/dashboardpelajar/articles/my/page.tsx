"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Plus, 
  Search, 
  Eye, 
  Edit3, 
  Trash2, 
  MoreVertical, 
  FileText,
  ExternalLink,
  Loader2,
  AlertCircle
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

export default function MyArticlesPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // 1. Fungsi Ambil Data (Sangat Detail)
  const fetchMyArticles = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("https://backend.mejatika.com/api/student/articles/my", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
      })
      
      const json = await res.json()
      
      if (res.ok && json.success) {
        // Cek apakah data dibungkus paginate atau get biasa
        const actualData = Array.isArray(json.data) ? json.data : (json.data?.data || [])
        setArticles(actualData)
      } else {
        setArticles([])
        if (res.status === 401) toast.error("Sesi habis, silakan login kembali")
      }
    } catch (err) {
      console.error("Fetch Error:", err)
      toast.error("Gagal terhubung ke server")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyArticles()
  }, [])

  // 2. Fungsi Hapus
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Hapus Karya?',
      text: "Data yang dihapus tidak bisa dipulihkan kembali!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#71717a',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'rounded-[2.5rem]',
        confirmButton: 'rounded-2xl font-black uppercase text-[10px] px-8 py-4',
        cancelButton: 'rounded-2xl font-black uppercase text-[10px] px-8 py-4'
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
          toast.success("Karya berhasil dibuang")
          fetchMyArticles()
        }
      } catch (err) {
        toast.error("Gagal menghapus data")
      }
    }
  }

  // Filter Search
  const filteredArticles = articles.filter((art: any) =>
    art.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-8 min-h-screen uppercase tracking-tight italic">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-zinc-900 leading-none">
            Karya <span className="text-amber-500 text-5xl">SAYA</span>
          </h1>
          <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2 not-italic">
            Workspace / Article Management
          </p>
        </div>
        <Link href="/dashboardpelajar/articles/create">
          <Button className="bg-amber-500 hover:bg-zinc-900 text-white rounded-2xl px-8 h-16 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-amber-500/20 gap-3 transition-all active:scale-95">
            <Plus className="w-5 h-5" /> Tulis Karya Baru
          </Button>
        </Link>
      </div>

      {/* FILTER & SEARCH */}
      <div className="relative group not-italic">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5 group-focus-within:text-amber-500 transition-colors" />
        <Input 
          placeholder="Cari judul tulisanmu di sini..." 
          className="pl-14 h-16 rounded-[1.5rem] border-none shadow-sm bg-white focus:ring-2 ring-amber-500/50 text-sm font-medium transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* LIST ARTIKEL */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
          <p className="mt-4 text-zinc-400 font-black uppercase text-[9px] tracking-[0.4em]">Sinkronisasi Data Database...</p>
        </div>
      ) : filteredArticles.length > 0 ? (
        <div className="grid gap-5">
          {filteredArticles.map((article: any) => (
            <Card key={article.id} className="rounded-[2.5rem] border-none shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white group border-l-0 hover:border-l-[8px] hover:border-amber-500">
              <CardContent className="p-4 md:p-5">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  
                  {/* Thumbnail */}
                  <div className="w-full md:w-44 h-32 rounded-[1.8rem] bg-zinc-100 overflow-hidden flex-shrink-0 relative">
                    {article.cover_image ? (
                      <img 
                        src={article.cover_image} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 font-black italic" 
                        alt="cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=No+Image";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-300"><FileText className="w-10 h-10 opacity-20" /></div>
                    )}
                    <div className="absolute top-2 left-2">
                       <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase shadow-sm ${article.status === 'published' ? 'bg-green-500 text-white' : 'bg-zinc-900 text-white'}`}>
                          {article.status}
                       </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-grow space-y-2 text-center md:text-left">
                    <span className="text-[9px] font-black uppercase text-amber-500 tracking-widest not-italic">
                      {article.category?.name || "Karya Umum"}
                    </span>
                    <h3 className="text-xl font-black text-zinc-800 line-clamp-1 group-hover:translate-x-1 transition-transform uppercase italic">
                      {article.title}
                    </h3>
                    <div className="flex items-center justify-center md:justify-start gap-5 text-zinc-400 text-[10px] font-bold uppercase tracking-tighter not-italic">
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" /> {article.views || 0}
                      </div>
                      <div>
                        {new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 not-italic">
                    <Link href={`/articles/read/${article.slug}`} target="_blank">
                      <Button variant="ghost" size="icon" className="rounded-2xl w-12 h-12 bg-zinc-50 hover:bg-amber-50 hover:text-amber-600">
                        <ExternalLink className="w-5 h-5" />
                      </Button>
                    </Link>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-2xl w-12 h-12 bg-zinc-50">
                          <MoreVertical className="w-5 h-5 text-zinc-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-[1.5rem] p-3 border-none shadow-2xl bg-white min-w-[160px]">
                        
                        {/* LINK KE HALAMAN EDIT - SESUAIKAN FOLDER [id] */}
                        <Link href={`/dashboardpelajar/articles/edit/${article.id}`}>
                          <DropdownMenuItem className="rounded-xl gap-3 py-3 font-black uppercase text-[9px] focus:bg-amber-50 focus:text-amber-600 cursor-pointer transition-all">
                            <Edit3 className="w-4 h-4" /> Edit Tulisan
                          </DropdownMenuItem>
                        </Link>

                        <DropdownMenuItem 
                          onClick={() => handleDelete(article.id)}
                          className="rounded-xl gap-3 py-3 font-black uppercase text-[9px] focus:bg-red-50 focus:text-red-600 text-red-500 cursor-pointer transition-all"
                        >
                          <Trash2 className="w-4 h-4" /> Hapus Permanen
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
        <div className="bg-white rounded-[3.5rem] py-24 text-center border-2 border-dashed border-zinc-100 shadow-inner flex flex-col items-center justify-center italic font-bold">
          <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-zinc-200" />
          </div>
          <h3 className="text-xl font-black uppercase italic text-zinc-300">Belum Ada Karya Terdeteksi</h3>
          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mt-2 mb-8 not-italic">Mulailah menulis dan jadilah inspirasi!</p>
          <Link href="/dashboardpelajar/articles/create">
            <Button className="bg-zinc-900 hover:bg-amber-500 text-white rounded-2xl px-10 h-14 font-black uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-zinc-200">
              Mulai Menulis Sekarang
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
