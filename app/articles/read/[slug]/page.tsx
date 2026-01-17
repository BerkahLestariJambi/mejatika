"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  ChevronLeft, Share2, Loader2, 
  ChevronUp, Bookmark, Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function ArticleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [scrollProgress, setScrollProgress] = useState(0)

  const API_BASE = "https://backend.mejatika.com"

  useEffect(() => {
    const updateScrollProgress = () => {
      const currentScroll = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (currentScroll / scrollHeight) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", updateScrollProgress);
    return () => window.removeEventListener("scroll", updateScrollProgress);
  }, []);

  useEffect(() => {
    if (params.slug) fetchDetail()
  }, [params.slug])

  const fetchDetail = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/articles/read/${params.slug}`)
      const json = await res.json()
      if (json.success) setArticle(json.data)
    } catch (err) {
      console.error("Gagal memuat artikel", err)
    } finally {
      setLoading(false)
    }
  }

  const shareArticle = () => {
    if (navigator.share) {
      navigator.share({ title: article.title, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link berhasil disalin!")
    }
  }

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f7f2]">
      <Loader2 className="w-10 h-10 animate-spin text-zinc-400" />
    </div>
  )

  if (!article) return null

  return (
    <div className="bg-[#f0eee2] min-h-screen pb-20 selection:bg-amber-100 overflow-x-hidden">
      
      {/* PROGRESS BAR */}
      <div className="fixed top-0 left-0 h-1 bg-zinc-800 z-[60] transition-all duration-150" style={{ width: `${scrollProgress}%` }} />

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#fdfdfc]/90 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => router.back()} className="text-zinc-500 hover:text-zinc-900 flex items-center gap-1 text-xs font-bold uppercase tracking-widest">
            <ChevronLeft className="w-4 h-4" /> Koleksi
          </button>
          <div className="flex items-center gap-4">
            <button onClick={shareArticle} className="text-zinc-500"><Share2 className="w-4 h-4" /></button>
            <Bookmark className="w-4 h-4 text-amber-600 fill-amber-600" />
          </div>
        </div>
      </nav>

      <div className="pt-24 px-4 sm:px-6">
        {/* PAPER CONTAINER: Menambahkan overflow-hidden untuk menjaga konten tetap di dalam */}
        <div className="max-w-3xl mx-auto bg-[#fdfdfc] shadow-2xl rounded-sm border border-zinc-200 overflow-hidden break-words">
          
          <div className="relative z-10 p-6 md:p-14 lg:p-16">
            
            {/* Judul Artikel */}
            <header className="mb-10 text-center border-b border-zinc-50 pb-10">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600 mb-4 block">
                {article.category?.name || "Literasi Digital"}
              </span>
              <h1 className="text-2xl md:text-5xl font-serif text-zinc-900 leading-tight mb-6 px-2 overflow-wrap-anywhere">
                {article.title}
              </h1>
              <div className="flex items-center justify-center gap-4 text-zinc-400">
                <div className="flex items-center gap-2">
                  <img src={article.author_photo || `https://ui-avatars.com/api/?name=${article.author_name}`} className="w-6 h-6 rounded-full grayscale" alt="" />
                  <span className="text-xs font-serif italic">{article.author_name}</span>
                </div>
                <span className="text-[10px]">•</span>
                <span className="text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 5 Min Read
                </span>
              </div>
            </header>

            {/* Gambar Sampul Proporsional */}
            <div className="mb-10 flex justify-center">
               <div className="w-full max-w-xl aspect-video rounded-sm overflow-hidden shadow-md border border-zinc-100">
                  <img 
                    src={article.cover_image?.startsWith('http') ? article.cover_image : `${API_BASE}/storage/${article.cover_image}`} 
                    className="w-full h-full object-cover" 
                    alt="Cover" 
                  />
               </div>
            </div>

            {/* ARTIKEL: Kunci Utama Anti-Terpotong */}
            <main className="relative">
              <article 
                className="prose prose-zinc max-w-none 
                w-full 
                {/* CSS MAGIC UNTUK ANTI-BOCOR */}
                overflow-wrap-anywhere 
                [word-break:break-word] 
                whitespace-pre-wrap
                text-justify [text-justify:inter-word]
                
                {/* Tipografi Buku */}
                prose-p:font-serif prose-p:text-zinc-700 prose-p:leading-[1.8] prose-p:text-lg md:prose-p:text-xl prose-p:mb-8
                prose-headings:font-serif prose-headings:text-zinc-900 prose-headings:mb-6
                prose-strong:text-zinc-950 prose-strong:font-bold
                
                {/* Gambar Konten: Dibuat Kecil */}
                prose-img:rounded-sm 
                prose-img:max-w-[90%] 
                md:prose-img:max-w-[70%] 
                prose-img:mx-auto 
                prose-img:my-8
                prose-img:shadow-sm

                {/* List agar tidak keluar margin */}
                prose-ol:pl-5 prose-ul:pl-5
                prose-li:font-serif prose-li:text-zinc-700
                "
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Tanda Berakhirnya Halaman */}
              <div className="mt-16 flex justify-center items-center gap-3 opacity-20">
                <div className="h-[1px] w-8 bg-zinc-900" />
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
                <div className="h-[1px] w-8 bg-zinc-900" />
              </div>
            </main>
          </div>

          {/* Penulis Footer */}
          <footer className="bg-[#fafafa] border-t border-zinc-100 p-8 md:p-12 mt-4">
             <div className="flex flex-col md:flex-row items-center gap-6 max-w-xl mx-auto">
                <img src={article.author_photo || `https://ui-avatars.com/api/?name=${article.author_name}`} className="w-14 h-14 rounded-full grayscale border border-zinc-200" alt="" />
                <div className="text-center md:text-left">
                   <h4 className="font-serif text-lg text-zinc-900 leading-none mb-2">{article.author_name}</h4>
                   <p className="text-xs font-serif italic text-zinc-400 leading-relaxed">
                     {article.author_bio || "Kontributor Literasi Mejatika."}
                   </p>
                </div>
             </div>
          </footer>
        </div>
      </div>

      {/* FOOTER AKHIR */}
      <footer className="mt-16 text-center pb-10 opacity-30">
         <p className="font-serif text-[9px] tracking-[0.4em] uppercase italic text-zinc-500">Mejatika Publishing House</p>
      </footer>

      {/* TOMBOL ATAS */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 w-10 h-10 bg-zinc-900 text-white flex items-center justify-center rounded-full transition-all shadow-xl z-50 ${scrollProgress > 20 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
      >
        <ChevronUp className="w-5 h-5" />
      </button>
    </div>
  )
}
