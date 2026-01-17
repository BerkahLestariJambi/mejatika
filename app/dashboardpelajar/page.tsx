"use client"

import { useState, useEffect } from "react"
import { Edit3, Trash2, Search, Loader2, Plus } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function ListSemuaArtikel() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    try {
      const res = await fetch("https://backend.mejatika.com/api/student/articles/my", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      })
      const json = await res.json()
      if (json.success) {
        setArticles(Array.isArray(json.data) ? json.data : (json.data?.data || []))
      }
    } catch (e) { toast.error("Gagal koneksi ke server") }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const handleDelete = async (id: number) => {
    if(!confirm("Yakin hapus karya ini?")) return
    const res = await fetch(`https://backend.mejatika.com/api/student/articles/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    })
    if(res.ok) {
      toast.success("Dihapus!")
      fetchAll()
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] p-8 uppercase italic font-black">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl italic uppercase">Karya <span className="text-amber-500">SAYA</span></h1>
        <Link href="/dashboardpelajar/articles/create" className="bg-zinc-900 text-white p-4 rounded-2xl flex items-center gap-2">
          <Plus size={18}/> Tulis Baru
        </Link>
      </div>

      {loading ? <Loader2 className="animate-spin mx-auto text-amber-500" /> : (
        <div className="grid gap-6">
          {articles.length > 0 ? articles.map((art: any) => (
            <div key={art.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-zinc-100 rounded-2xl overflow-hidden shadow-inner">
                  <img src={art.cover_image} className="object-cover w-full h-full" alt="cover" />
                </div>
                <div>
                  <h3 className="text-xl leading-tight">{art.title}</h3>
                  <p className="text-amber-500 text-[10px] tracking-widest">{art.category?.name}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/dashboardpelajar/articles/edit/${art.id}`} className="p-4 bg-zinc-100 rounded-2xl hover:bg-amber-100 transition-colors">
                  <Edit3 size={20} className="text-zinc-600" />
                </Link>
                <button onClick={() => handleDelete(art.id)} className="p-4 bg-red-50 rounded-2xl hover:bg-red-500 hover:text-white transition-all text-red-500">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          )) : (
            <div className="text-center py-20 border-4 border-dashed rounded-[3rem] text-zinc-300">Belum ada karya.</div>
          )}
        </div>
      )}
    </div>
  )
}
