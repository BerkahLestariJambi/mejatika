"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  ChevronLeft, Share2, BookOpen, Clock, 
  Facebook, Twitter, Linkedin, Loader2, 
  ArrowRight, Award, ChevronUp
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

  // Efek Scroll Progress Bar
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa]">
        <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
        <p className="mt-4 font-black text-zinc-300 uppercase italic tracking-widest text-[10px]">Menyusun Literasi...</p>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white text-center">
        <h1 className="text-3xl font-black uppercase italic text-zinc-900">Konten Hilang</h1>
        <Link href="/articles" className="mt-4 text-amber-500 font-bold underline">KEMBALI KE PERPUSTAKAAN</Link>
      </div>
    )
  }

  return (
    <div className="bg-[#f4f4f5] min-h-screen pb-20 selection:bg-amber-200 overflow-x-hidden">
      
      {/* SCROLL PROGRESS BAR */}
      <div 
        className="fixed top-0 left-0 h-1.5 bg-amber-500 z-[60] transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* FLOATING HEADER */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()} className="rounded-full gap-2 font-black text-[10px] uppercase tracking-widest">
            <ChevronLeft className="w-4 h-4" /> Kembali
          </Button>
          
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" onClick={shareArticle} className="rounded-full border-zinc-200">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-32 px-4 max-w-6xl mx-auto">
        {/* FRAME UTAMA */}
        <div className="bg-white rounded-[2.5rem] md:rounded-[4rem] shadow-2xl shadow-zinc-200/50 overflow-hidden border border-zinc-100 relative">
          
          {/* HEADER AREA */}
          <header className="p-8 md:p-20 text-center border-b border-zinc-50 bg-gradient-to-b from-white to-zinc-50/30">
            <div className="flex justify-center items-center gap-3 mb-8">
              <span className="bg-zinc-900 text-white text-[9px] font-black uppercase px-4 py-2 rounded-full tracking-widest">
                {article.category?.name || "Karya Pelajar"}
              </span>
              <div className="h-1 w-1 bg-zinc-300 rounded-full" />
              <span className="text-zinc-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" /> 5 Menit Baca
              </span>
            </div>

            <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.95] text-zinc-900 mb-10 italic uppercase break-words">
              {article.title}
            </h1>

            <div className="flex flex-col md:flex-row justify-center items-center gap-6">
               <div className="flex items-center gap-3 bg-zinc-50 pr-6 py-2 pl-2 rounded-full border border-zinc-100 shadow-sm">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                     <img src={article.author_photo || `https://ui-avatars.com/api/?name=${article.author_name}&background=f59e0b&color=fff`} className="w-full h-full object-cover" alt="Penulis" />
                  </div>
                  <div className="text-left leading-tight">
                    <p className="text-[9px] font-black uppercase text-zinc-400">Kontributor</p>
                    <p className="text-sm font-black text-zinc-900 uppercase italic">{article.author_name}</p>
                  </div>
               </div>
               <div className="text-center md:text-left">
                  <p className="text-[9px] font-black uppercase text-zinc-400 mb-1">Diterbitkan Pada</p>
                  <p className="text-sm font-black text-zinc-900 uppercase italic">
                    {new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
               </div>
            </div>
          </header>

          {/* FEATURED IMAGE */}
          <div className="px-4 md:px-16 mt-8">
            <div className="aspect-video w-full rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl">
              <img 
                src={article.cover_image?.startsWith('http') ? article.cover_image : `${API_BASE}/storage/${article.cover_image}`} 
                className="w-full h-full object-cover" 
                alt="Thumbnail" 
              />
            </div>
          </div>

          {/* CONTENT SECTION - RATA KIRI KANAN (JUSTIFY) */}
          <main className="flex flex-col items-center py-12 md:py-24 px-6 md:px-12 overflow-hidden">
            <div className="w-full max-w-3xl flex flex-col">
              <article 
                className="prose prose-zinc prose-lg md:prose-xl max-w-none 
                w-full overflow-visible break-words
                text-justify [text-justify:inter-word] [hyphens:auto]
                prose-headings:font-black prose-headings:tracking-tighter prose-headings:uppercase prose-headings:italic prose-headings:text-zinc-900 prose-headings:text-left
                prose-p:text-zinc-600 prose-p:leading-[1.8] prose-p:mb-8 prose-p:text-lg md:prose-p:text-xl
                prose-strong:text-zinc-950 prose-strong:font-black
                prose-blockquote:border-l-[6px] prose-blockquote:border-amber-500 prose-blockquote:bg-zinc-50 prose-blockquote:py-6 prose-blockquote:px-10 prose-blockquote:rounded-r-3xl prose-blockquote:italic prose-blockquote:text-left
                prose-img:rounded-3xl prose-img:shadow-2xl prose-img:mx-auto prose-img:border-4 prose-img:border-white
                prose-li:text-zinc-600 prose-li:font-medium prose-li:text-left
                "
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* FOOTER INTERACTION */}
              <div className="mt-20 pt-12 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-8">
                 <div className="flex items-center gap-2 px-6 py-3 bg-zinc-950 rounded-full font-black uppercase text-[10px] tracking-widest text-white shadow-lg">
                   <BookOpen className="w-4 h-4 text-amber-500" /> {article.views || 0} Pembaca
                 </div>
                 <div className="flex gap-2">
                    <Button size="icon" variant="ghost" className="rounded-full hover:bg-blue-50 hover:text-blue-600"><Facebook className="w-5 h-5" /></Button>
                    <Button size="icon" variant="ghost" className="rounded-full hover:bg-sky-50 hover:text-sky-500"><Twitter className="w-5 h-5" /></Button>
                    <Button size="icon" variant="ghost" className="rounded-full hover:bg-blue-50 hover:text-blue-700"><Linkedin className="w-5 h-5" /></Button>
                 </div>
              </div>
            </div>
          </main>

          {/* PENULIS BIO CARD */}
          <footer className="bg-zinc-950 p-10 md:p-24 text-white relative overflow-hidden">
             <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                <div className="relative w-40 h-40 rounded-[2.2rem] overflow-hidden bg-white p-1">
                  <img src={article.author_photo || `https://ui-avatars.com/api/?name=${article.author_name}&background=f59e0b&color=fff`} className="w-full h-full object-cover rounded-[2rem]" alt="Avatar" />
                </div>
                <div className="text-center md:text-left flex-grow">
                   <h3 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">{article.author_name}</h3>
                   <p className="text-zinc-400 text-lg leading-relaxed max-w-2xl font-medium italic">
                     "{article.author_bio || "Berdedikasi dalam menciptakan konten literasi digital berkualitas di Mejatika."}"
                   </p>
                </div>
             </div>
          </footer>
        </div>

        {/* RELATED ARTICLES */}
        {relatedArticles.length > 0 && (
          <div className="mt-24">
            <h4 className="text-zinc-400 font-black uppercase tracking-[0.6em] text-xs text-center mb-12">Karya Lainnya</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {relatedArticles.map((item: any) => (
                <Link key={item.id} href={`/articles/read/${item.slug}`}>
                  <div className="group bg-white rounded-[2.5rem] p-8 border border-zinc-100 shadow-xl flex items-center gap-6">
                     <div className="w-24 h-24 rounded-2xl overflow-hidden bg-zinc-100 flex-shrink-0">
                        <img src={item.cover_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="Rel" />
                     </div>
                     <div>
                        <span className="text-amber-500 font-black text-[9px] uppercase">{item.category?.name}</span>
                        <h5 className="text-xl font-black uppercase italic tracking-tighter mt-1 line-clamp-2">{item.title}</h5>
                     </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER AKHIR */}
      <div className="mt-32 text-center pb-10">
         <p className="text-zinc-300 font-black uppercase text-[9px] tracking-[1em]">Mejatika © 2024</p>
      </div>

      {/* BACK TO TOP */}
      <Button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-8 right-8 rounded-full w-12 h-12 p-0 shadow-2xl transition-all duration-300 ${scrollProgress > 20 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <ChevronUp className="w-6 h-6" />
      </Button>
    </div>
  )
}
