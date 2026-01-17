"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  ChevronLeft, Share2, BookOpen, Clock, 
  Facebook, Twitter, Linkedin, Loader2, 
  ArrowRight, Award, ChevronUp, Bookmark
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function ArticleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<any>(null)
  const [relatedArticles, setRelatedArticles] = useState([])
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
        fetchRelated()
      }
    } catch (err) {
      console.error("Gagal memuat artikel", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchRelated = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/articles`)
      const json = await res.json()
      if (json.success) {
        const filtered = json.data.data.filter((a: any) => a.slug !== params.slug).slice(0, 2)
        setRelatedArticles(filtered)
      }
    } catch (err) { /* silent error */ }
  }

  const shareArticle = () => {
    if (navigator.share) {
      navigator.share({ title: article.title, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link berhasil disalin!")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f7f2]">
        <Loader2 className="w-10 h-10 animate-spin text-zinc-400" />
        <p className="mt-4 font-serif italic text-zinc-500">Membuka lembaran...</p>
      </div>
    )
  }

  if (!article) return null

  return (
    <div className="bg-[#f0eee2] min-h-screen pb-20 selection:bg-amber-100 overflow-x-hidden">
      
      {/* SCROLL INDICATOR (BOOKMARK STYLE) */}
      <div 
        className="fixed top-0 left-0 h-1 bg-zinc-800 z-[60] transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* MINIMAL NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#fdfdfc]/80 backdrop-blur-sm border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => router.back()} className="text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-1 text-sm font-medium">
            <ChevronLeft className="w-4 h-4" /> Koleksi
          </button>
          <div className="flex items-center gap-4">
            <button onClick={shareArticle} className="text-zinc-500 hover:text-zinc-900"><Share2 className="w-4 h-4" /></button>
            <Bookmark className="w-4 h-4 text-amber-600 fill-amber-600" />
          </div>
        </div>
      </nav>

      <div className="pt-24 px-4 max-w-4xl mx-auto">
        
        {/* THE PAPER EFFECT CONTAINER */}
        <div className="relative bg-[#fdfdfc] shadow-[0_10px_50px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.05)] rounded-sm border-x border-zinc-200 min-h-[80vh]">
          
          {/* BOOK SPINE EFFECT (Garis halus di tengah seolah lipatan buku) */}
          <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-zinc-100 to-transparent pointer-events-none hidden md:block" />

          {/* PAGE CONTENT */}
          <div className="relative z-10 p-8 md:p-20">
            
            {/* Header: Judul & Meta */}
            <header className="mb-16 text-center max-w-2xl mx-auto">
              <div className="flex justify-center items-center gap-2 mb-6 opacity-60">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                  {article.category?.name || "LITERASI"}
                </span>
                <div className="w-1 h-1 rounded-full bg-zinc-300" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-1">
                   {new Date(article.created_at).getFullYear()}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-serif text-zinc-900 leading-tight mb-8">
                {article.title}
              </h1>

              <div className="h-px w-20 bg-zinc-200 mx-auto mb-8" />

              <div className="flex items-center justify-center gap-3">
                <img 
                  src={article.author_photo || `https://ui-avatars.com/api/?name=${article.author_name}`} 
                  className="w-8 h-8 rounded-full grayscale opacity-80" 
                  alt="" 
                />
                <span className="text-xs font-serif italic text-zinc-500">Ditulis oleh {article.author_name}</span>
              </div>
            </header>

            {/* Featured Image (Kecil & Rapih) */}
            <div className="mb-16 max-w-2xl mx-auto px-4 md:px-0">
               <div className="aspect-[4/3] md:aspect-video rounded-sm overflow-hidden shadow-inner bg-zinc-50 border border-zinc-100">
                  <img 
                    src={article.cover_image?.startsWith('http') ? article.cover_image : `${API_BASE}/storage/${article.cover_image}`} 
                    className="w-full h-full object-cover opacity-95 hover:opacity-100 transition-opacity" 
                    alt="Cover" 
                  />
               </div>
               <p className="mt-4 text-center text-[10px] italic text-zinc-400 uppercase tracking-widest">Ilustrasi Halaman Utama</p>
            </div>

            {/* Main Article Content */}
            <main className="max-w-2xl mx-auto">
              <article 
                className="prose prose-zinc max-w-none 
                text-justify [text-justify:inter-word]
                prose-p:font-serif prose-p:text-zinc-700 prose-p:leading-[1.8] prose-p:text-lg md:prose-p:text-xl prose-p:mb-8
                prose-headings:font-serif prose-headings:text-zinc-900 prose-headings:text-left
                prose-blockquote:border-l-0 prose-blockquote:border-y prose-blockquote:border-zinc-100 prose-blockquote:py-8 prose-blockquote:px-0 prose-blockquote:text-center prose-blockquote:italic prose-blockquote:text-zinc-600
                prose-strong:text-zinc-900
                {/* Image dalam konten: Kecil & Sentral */}
                prose-img:rounded-sm prose-img:max-w-[80%] md:prose-img:max-w-[60%] prose-img:mx-auto prose-img:my-12 prose-img:shadow-sm
                "
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* End of Page Decorator */}
              <div className="mt-20 flex justify-center items-center gap-4 opacity-20">
                <div className="h-px w-12 bg-zinc-900" />
                <div className="w-1.5 h-1.5 rotate-45 border border-zinc-900" />
                <div className="h-px w-12 bg-zinc-900" />
              </div>
            </main>
          </div>

          {/* Footer Card (Gaya Kartu Nama Tua) */}
          <footer className="border-t border-zinc-100 p-12 md:p-20 bg-[#fafafa]/50">
             <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-center gap-8">
                <div className="w-24 h-24 rounded-full border border-zinc-200 p-1">
                   <img src={article.author_photo || `https://ui-avatars.com/api/?name=${article.author_name}`} className="w-full h-full object-cover rounded-full grayscale" alt="Author" />
                </div>
                <div className="text-center md:text-left">
                   <h4 className="font-serif text-xl text-zinc-900 mb-2">{article.author_name}</h4>
                   <p className="text-sm font-serif italic text-zinc-500 leading-relaxed">
                     {article.author_bio || "Kontributor literasi digital Mejatika."}
                   </p>
                </div>
             </div>
          </footer>
        </div>

        {/* RELATED (Outside Paper) */}
        {relatedArticles.length > 0 && (
          <div className="mt-20 max-w-2xl mx-auto">
            <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-8 flex items-center gap-4">
              <span className="h-px flex-grow bg-zinc-200" />
              Bacaan Selanjutnya
              <span className="h-px flex-grow bg-zinc-200" />
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {relatedArticles.map((item: any) => (
                <Link key={item.id} href={`/articles/read/${item.slug}`} className="group">
                  <div className="bg-[#fdfdfc] p-6 border border-zinc-200 rounded-sm shadow-sm group-hover:shadow-md transition-shadow">
                    <span className="text-[9px] font-bold text-amber-700 uppercase">{item.category?.name}</span>
                    <h6 className="font-serif text-zinc-900 mt-2 leading-snug group-hover:underline">{item.title}</h6>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="mt-20 text-center pb-10 opacity-40">
         <p className="font-serif text-xs italic">Mejatika Digital Press — 2024</p>
      </footer>

      {/* BACK TO TOP BUTTON (MINIMALIST) */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-8 right-8 w-10 h-10 bg-zinc-900 text-white flex items-center justify-center rounded-full transition-all ${scrollProgress > 20 ? 'opacity-100' : 'opacity-0'}`}
      >
        <ChevronUp className="w-5 h-5" />
      </button>
    </div>
  )
}
