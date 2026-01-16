"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Feather, Search, Loader2, Quote } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function PublicPoetryPage() {
  const [poems, setPoems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchPoems()
  }, [])

  const fetchPoems = async () => {
    try {
      const res = await fetch("https://backend.mejatika.com/api/articles")
      const json = await res.json()
      if (json.success) {
        // Filter hanya yang kategorinya 'Puisi'
        const data = json.data.data || json.data
        const filtered = data.filter((item: any) => 
          item.category?.name?.toLowerCase() === "puisi"
        )
        setPoems(filtered)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#fdfcf7] min-h-screen pb-20"> {/* Warna kertas kuno */}
      {/* POETRY HEADER */}
      <div className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
        <Feather className="w-10 h-10 text-amber-600 mx-auto mb-6 opacity-50" />
        <h1 className="text-6xl font-serif italic text-zinc-900 tracking-tighter mb-4">
          Ruang <span className="text-amber-700">Sastra</span>
        </h1>
        <p className="text-zinc-500 font-serif italic text-lg">
          "Puisi adalah pengungkapan gagasan yang penuh emosi dalam bahasa yang berirama."
        </p>
        
        <div className="max-w-md mx-auto mt-10 relative">
          <Input 
            placeholder="Cari bait atau judul..." 
            className="bg-transparent border-t-0 border-x-0 border-b-2 border-zinc-200 rounded-none focus:ring-0 focus:border-amber-600 text-center font-serif italic text-lg"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* POETRY LIST */}
      <div className="max-w-4xl mx-auto px-4">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-300" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {poems.map((poem: any) => (
              <Link href={`/articles/read/${poem.slug}`} key={poem.id} className="group">
                <article className="border-l border-zinc-200 pl-8 py-4 transition-all hover:border-amber-500">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600 mb-2 block">
                    {poem.author_name}
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-zinc-800 group-hover:text-amber-700 transition-colors mb-3">
                    {poem.title}
                  </h2>
                  <div className="text-zinc-500 font-serif italic text-sm line-clamp-3 leading-relaxed opacity-70">
                    {/* Menampilkan cuplikan konten tanpa tag HTML */}
                    {poem.content.replace(/<[^>]*>?/gm, '').substring(0, 100)}...
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    <span>Baca Selengkapnya</span>
                    <div className="h-[1px] w-8 bg-zinc-200 group-hover:w-12 group-hover:bg-amber-500 transition-all"></div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
