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
  Loader2
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

export default function MyArticlesPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // 1. Ambil data artikel milik siswa yang login
  const fetchMyArticles = async () => {
    try {
      const res = await fetch("https://backend.mejatika.com/api/student/articles/my", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const json = await res.json()
      if (json.success) setArticles(json.data)
    } catch (err) {
      toast.error("Gagal memuat daftar artikel")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyArticles()
  }, [])

  // 2. Fungsi Hapus Artikel
  const handleDelete = async (id: number) => {
    if (!confirm("Apakah kamu yakin ingin menghapus karya ini?")) return

    try {
      const res = await fetch(`https://backend.mejatika.com/api/student/articles/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (res.ok) {
        toast.success("Artikel berhasil dihapus")
        fetchMyArticles()
      }
    } catch (err) {
      toast.error("Gagal menghapus artikel")
    }
  }

  const filteredArticles = articles.filter((art: any) =>
    art.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-zinc-900">
            Karya Saya
          </h1>
          <p className="text-zinc-500 font-medium text-sm">
            Kelola dan pantau statistik tulisanmu di Mejatika.
          </p>
        </div>
        <Link href="/dashboardpelajar/articles/create">
          <Button className="bg-amber-500 hover:bg-amber-600 text-white rounded-full px-8 h-14 font-bold shadow-lg shadow-amber-500/20 gap-2 transition-all hover:scale-105">
            <Plus className="w-5 h-5" /> Tulis Artikel Baru
          </Button>
        </Link>
      </div>

      {/* FILTER & SEARCH */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
        <Input 
          placeholder="Cari judul artikel..." 
          className="pl-12 h-14 rounded-2xl border-none shadow-sm bg-white focus:ring-2 ring-amber-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* LIST ARTIKEL */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
          <p className="mt-4 text-zinc-400 font-bold uppercase text-xs tracking-widest">Memuat Karya...</p>
        </div>
      ) : filteredArticles.length > 0 ? (
        <div className="grid gap-4">
          {filteredArticles.map((article: any) => (
            <Card key={article.id} className="rounded-[2rem] border-none shadow-sm hover:shadow-xl transition-all overflow-hidden bg-white group">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  
                  {/* Thumbnail */}
                  <div className="w-full md:w-40 h-28 rounded-2xl bg-zinc-100 overflow-hidden flex-shrink-0">
                    {article.cover_image ? (
                      <img src={article.cover_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-300"><FileText /></div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-grow space-y-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                      <span className="px-3 py-1 bg-amber-100 text-amber-600 text-[10px] font-black uppercase rounded-full">
                        {article.category?.name || "Uncategorized"}
                      </span>
                      <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full ${article.status === 'published' ? 'bg-green-100 text-green-600' : 'bg-zinc-100 text-zinc-500'}`}>
                        {article.status}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-zinc-800 line-clamp-1 group-hover:text-amber-500 transition-colors">
                      {article.title}
                    </h3>
                    <div className="flex items-center justify-center md:justify-start gap-4 text-zinc-400 text-sm">
                      <div className="flex items-center gap-1 font-medium">
                        <Eye className="w-4 h-4" /> {article.views} Kali dibaca
                      </div>
                      <div className="font-medium">
                        {new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link href={`/articles/read/${article.slug}`} target="_blank">
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-zinc-100">
                        <ExternalLink className="w-5 h-5 text-zinc-400" />
                      </Button>
                    </Link>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <MoreVertical className="w-5 h-5 text-zinc-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl p-2 border-none shadow-2xl">
                        <DropdownMenuItem className="rounded-xl gap-2 font-bold focus:bg-amber-50 focus:text-amber-600 cursor-pointer">
                          <Edit3 className="w-4 h-4" /> Edit Artikel
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(article.id)}
                          className="rounded-xl gap-2 font-bold focus:bg-red-50 focus:text-red-600 text-red-500 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" /> Hapus
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
        <div className="bg-zinc-50 rounded-[3rem] py-20 text-center border-2 border-dashed border-zinc-200">
          <FileText className="w-16 h-16 text-zinc-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-zinc-400">Kamu belum menulis artikel apapun.</h3>
          <p className="text-zinc-400 text-sm mb-6">Ayo bagikan karyamu hari ini!</p>
          <Link href="/dashboardpelajar/articles/create">
            <Button className="bg-zinc-900 text-white rounded-full px-8">Mulai Menulis</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
