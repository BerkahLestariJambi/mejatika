"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  ChevronLeft, Share2, BookOpen, Clock, 
  Facebook, Twitter, Linkedin, Loader2, 
  ChevronUp, Bookmark
} from "lucide-react"
import Link from "next/link"
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
        {/* THE PAPER CONTAINER */}
        <div className="max-w-3xl mx-auto bg-[#fdfdfc] shadow-2xl rounded-sm border border-zinc-200 overflow-hidden">
          
          <div className="relative z-10 p-6 md:p-16">
            
            {/* Header */}
            <header className="mb-12 text-center border-b border-zinc-50 pb-12">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600 mb-4 block">
                {article.category?.name || "Literasi Digital"}
              </span>
              <h1 className="text-3xl md:text-5xl font-serif text-zinc-900 leading-tight mb-8 px-2">
                {article.title}
              </h1>
              <div className="flex items-center justify-center gap-3">
                <img src={article.author_photo || `https://ui-avatars.com/api/?name=${article.author_name}`} className="w-8 h-8 rounded-full grayscale" alt="" />
                <span className="text-xs font-serif italic text-zinc-500">Karya {article.author_name}</span>
              </div>
            </header>

            {/* Featured Image - Ukuran Sedang & Rapih */}
            <div className="mb-12">
               <div className="w-full max-w-2xl mx-auto aspect-video rounded-sm overflow-hidden shadow-lg border border-zinc-100">
                  <img 
                    src={article.cover_image?.startsWith('http') ? article.cover_image : `${API_BASE}/storage/${article.cover_image}`} 
                    className="w-full h-full object-cover" 
                    alt="Cover" 
                  />
               </div>
               <p className="mt-4 text-center text-[9px] italic text-zinc-400 uppercase tracking-widest">Ilustrasi Utama</p>
            </div>

            {/* MAIN CONTENT - FIXED WIDTH & PADDING */}
            <main className="max-w-full overflow-hidden">
              <article 
                className="prose prose-zinc max-w-none 
                text-justify [text-justify:inter-word] [hyphens:auto]
                
                {/* Font & Spasi Teks */}
                prose-p:font-serif prose-p:text-zinc-700 prose-p:leading-[1.8] prose-p:text-lg md:prose-p:text-xl prose-p:mb-8
                prose-headings:font-serif prose-headings:text-zinc-900
                prose-strong:text-zinc-900 prose-strong:font-bold
                
                {/* Gambar Dalam Konten - Dibuat Mini & Cantik */}
                prose-img:rounded-sm 
                prose-img:max-w-[80%] 
                md:prose-img:max-w-[60%] 
                prose-img:mx-auto 
                prose-img:my-10 
                prose-img:shadow-md
                prose-img:border prose-img:border-zinc-100

                {/* List & Quote */}
                prose-li:font-serif prose-li:text-zinc-700
                prose-blockquote:font-serif prose-blockquote:italic prose-blockquote:border-l-4 prose-blockquote:border-amber-500 prose-blockquote:bg-zinc-50 prose-blockquote:py-2
                "
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* End Decorator */}
              <div className="mt-16 flex justify-center items-center gap-4 opacity-20">
                <div className="h-px w-10 bg-zinc-900" />
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
                <div className="h-px w-10 bg-zinc-900" />
              </div>
            </main>
          </div>

          {/* Bio Penulis */}
          <footer className="bg-[#fafafa] border-t border-zinc-100 p-8 md:p-12">
             <div className="flex flex-col md:flex-row items-center gap-6 opacity-80">
                <img src={article.author_photo || `https://ui-avatars.com/api/?name=${article.author_name}`} className="w-16 h-16 rounded-full grayscale border border-zinc-200" alt="" />
                <div className="text-center md:text-left">
                   <h4 className="font-serif text-lg text-zinc-900">{article.author_name}</h4>
                   <p className="text-xs font-serif italic text-zinc-500 leading-relaxed max-w-md">
                     {article.author_bio || "Penulis aktif yang berdedikasi dalam literasi digital di Mejatika."}
                   </p>
                </div>
             </div>
          </footer>
        </div>
      </div>

      <footer className="mt-20 text-center pb-10 opacity-30">
         <p className="font-serif text-[10px] tracking-widest uppercase italic">Mejatika Digital Press © 2024</p>
      </footer>

      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-8 right-8 w-10 h-10 bg-zinc-900 text-white flex items-center justify-center rounded-full transition-all shadow-xl z-50 ${scrollProgress > 20 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <ChevronUp className="w-5 h-5" />
      </button>
    </div>
  )
}
