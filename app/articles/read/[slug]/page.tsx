"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { 
  Calendar, 
  User, 
  ChevronLeft, 
  Share2, 
  BookOpen, 
  Clock,
  Facebook,
  Twitter,
  Linkedin,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function ArticleDetailPage() {
  const params = useParams()
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.slug) {
      fetchDetail()
    }
  }, [params.slug])

  const fetchDetail = async () => {
    try {
      const res = await fetch(`https://backend.mejatika.com/api/articles/read/${params.slug}`)
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-black uppercase italic">Artikel Tidak Ditemukan</h1>
        <Link href="/articles" className="mt-4 text-amber-500 font-bold underline">Kembali ke Daftar Karya</Link>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* NAVIGATION BAR (Sticky) */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/articles">
            <Button variant="ghost" className="rounded-full gap-2 font-bold text-xs uppercase tracking-tighter">
              <ChevronLeft className="w-4 h-4" /> Kembali
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" onClick={shareArticle} className="rounded-full">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* HEADER SECTION */}
      <header className="max-w-4xl mx-auto px-4 pt-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="bg-amber-500 text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg shadow-amber-500/20">
            {article.category?.name || "Karya Pelajar"}
          </span>
          <span className="text-zinc-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> 5 Menit Baca
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.95] text-zinc-900 mb-8">
          {article.title}
        </h1>

        <div className="flex items-center gap-4 py-6 border-y border-zinc-100">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-100">
            {article.author_photo ? (
              <img src={article.author_photo} alt={article.author_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-amber-100 text-amber-600 font-bold">
                {article.author_name?.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-grow">
            <p className="text-xs font-black uppercase text-zinc-900 tracking-tight leading-none">{article.author_name}</p>
            <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1 tracking-wider">
              Diterbitkan: {new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4 text-zinc-300">
            <BookOpen className="w-5 h-5" />
            <span className="text-sm font-black text-zinc-900">{article.views} Views</span>
          </div>
        </div>
      </header>

      {/* FEATURED IMAGE */}
      <div className="max-w-6xl mx-auto px-0 md:px-4 my-10">
        <div className="aspect-video md:rounded-[3rem] overflow-hidden shadow-2xl">
          <img src={article.cover_image} className="w-full h-full object-cover" alt="Cover" />
        </div>
      </div>

      {/* CONTENT AREA */}
      <main className="max-w-3xl mx-auto px-4">
        {/* Render HTML content dari Quill/Editor */}
        <div 
          className="prose prose-zinc prose-lg max-w-none 
          prose-headings:font-black prose-headings:tracking-tighter prose-headings:uppercase prose-headings:italic
          prose-p:text-zinc-600 prose-p:leading-relaxed prose-p:text-lg
          prose-strong:text-zinc-900 prose-blockquote:border-l-4 prose-blockquote:border-amber-500 prose-blockquote:bg-zinc-50 prose-blockquote:py-2 prose-blockquote:rounded-r-xl"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* AUTHOR BIO CARD */}
        <section className="mt-20 p-8 bg-zinc-900 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl">
          <div className="w-24 h-24 rounded-3xl overflow-hidden flex-shrink-0 bg-white p-1">
             <img 
               src={article.author_photo || 'https://ui-avatars.com/api/?name=' + article.author_name} 
               className="w-full h-full object-cover rounded-2xl" 
               alt="Author" 
             />
          </div>
          <div className="text-center md:text-left">
            <h4 className="text-amber-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Tentang Penulis</h4>
            <h3 className="text-2xl font-black tracking-tight mb-3 italic">{article.author_name}</h3>
            <p className="text-zinc-400 text-sm leading-relaxed font-medium">
              {article.author_bio || "Pelajar aktif yang berkontribusi dalam literasi digital di Mejatika. Fokus pada pengembangan riset dan karya kreatif."}
            </p>
            <div className="flex justify-center md:justify-start gap-4 mt-6">
               <Button size="icon" variant="ghost" className="hover:text-amber-500 text-zinc-500"><Facebook className="w-4 h-4" /></Button>
               <Button size="icon" variant="ghost" className="hover:text-amber-500 text-zinc-500"><Twitter className="w-4 h-4" /></Button>
               <Button size="icon" variant="ghost" className="hover:text-amber-500 text-zinc-500"><Linkedin className="w-4 h-4" /></Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
