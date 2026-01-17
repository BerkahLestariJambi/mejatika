"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  Calendar, User, ChevronLeft, Share2, BookOpen, Clock,
  Facebook, Twitter, Linkedin, Loader2, Bookmark, MessageCircle
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function ArticleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const API_BASE = "https://backend.mejatika.com"

  useEffect(() => {
    if (params.slug) {
      fetchDetail()
    }
  }, [params.slug])

  const fetchDetail = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/articles/read/${params.slug}`)
      const json = await res.json()
      if (json.success) {
        setArticle(json.data)
      }
    } catch (err) {
      console.error("Gagal memuat artikel", err)
    } finally {
      setLoading(false)
    }
  }

  const shareArticle = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Link berhasil disalin!")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa]">
        <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white text-center">
        <h1 className="text-3xl font-black uppercase italic">Artikel Tidak Ditemukan</h1>
        <Link href="/articles" className="mt-4 text-amber-500 font-bold underline">KEMBALI KE DAFTAR</Link>
      </div>
    )
  }

  return (
    <div className="bg-[#f4f4f5] min-h-screen pb-20 selection:bg-amber-200 overflow-x-hidden">
      {/* FLOATING HEADER */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-zinc-100">
        <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()} className="rounded-full gap-2 font-black text-[10px] uppercase tracking-widest">
            <ChevronLeft className="w-4 h-4" /> Kembali
          </Button>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" onClick={shareArticle} className="rounded-full"><Share2 className="w-4 h-4" /></Button>
          </div>
        </div>
      </nav>

      <div className="pt-32 px-4 max-w-5xl mx-auto">
        {/* FRAME PUTIH UTAMA */}
        <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] shadow-2xl shadow-zinc-200 overflow-hidden border border-zinc-100">
          
          {/* HEADER DALAM FRAME */}
          <div className="p-8 md:p-16 text-center border-b border-zinc-50 bg-gradient-to-b from-white to-zinc-50/30">
            <div className="flex justify-center gap-3 mb-6">
              <span className="bg-amber-500 text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-full">
                {article.category?.name || "KARYA SISWA"}
              </span>
            </div>

            <h1 className="text-3xl md:text-6xl font-black tracking-tighter leading-[1] text-zinc-900 mb-8 italic uppercase">
              {article.title}
            </h1>

            <div className="flex justify-center items-center gap-4">
               <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md">
                  <img src={article.author_photo || `https://ui-avatars.com/api/?name=${article.author_name}&background=f59e0b&color=fff`} className="w-full h-full object-cover" alt="Author" />
               </div>
               <div className="text-left">
                  <p className="text-[10px] font-black uppercase text-zinc-400 leading-none">Penulis</p>
                  <p className="text-sm font-black text-zinc-900 uppercase italic">{article.author_name}</p>
               </div>
            </div>
          </div>

          {/* COVER IMAGE - Terkunci di dalam Frame */}
          <div className="px-6 md:px-12 mt-4">
            <div className="aspect-video w-full rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-xl">
              <img 
                src={article.cover_image?.startsWith('http') ? article.cover_image : `${API_BASE}/storage/${article.cover_image}`} 
                className="w-full h-full object-cover" 
                alt="Cover" 
              />
            </div>
          </div>

          {/* KONTEN ARTIKEL - INI YANG SAYA PERBAIKI AGAR TIDAK KELUAR FRAME */}
          <main className="px-6 py-12 md:px-20 md:py-20 flex justify-center">
            <div className="w-full max-w-3xl overflow-hidden"> {/* PENGUNCI LEBAR TEKS */}
              <div 
                className="prose prose-zinc prose-lg md:prose-xl max-w-none
                prose-headings:font-black prose-headings:tracking-tighter prose-headings:uppercase prose-headings:italic
                prose-p:text-zinc-600 prose-p:leading-[1.8] prose-p:mb-6 prose-p:break-words
                prose-img:rounded-2xl prose-img:shadow-lg prose-img:mx-auto
                prose-blockquote:border-l-4 prose-blockquote:border-amber-500 prose-blockquote:italic prose-blockquote:bg-zinc-50 prose-blockquote:p-4 prose-blockquote:rounded-r-xl"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* BAR INTERAKSI BAWAH */}
              <div className="mt-16 pt-10 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-6">
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-full font-black uppercase text-[10px] tracking-widest text-zinc-500">
                      <BookOpen className="w-4 h-4 text-amber-500" /> {article.views || 0} VIEWS
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost" className="rounded-full hover:text-blue-600"><Facebook className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" className="rounded-full hover:text-sky-500"><Twitter className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" className="rounded-full hover:text-blue-800"><Linkedin className="w-4 h-4" /></Button>
                 </div>
              </div>
            </div>
          </main>

          {/* FOOTER PENULIS */}
          <footer className="bg-zinc-900 p-8 md:p-16 text-white">
             <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white flex-shrink-0">
                   <img 
                    src={article.author_photo || `https://ui-avatars.com/api/?name=${article.author_name}&background=f59e0b&color=fff`} 
                    className="w-full h-full object-cover" 
                    alt="Author" 
                   />
                </div>
                <div className="text-center md:text-left">
                   <h3 className="text-2xl font-black italic uppercase mb-2">{article.author_name}</h3>
                   <p className="text-zinc-400 text-sm max-w-xl">
                     {article.author_bio || "Pelajar aktif Mejatika yang fokus pada pengembangan literasi dan teknologi."}
                   </p>
                </div>
             </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
