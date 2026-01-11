"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Calendar, User, Share2 } from "lucide-react"

export default function DetailCerpen() {
  const { slug } = useParams()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`https://backend.mejatika.com/api/news/${slug}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-zinc-50">
      <Loader2 className="animate-spin text-amber-500 h-10 w-10" />
    </div>
  )

  if (!data) return <div className="text-center py-20">Cerpen tidak ditemukan.</div>

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-12 lg:py-20">
        <div className="max-w-4xl mx-auto">
          
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => router.push('/cerpen')}
            className="mb-8 group text-zinc-400 hover:text-amber-600 font-black uppercase text-[10px] tracking-widest"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Kembali ke Ruang Cerpen
          </Button>

          {/* Header */}
          <header className="mb-12">
            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-zinc-900 leading-[0.9] mb-6">
              {data.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-zinc-400 font-bold uppercase text-[10px] tracking-widest border-y py-4 border-zinc-100">
              <div className="flex items-center gap-2"><Calendar className="h-3 w-3 text-amber-500" /> {new Date(data.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              <div className="flex items-center gap-2"><User className="h-3 w-3 text-amber-500" /> Penulis Mejatika</div>
              <div className="ml-auto bg-amber-50 text-amber-600 px-3 py-1 rounded-full">Kategori: Cerpen</div>
            </div>
          </header>

          {/* Featured Image */}
          <div className="relative h-[300px] md:h-[500px] w-full rounded-[3rem] overflow-hidden mb-16 shadow-2xl">
            <img src={data.image || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
          </div>

          {/* Content - Typography style */}
          <article className="cerpen-content max-w-3xl mx-auto">
            <div 
              className="prose prose-zinc prose-lg lg:prose-xl text-zinc-700 leading-loose"
              dangerouslySetInnerHTML={{ __html: data.content }} 
            />
          </article>

          {/* Footer Card */}
          <div className="mt-20 p-10 bg-zinc-50 rounded-[3rem] border border-zinc-100 text-center">
            <h4 className="font-black italic uppercase text-zinc-900 mb-2">Terima kasih telah membaca</h4>
            <p className="text-sm text-zinc-500 mb-6 font-medium uppercase tracking-tight">Bagikan kisah ini kepada teman-temanmu</p>
            <div className="flex justify-center gap-4">
               <Button className="rounded-full bg-zinc-900 hover:bg-amber-500 transition-colors px-8 font-black uppercase text-[10px] tracking-widest">
                 <Share2 className="mr-2 h-4 w-4" /> Share Link
               </Button>
            </div>
          </div>

        </div>
      </main>

      <Footer />

      {/* CSS KHUSUS UNTUK CERPEN SUPAYA ENAK DIBACA */}
      <style jsx global>{`
        .cerpen-content {
          font-family: 'Georgia', serif; /* Menggunakan font serif agar terasa seperti novel */
        }
        .cerpen-content p {
          margin-bottom: 2rem;
          text-indent: 2rem; /* Paragraf menjorok kedalam */
        }
        .cerpen-content p:first-of-type {
          text-indent: 0;
        }
        .cerpen-content p:first-of-type::first-letter {
          float: left;
          font-size: 5rem;
          line-height: 1;
          font-weight: 900;
          padding-right: 0.5rem;
          color: #f59e0b; /* Warna amber untuk huruf pertama */
          font-style: italic;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  )
}
