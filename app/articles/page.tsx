"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Calendar, User, ArrowRight, BookOpen, Loader2, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"

export default function PublicArticlesPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // URL Backend Bos
  const API_BASE = "https://backend.mejatika.com"

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/articles`)
      const json = await res.json()
      if (json.success) {
        // Handle Laravel Paginate atau Array biasa
        const rawData = json.data?.data || json.data || []
        setArticles(Array.isArray(rawData) ? rawData : [])
      }
    } catch (err) {
      console.error("Gagal memuat artikel:", err)
    } finally {
      setLoading(false)
    }
  }

  // Fungsi untuk bersihkan tag HTML dari konten untuk preview
  const stripHtml = (html: string) => {
    if (!html) return ""
    return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ')
  }

  const filteredArticles = articles.filter((art: any) =>
    art.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="bg-[#fafafa] min-h-screen pb-20">
      {/* HERO SECTION - Tampilan Modern */}
      <div className="bg-white border-b border-zinc-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5">
           <Sparkles size={200} />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-20 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic text-zinc-900 mb-6">
              Mejatika <span className="text-amber-500">KARYA</span>
            </h1>
            <p className="text-zinc-400 max-w-xl mx-auto font-bold uppercase italic tracking-widest text-sm">
              Eksplorasi pemikiran & riset terbaik dari pelajar Indonesia.
            </p>
          </motion.div>
          
          <div className="max-w-2xl mx-auto mt-12 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300 w-6 h-6 group-focus-within:text-amber-500 transition-colors" />
            <Input 
              placeholder="CARI JUDUL ATAU TOPIK KARYA..." 
              className="pl-16 h-20 rounded-[2.5rem] border-none bg-zinc-50 shadow-2xl shadow-zinc-200 focus:ring-4 ring-amber-100 text-lg font-bold uppercase italic placeholder:text-zinc-300 transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ARTICLES GRID */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {loading ? (
          <div className="flex flex-col items-center py-32">
            <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
            <p className="mt-6 font-black text-zinc-300 uppercase italic tracking-widest text-xs">Menyusun Galeri Karya...</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredArticles.length > 0 ? (
              <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
              >
                {filteredArticles.map((article: any, index: number) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/articles/read/${article.slug || article.id}`}>
                      <Card className="group border-none shadow-xl shadow-zinc-200/50 hover:shadow-amber-200/50 transition-all duration-500 rounded-[3rem] overflow-hidden bg-white h-full flex flex-col border-b-8 border-transparent hover:border-amber-500">
                        
                        {/* Image Container */}
                        <div className="aspect-[16/11] overflow-hidden relative">
                          <img 
                            src={article.cover_image?.startsWith('http') 
                                ? article.cover_image 
                                : `${API_BASE}/storage/${article.cover_image}`} 
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                          />
                          <div className="absolute top-6 left-6">
                            <span className="bg-zinc-900/90 backdrop-blur text-white text-[10px] font-black uppercase px-5 py-2 rounded-full tracking-tighter">
                              {article.category?.name || "Karya"}
                            </span>
                          </div>
                        </div>

                        <CardContent className="p-8 flex-grow flex flex-col">
                          <div className="flex items-center gap-4 text-zinc-400 text-[10px] font-black uppercase mb-5 tracking-widest">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 text-amber-500" />
                              {new Date(article.created_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <span className="opacity-30">|</span>
                            <div className="flex items-center gap-1.5">
                              <User className="w-3 h-3 text-amber-500" />
                              {article.author_name}
                            </div>
                          </div>

                          <h3 className="text-2xl font-black text-zinc-900 leading-tight mb-4 uppercase italic group-hover:text-amber-500 transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          
                          <p className="text-zinc-500 text-sm line-clamp-3 mb-8 font-medium normal-case leading-relaxed">
                            {stripHtml(article.content)}
                          </p>

                          <div className="mt-auto pt-6 border-t border-zinc-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                               <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                                  <BookOpen className="w-4 h-4 text-amber-600" />
                               </div>
                               <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                 {article.views || 0} Pembaca
                               </span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-zinc-900 font-black italic uppercase text-xs group-hover:gap-4 transition-all">
                               Baca <ArrowRight className="w-5 h-5 text-amber-500" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-32 bg-white rounded-[4rem] shadow-inner"
              >
                <div className="bg-zinc-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                   <Search className="text-zinc-200 w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-zinc-300 uppercase italic">Karya tidak ditemukan.</h3>
                <p className="text-zinc-400 text-xs font-bold uppercase mt-2">Coba gunakan kata kunci lain</p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
