"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Share2, BookOpen, Calendar } from "lucide-react"

export default function DetailCerpen() {
  const { slug } = useParams()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return;
    fetch(`https://backend.mejatika.com/api/news/${slug}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#f5f5f5]">
      <Loader2 className="animate-spin text-amber-600 h-10 w-10" />
    </div>
  )

  if (!data) return <div className="text-center py-20 font-serif">Naskah Tidak Ditemukan.</div>

  return (
    <div className="min-h-screen bg-[#e5e5e5] flex flex-col font-serif">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-10 lg:py-20 flex justify-center">
        <div className="max-w-6xl w-full">
          
          {/* TOMBOL BACK */}
          <button 
            onClick={() => router.push('/cerpen')}
            className="mb-8 flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-all uppercase text-[10px] font-sans font-black tracking-widest"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke Ruang Cerpen
          </button>

          {/* LAYOUT BUKU DUA HALAMAN */}
          <div className="flex flex-col md:flex-row bg-[#fdfbf7] shadow-[0_50px_100px_rgba(0,0,0,0.15)] border border-zinc-300 rounded-sm relative overflow-hidden">
            
            {/* 1. HALAMAN KIRI (STIKY / TERKUNCI) */}
            <div className="md:w-5/12 bg-[#faf7f0] p-8 md:p-12 border-b md:border-b-0 md:border-r border-zinc-200 relative">
              <div className="md:sticky md:top-24 flex flex-col items-center text-center">
                <div className="mb-6 opacity-20"><BookOpen className="h-8 w-8 mx-auto" /></div>
                
                <h1 className="text-3xl md:text-5xl font-black text-zinc-900 leading-[1.1] mb-8 uppercase tracking-tighter italic">
                  {data.title}
                </h1>

                <div className="w-full relative group">
                  <div className="absolute -inset-1 bg-zinc-200 rounded-sm rotate-2 group-hover:rotate-0 transition-transform"></div>
                  <img 
                    src={data.image || "/placeholder.svg"} 
                    alt={data.title} 
                    className="relative w-full aspect-[4/5] object-cover shadow-lg border-4 border-white" 
                  />
                </div>

                <div className="mt-10 flex flex-col gap-2 text-zinc-400 font-sans text-[9px] font-bold uppercase tracking-[0.3em]">
                   <span className="flex items-center justify-center gap-2 border-y border-zinc-200 py-3">
                     <Calendar className="h-3 w-3" /> {new Date(data.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                   </span>
                   <span className="mt-2 text-zinc-300 tracking-[0.5em]">Arsip Mejatika</span>
                </div>
              </div>
            </div>

            {/* 2. HALAMAN KANAN (ISI CERPEN - MEMANJANG KE BAWAH) */}
            <div className="md:w-7/12 p-8 md:p-20 relative bg-white">
              {/* Garis Lipatan Tengah (Efek Bayangan) */}
              <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/[0.05] to-transparent pointer-events-none"></div>

              <article className="cerpen-content-clean">
                <div 
                  className="prose prose-zinc prose-lg md:prose-xl max-w-none text-zinc-800 leading-relaxed text-justify font-serif"
                  dangerouslySetInnerHTML={{ __html: data.content }} 
                />
              </article>

              {/* QUOTE SEBAGAI PENUTUP */}
              {data.quote && (
                <div className="mt-20 pt-10 border-t-2 border-zinc-100">
                  <p className="text-xl md:text-2xl italic text-zinc-400 text-center leading-relaxed font-serif">
                    "{data.quote}"
                  </p>
                </div>
              )}

              {/* SHARE BUTTON DI BAWAH TEKS */}
              <div className="mt-20 flex justify-center">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Tautan berhasil disalin!");
                  }}
                  className="flex items-center gap-2 text-zinc-300 hover:text-amber-600 transition-colors uppercase text-[9px] font-sans font-black tracking-widest border border-zinc-200 px-6 py-3 rounded-full"
                >
                  <Share2 className="h-3 w-3" /> Salin Tautan Naskah
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />

      <style jsx global>{`
        /* Tipografi Bersih Tanpa Dropcap */
        .cerpen-content-clean p {
          margin-bottom: 2rem;
          text-indent: 2.5rem;
          line-height: 2;
          font-size: 1.15rem;
        }

        .cerpen-content-clean p:first-of-type {
          text-indent: 0;
        }

        /* Memastikan tidak ada dropcap dari sistem lain */
        .cerpen-content-clean p:first-of-type::first-letter {
          all: unset !important;
          font-size: inherit !important;
          font-weight: inherit !important;
          float: none !important;
          color: inherit !important;
        }

        @media (max-width: 768px) {
          .cerpen-content-clean p {
            text-indent: 1.5rem;
            text-align: left;
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  )
}
