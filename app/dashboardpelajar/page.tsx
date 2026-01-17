"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Plus, BookText, FileText, ExternalLink, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function DashboardPelajarHome() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  // 1. LOGIKA AMBIL DATA (Sama dengan yang saya buat tadi)
  useEffect(() => {
    const fetchMyArticles = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch("https://backend.mejatika.com/api/student/articles/my", {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        })
        const json = await res.json()
        if (json.success) {
          // Ambil maksimal 3 saja untuk preview di home
          const data = Array.isArray(json.data) ? json.data : (json.data?.data || [])
          setArticles(data.slice(0, 3)) 
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchMyArticles()
  }, [])

  return (
    <div className="min-h-screen bg-[#fafafa] p-8 space-y-12">
      {/* HERO SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 pt-10"
      >
        <div className="bg-amber-500 w-20 h-20 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-amber-200">
          <BookText className="text-white h-10 w-10" />
        </div>
        
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">
          Halo, <span className="text-amber-500">Penulis Muda!</span>
        </h1>
        <p className="text-zinc-500 font-medium max-w-sm mx-auto">
          Siap untuk membagikan pemikiranmu hari ini? Gunakan editor AI kami untuk hasil terbaik.
        </p>

        <div className="flex gap-4 justify-center pt-4">
          <Link href="/dashboardpelajar/articles/create">
            <Button className="h-16 px-10 rounded-2xl bg-zinc-900 hover:bg-amber-600 text-white font-black uppercase tracking-widest transition-all">
              <Plus className="mr-2 h-5 w-5" /> Tulis Artikel Baru
            </Button>
          </Link>
          {/* Tombol ke semua artikel */}
          <Link href="/dashboardpelajar/articles">
            <Button variant="outline" className="h-16 px-10 rounded-2xl font-black uppercase tracking-widest border-2">
              Lihat Semua Karya
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* --- BAGIAN LIST ARTIKEL TERBARU --- */}
      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-xl font-black italic uppercase tracking-tighter text-zinc-400">Tulisan Terakhirmu</h2>
        
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-amber-500" />
          </div>
        ) : articles.length > 0 ? (
          <div className="grid gap-4">
            {articles.map((art: any) => (
              <motion.div 
                key={art.id}
                whileHover={{ scale: 1.01 }}
                className="bg-white p-6 rounded-[2rem] shadow-sm flex items-center justify-between border border-zinc-100"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-black italic uppercase text-zinc-800 line-clamp-1">{art.title}</h3>
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">{art.category?.name || 'UMUM'}</p>
                  </div>
                </div>
                <Link href={`/dashboardpelajar/articles/edit/${art.id}`}>
                    <Button variant="ghost" size="icon" className="rounded-xl"><ExternalLink size={18}/></Button>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed rounded-[3rem] text-zinc-300 font-bold uppercase text-xs italic tracking-widest">
            Belum ada karya yang dibuat.
          </div>
        )}
      </div>
    </div>
  )
}
