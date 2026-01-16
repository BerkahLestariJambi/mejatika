"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Calendar, User, ArrowRight, BookOpen, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function PublicArticlesPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      // Mengambil data dari endpoint publik (hanya yang statusnya published)
      const res = await fetch("https://backend.mejatika.com/api/articles")
      const json = await res.json()
      if (json.success) {
        // Karena Laravel pakai paginate(12), datanya ada di json.data.data
        setArticles(json.data.data || json.data)
      }
    } catch (err) {
      console.error("Gagal memuat artikel:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredArticles = articles.filter((art: any) =>
    art.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="bg-zinc-50 min-h-screen">
      {/* HERO SECTION */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic text-zinc-900 mb-4">
            Mejatika <span className="text-amber-500 text-outline">KARYA</span>
          </h1>
          <p className="text-zinc-500 max-w-2xl mx-auto font-medium">
            Eksplorasi pemikiran, cerita, dan riset terbaik dari pelajar berprestasi.
          </p>
          
          <div className="max-w-xl mx-auto mt-10 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <Input 
              placeholder="Cari judul artikel atau topik..." 
              className="pl-12 h-14 rounded-full border-zinc-200 shadow-xl focus:ring-amber-500"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ARTICLES GRID */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex flex-col items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
            <p className="mt-4 font-bold text-zinc-400 uppercase text-xs">Menyiapkan Bacaan...</p>
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article: any) => (
              <Link href={`/articles/read/${article.slug}`} key={article.id}>
                <Card className="group border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2rem] overflow-hidden bg-white h-full flex flex-col">
                  {/* Image Container */}
                  <div className="aspect-[16/10] overflow-hidden relative">
                    <img 
                      src={article.cover_image} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-amber-500 text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg">
                        {article.category?.name || "Karya"}
                      </span>
                    </div>
                  </div>

                  <CardContent className="p-6 flex-grow flex flex-col">
                    <div className="flex items-center gap-3 text-zinc-400 text-xs font-bold uppercase mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(article.created_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {article.author_name}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-zinc-900 group-hover:text-amber-500 transition-colors line-clamp-2 mb-4 leading-tight">
                      {article.title}
                    </h3>

                    <div className="mt-auto pt-4 border-t border-zinc-50 flex items-center justify-between">
                      <span className="text-xs font-black text-zinc-400 uppercase flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> {article.views} Baca
                      </span>
                      <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white group-hover:bg-amber-500 transition-colors">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[3rem]">
            <h3 className="text-xl font-bold text-zinc-400 uppercase">Artikel tidak ditemukan.</h3>
          </div>
        )}
      </div>
    </div>
  )
}
