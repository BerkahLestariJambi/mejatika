"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, Save } from "lucide-react"

export default function EditArticle() {
  const { id } = useParams()
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [catId, setCatId] = useState("")

  useEffect(() => {
    const fetchDetail = async () => {
      const res = await fetch(`https://backend.mejatika.com/api/student/articles/${id}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      })
      const json = await res.json()
      if (json.success) {
        setTitle(json.data.title)
        setContent(json.data.content)
        setCatId(json.data.category_id)
      }
    }
    fetchDetail()
  }, [id])

  const handleUpdate = async (e: any) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("title", title)
    formData.append("content", content)
    formData.append("category_id", catId)

    // PERHATIKAN: Method tetap POST karena Laravel API kita daftarkan POST untuk Update
    const res = await fetch(`https://backend.mejatika.com/api/student/articles/${id}`, {
      method: "POST", 
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
      body: formData
    })

    if (res.ok) {
      toast.success("Karya Berhasil Diperbarui!")
      router.push("/dashboardpelajar/articles")
    } else {
      toast.error("Gagal simpan perubahan")
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto uppercase italic font-black">
      <button onClick={() => router.back()} className="flex items-center gap-2 mb-6 text-zinc-400">
        <ArrowLeft size={20}/> Kembali
      </button>

      <form onSubmit={handleUpdate} className="space-y-6">
        <div className="space-y-2">
          <label className="text-zinc-400 text-sm">Judul Karya</label>
          <input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="w-full p-6 rounded-[2rem] bg-white border-none shadow-sm text-2xl" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-zinc-400 text-sm">Isi Konten</label>
          <textarea 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            className="w-full p-8 rounded-[2rem] bg-white border-none shadow-sm min-h-[400px]" 
          />
        </div>

        <button type="submit" className="w-full p-6 bg-amber-500 text-white rounded-[2rem] flex justify-center items-center gap-2">
          <Save size={20}/> Simpan Perubahan
        </button>
      </form>
    </div>
  )
}
