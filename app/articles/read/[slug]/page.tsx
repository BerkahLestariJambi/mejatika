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

  // URL Backend Bos
  const API_BASE = "https://backend.mejatika.com"

  useEffect(() => {
    if (params.slug) {
      fetchDetail()
    }
  }, [params.slug])

  const fetchDetail = async () => {
    try {
      // Pastikan endpoint mengarah ke showBySlug di Laravel
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
    toast.success("Link berhasil disalin ke clipboard!")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa]">
        <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
        <p className="mt-4 font-black text-zinc-300 uppercase italic tracking-widest text-xs">Membuka Lembaran Karya...</p>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white text-center">
        <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
           <BookOpen className="w-10 h-10 text-zinc-200" />
        </div>
        <h1 className="text-3xl font-black uppercase italic text-zinc-900">Artikel Tidak Ditemukan</h1>
        <p className="text-zinc-400 font-bold mt-2 uppercase text-xs tracking-tighter">Mungkin artikel telah dihapus atau dipindahkan</p>
        <Link href="/articles">
          <Button className="mt-8 bg-zinc-900 hover:bg-amber-500 text-white rounded-full px-8 font-black italic uppercase transition-all">
            Kembali ke Galeri
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-[#f4f4f5] min-h-screen pb-20 selection:bg-amber-200">
      {/* FLOATING HEADER */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-zinc-100">
        <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="rounded-full gap-2 font-black text-[10px] uppercase tracking-widest hover:bg-zinc-100 transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Kembali
          </Button>
          
          <div className="hidden md:block">
            <p className="font-black italic text-zinc-900 uppercase text-xs truncate max-w-[300px]">
              {article.title}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" onClick={shareArticle} className="rounded-full border-zinc-200 hover:text-amber-500">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button className="bg-amber-500 hover:bg-zinc-900 text-white rounded-full font-black text-[10px] uppercase tracking-widest px-6 shadow-lg shadow-amber-500/20 transition-all">
              Ikuti Penulis
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-32 px-4 max-w-5xl mx-auto">
        {/* FRAME KONTEN UTAMA */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-zinc-200 overflow-hidden border border-zinc-100">
          
          {/* HEADER DALAM FRAME */}
          <div className="p-8 md:p-16 text-center border-b border-zinc-50 bg-gradient-to-b from-white to-zinc-50/50">
            <div className="flex justify-center gap-3 mb-8">
              <span className="bg-amber-500 text-white text-[10px] font-black uppercase px-5 py-2 rounded-full tracking-tighter">
                {article.category?.name || "KARYA SISWA"}
              </span>
              <span className="bg-zinc-900 text-white text-[10px] font-black uppercase px-5 py-2 rounded-full tracking-tighter flex items-center gap-2">
                <Clock className="w-3 h-3" /> 4 Menit Baca
              </span>
            </div>

            <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.9] text-zinc-900 mb-10 italic uppercase">
              {article.title}
            </h1>

            <div className="flex flex-wrap justify-center items-center gap-6">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 overflow-hidden border-2 border-white shadow-md">
                     <img 
                      src={article.author_photo || `https://ui-avatars.com/api/?name=${article.author_name}&background=f59e0b&color=fff`} 
                      className="w-full h-full object-cover" 
                      alt="Avatar" 
                     />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase text-zinc-400 leading-none mb-1">Dibuat Oleh</p>
                    <p className="text-sm font-black text-zinc-900 uppercase italic tracking-tight">{article.author_name}</p>
                  </div>
               </div>
               <div className="w-px h-8 bg-zinc-200 hidden md:block" />
               <div className="flex flex-col text-left">
                  <p className="text-[10px] font-black uppercase text-zinc-400 leading-none mb-1">Tanggal Rilis</p>
                  <p className="text-sm font-black text-zinc-900 uppercase italic tracking-tight">
                    {new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
               </div>
            </div>
          </div>

          {/* COVER IMAGE */}
          <div className="px-4 md:px-8 -mt-2">
            <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
              <img 
                src={article.cover_image?.startsWith('http') ? article.cover_image : `${API_BASE}/storage/${article.cover_image}`} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                alt="Featured" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>

          {/* MAIN ARTICLE BODY */}
          <main className="p-8 md:p-20 md:pt-16 max-w-4xl mx-auto">
            <div 
              className="prose prose-zinc prose-xl max-w-none
              prose-headings:font-black prose-headings:tracking-tighter prose-headings:uppercase prose-headings:italic prose-headings:text-zinc-900
              prose-p:text-zinc-600 prose-p:leading-[1.8] prose-p:text-xl prose-p:mb-8
              prose-strong:text-zinc-950 prose-strong:font-black
              prose-blockquote:border-l-[6px] prose-blockquote:border-amber-500 prose-blockquote:bg-zinc-50 prose-blockquote:py-4 prose-blockquote:px-8 prose-blockquote:rounded-r-[2rem] prose-blockquote:italic
              prose-img:rounded-[2rem] prose-img:shadow-xl
              "
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* INTERACTION BAR */}
            <div className="mt-20 pt-10 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-6">
               <div className="flex items-center gap-4">
                  <Button variant="ghost" className="rounded-full gap-2 font-black uppercase text-[10px] tracking-widest bg-zinc-50 hover:bg-amber-100">
                    <BookOpen className="w-4 h-4 text-amber-500" /> {article.views || 0} Pembaca
                  </Button>
                  <Button variant="ghost" className="rounded-full gap-2 font-black uppercase text-[10px] tracking-widest bg-zinc-50 hover:bg-zinc-100">
                    <MessageCircle className="w-4 h-4 text-zinc-400" /> Diskusi
                  </Button>
               </div>
               
               <div className="flex items-center gap-3">
                  <p className="text-[10px] font-black uppercase text-zinc-400 mr-2">Bagikan:</p>
                  <Button size="icon" variant="ghost" className="rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors"><Facebook className="w-5 h-5" /></Button>
                  <Button size="icon" variant="ghost" className="rounded-full hover:bg-sky-50 hover:text-sky-500 transition-colors"><Twitter className="w-5 h-5" /></Button>
                  <Button size="icon" variant="ghost" className="rounded-full hover:bg-blue-50 hover:text-blue-700 transition-colors"><Linkedin className="w-5 h-5" /></Button>
               </div>
            </div>
          </main>

          {/* AUTHOR PROFILE SECTION */}
          <footer className="bg-zinc-950 p-10 md:p-20 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full" />
             
             <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                <div className="w-32 h-32 rounded-[2rem] overflow-hidden bg-white p-1 flex-shrink-0 shadow-2xl shadow-amber-500/20">
                   <img 
                    src={article.author_photo || `https://ui-avatars.com/api/?name=${article.author_name}&background=f59e0b&color=fff`} 
                    className="w-full h-full object-cover rounded-[1.8rem]" 
                    alt="Author" 
                   />
                </div>
                <div className="text-center md:text-left flex-grow">
                   <span className="text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-3 block">Profil Penulis</span>
                   <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-4">{article.author_name}</h3>
                   <p className="text-zinc-400 text-lg leading-relaxed max-w-2xl font-medium">
                     {article.author_bio || "Seorang pelajar berprestasi yang berdedikasi tinggi untuk menyebarkan wawasan melalui riset dan literasi kreatif di platform Mejatika."}
                   </p>
                   <div className="mt-8 flex justify-center md:justify-start gap-4">
                      <Button className="rounded-full bg-white text-zinc-900 font-black uppercase text-[10px] tracking-widest px-8 py-6 hover:bg-amber-500 hover:text-white transition-all">
                        Lihat Semua Karya
                      </Button>
                   </div>
                </div>
             </div>
          </footer>
        </div>

        {/* RELATED ARTICLES PLACEHOLDER */}
        <div className="mt-20 text-center">
           <h4 className="text-zinc-400 font-black uppercase tracking-[0.5em] text-xs mb-10">Lanjut Membaca</h4>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-pointer">
              {/* Ini bisa Bos isi dengan mapping artikel lain nanti */}
              <div className="p-8 bg-white rounded-[2rem] border border-zinc-100 text-left">
                 <p className="text-amber-500 font-black text-[10px] mb-2 uppercase italic tracking-widest">Berikutnya</p>
                 <h5 className="text-xl font-black uppercase italic tracking-tighter">Strategi Belajar Efektif di Era Digital →</h5>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
