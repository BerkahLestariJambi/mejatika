"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  ChevronLeft, Share2, Loader2, 
  ChevronUp, Bookmark
} from "lucide-react"
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

  // FUNGSI SAKTI: Mengubah teks mentah menjadi paragraf HTML yang rapi
  const formatContent = (content: string) => {
    if (!content) return ""
    // Jika konten sudah punya tag HTML <p>, biarkan saja
    if (content.includes("<p>")) return content
    // Jika tidak, ubah setiap double enter menjadi paragraf
    return content
      .split(/\n\s*\n/)
      .map(para => `<p>${para.replace(/\n/g, " ")}</p>`)
      .join("")
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
        {/* FRAME KERTAS - Kunci agar tidak bocor: overflow-hidden & break-words */}
        <div className="max-w-3xl mx-auto bg-[#fdfdfc] shadow-2xl rounded-sm border border-zinc-200 overflow-hidden break-words">
          
          <div className="relative z-10 p-6 md:p-16 lg:p-20">
            
            <header className="mb-12 text-center border-b border-zinc-100 pb-10">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600 mb-4 block leading-none">
                {article.category?.name || "LITERASI"}
              </span>
              <h1 className="text-3xl md:text-5xl font-serif text-zinc-900 leading-tight mb-8">
                {article.title}
              </h1>
              <div className="flex items-center justify-center gap-3">
                <img src={article.author_photo || `https://ui-avatars.com/api/?name=${article.author_name}`} className="w-8 h-8 rounded-full grayscale" alt="" />
                <span className="text-xs font-serif italic text-zinc-500">Karya {article.author_name}</span>
              </div>
            </header>

            {/* Gambar Utama */}
            <div className="mb-12">
               <div className="w-full max-w-2xl mx-auto aspect-video rounded-sm overflow-hidden shadow-sm">
                  <img 
                    src={article.cover_image?.startsWith('http') ? article.cover_image : `${API_BASE}/storage/${article.cover_image}`} 
                    className="w-full h-full object-cover" 
                    alt="Cover" 
                  />
               </div>
            </div>

            {/* AREA ARTIKEL - FIXED FRAME */}
            <main className="w-full max-w-full overflow-hidden">
              <article 
                className="prose prose-zinc max-w-none 
                text-left font-serif text-zinc-800
                
                {/* Solusi Frame & Jarak Paragraf */}
                [&_p]:mb-10 
                [&_p]:leading-[1.8] 
                [&_p]:text-lg 
                md:[&_p]:text-xl
                [&_p]:break-words

                {/* Heading & Tipografi */}
                prose-headings:font-serif prose-headings:text-zinc-900
                prose-strong:text-zinc-950 prose-strong:font-bold
                
                {/* Gambar dalam teks */}
                prose-img:rounded-md prose-img:mx-auto prose-img:my-10 prose-img:max-w-full
                "
                dangerouslySetInnerHTML={{ __html: formatContent(article.content) }}
              />

              <div className="mt-20 flex justify-center items-center gap-4 opacity-10">
                <div className="h-[1px] w-12 bg-zinc-900" />
                <div className="w-2 h-2 rotate-45 bg-zinc-900" />
                <div className="h-[1px] w-12 bg-zinc-900" />
              </div>
            </main>
          </div>

          <footer className="bg-zinc-50 border-t border-zinc-100 p-10">
             <div className="flex flex-col md:flex-row items-center gap-6 max-w-xl mx-auto opacity-70">
                <img src={article.author_photo || `https://ui-avatars.com/api/?name=${article.author_name}`} className="w-14 h-14 rounded-full grayscale border border-zinc-200" alt="" />
                <div className="text-center md:text-left">
                   <h4 className="font-serif text-lg text-zinc-900">{article.author_name}</h4>
                   <p className="text-xs font-serif italic text-zinc-400">Kontributor Mejatika</p>
                </div>
             </div>
          </footer>
        </div>
      </div>

      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-8 right-8 w-12 h-12 bg-zinc-950 text-white flex items-center justify-center rounded-full shadow-2xl z-50 transition-all ${scrollProgress > 20 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <ChevronUp className="w-6 h-6" />
      </button>
    </div>
  )
}
