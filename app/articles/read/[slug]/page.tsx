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

  const formatContent = (content: string) => {
    if (!content) return ""
    if (content.includes("<p>")) return content.trim()
    return content
      .split(/\n\s*\n/)
      .map(para => `<p>${para.replace(/\n/g, " ").trim()}</p>`)
      .join("")
  }

  const getAuthorImage = (authorPhoto: string) => {
    if (!authorPhoto) return `https://ui-avatars.com/api/?name=${article?.author_name || 'Admin'}`
    if (authorPhoto.startsWith('http')) return authorPhoto
    return `${API_BASE}/storage/${authorPhoto}`
  }

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f7f2]">
      <Loader2 className="w-10 h-10 animate-spin text-zinc-400" />
    </div>
  )

  if (!article) return null

  return (
    <div className="bg-[#e5e3d8] min-h-screen pb-20 selection:bg-amber-100 overflow-x-hidden">
      
      <div className="fixed top-0 left-0 h-1 bg-zinc-800 z-[60] transition-all duration-150" style={{ width: `${scrollProgress}%` }} />

      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#fdfdfc]/90 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => router.back()} className="text-zinc-500 hover:text-zinc-900 flex items-center gap-1 text-xs font-bold uppercase tracking-widest">
            <ChevronLeft className="w-4 h-4" /> Koleksi
          </button>
          <div className="flex items-center gap-4">
            <Bookmark className="w-4 h-4 text-amber-600 fill-amber-600" />
          </div>
        </div>
      </nav>

      <div className="pt-24 px-4">
        {/* FRAME KERTAS MODEL A4 */}
        <div className="max-w-[210mm] mx-auto bg-[#fdfdfc] shadow-[0_0_50px_rgba(0,0,0,0.1)] min-h-[297mm] border border-zinc-200 overflow-hidden flex flex-col">
          
          {/* MARGIN KONSISTEN 3CM (12 Tailwind units) DI SEMUA SISI */}
          <div className="p-8 md:p-12 lg:p-12 flex-1 flex flex-col">
            
            <header className="mb-12 text-center border-b border-zinc-100 pb-10">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600 mb-4 block">
                {article.category?.name || "LITERASI"}
              </span>
              <h1 className="text-3xl md:text-5xl font-serif text-zinc-900 leading-tight mb-8">
                {article.title}
              </h1>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-100 bg-zinc-50">
                  <img 
                    src={getAuthorImage(article.author_photo || article.author_image)} 
                    className="w-full h-full object-cover grayscale" 
                    alt={article.author_name} 
                  />
                </div>
                <span className="text-xs font-serif italic text-zinc-500">Karya {article.author_name}</span>
              </div>
            </header>

            {/* Gambar Cover dalam Frame */}
            <div className="mb-12">
               <div className="w-full aspect-video rounded-sm overflow-hidden shadow-sm border border-zinc-50">
                  <img 
                    src={article.cover_image?.startsWith('http') ? article.cover_image : `${API_BASE}/storage/${article.cover_image}`} 
                    className="w-full h-full object-cover" 
                    alt="Cover" 
                  />
               </div>
            </div>

            {/* KONTEN ARTIKEL RATA KIRI-KANAN (JUSTIFIED) */}
            <main className="w-full flex-1">
              <article 
                className="prose prose-zinc max-w-none font-serif text-zinc-800
                
                {/* SETTINGAN RATA KIRI-KANAN & ANTI KATA PECAH */}
                text-justify [text-justify:inter-word] [hyphens:auto]
                [word-break:normal] [overflow-wrap:break-word]
                
                {/* Jarak Paragraf Konsisten */}
                [&_p]:mb-8 
                [&_p]:leading-[1.8] 
                [&_p]:text-lg 
                md:[&_p]:text-xl

                prose-headings:font-serif prose-headings:text-zinc-900 prose-headings:text-left
                prose-strong:text-zinc-950 prose-strong:font-bold
                prose-img:rounded-md prose-img:mx-auto prose-img:my-10 prose-img:max-w-full
                "
                dangerouslySetInnerHTML={{ __html: formatContent(article.content) }}
              />
            </main>

            {/* Footer Penulis tetap di dalam Margin 3 */}
            <footer className="mt-20 pt-10 border-t border-zinc-100 flex flex-col md:flex-row items-center gap-6 opacity-70">
                <div className="w-16 h-16 rounded-full overflow-hidden border border-zinc-200">
                  <img 
                    src={getAuthorImage(article.author_photo || article.author_image)} 
                    className="w-full h-full object-cover grayscale" 
                    alt={article.author_name} 
                  />
                </div>
                <div className="text-center md:text-left">
                   <h4 className="font-serif text-lg text-zinc-900">{article.author_name}</h4>
                   <p className="text-xs font-serif italic text-zinc-400">Mejatika Digital Press — 2026</p>
                </div>
            </footer>
          </div>
        </div>
      </div>

      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-8 right-8 w-12 h-12 bg-zinc-950 text-white flex items-center justify-center rounded-full shadow-2xl z-50 transition-all ${scrollProgress > 20 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <ChevronUp className="w-6 h-6" />
      </button>
    </div>
  )
}
