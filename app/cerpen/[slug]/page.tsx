"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Share2, Book } from "lucide-react"

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
    <div className="h-screen flex items-center justify-center bg-zinc-100">
      <Loader2 className="animate-spin text-amber-600 h-10 w-10" />
    </div>
  )

  if (!data) return <div className="text-center py-20 font-serif">Naskah Tidak Ditemukan</div>

  return (
    <div className="min-h-screen bg-zinc-200 flex flex-col font-serif">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-10 lg:py-20 flex items-center justify-center">
        <div className="max-w-6xl w-full">
          
          {/* TOMBOL KEMBALI DI ATAS BUKU */}
          <button 
            onClick={() => router.push('/cerpen')}
            className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-zinc-800 transition-all uppercase text-[10px] font-sans font-black tracking-widest"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke Ruang Cerpen
          </button>

          {/* FRAME BUKU TERBUKA */}
          <div className="book-container relative grid grid-cols-1 md:grid-cols-2 bg-[#fdfbf7] shadow-[0_50px_100px_rgba(0,0,0,0.2)] rounded-r-xl rounded-l-md border border-zinc-300 min-h-[700px]">
            
            {/* Garis Tengah Buku (Spine/Lipatan) */}
            <div className="absolute inset-y-0 left-1/2 w-[40px] -translate-x-1/2 bg-gradient-to-r from-black/5 via-black/20 to-black/5 z-20 hidden md:block"></div>
            <div className="absolute inset-y-0 left-1/2 w-[1px] -translate-x-1/2 bg-black/10 z-30 hidden md:block"></div>

            {/* HALAMAN KIRI: JUDUL & GAMBAR */}
            <div className="relative p-10 md:p-16 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-zinc-200">
              <div className="mb-8 text-amber-600 opacity-50">
                <Book className="h-10 w-10 mx-auto" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-zinc-900 leading-tight mb-8 uppercase tracking-tighter italic">
                {data.title}
              </h1>
              <div className="w-full max-w-sm aspect-[3/4] overflow-hidden rounded-lg shadow-xl border-8 border-white rotate-[-2deg]">
                <img 
                  src={data.image || "/placeholder.svg"} 
                  alt={data.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="mt-8 text-zinc-400 font-sans text-[10px] uppercase tracking-[0.3em] font-bold">
                Arsip Mejatika • {new Date(data.created_at).getFullYear()}
              </p>
            </div>

            {/* HALAMAN KANAN: ISI CERPEN */}
            <div className="relative p-10 md:p-16 md:pl-20 overflow-y-auto">
              {/* Garis-garis tipis dekoratif (Opsional, agar mirip referensi) */}
              <div className="absolute top-10 right-10 opacity-10">
                <div className="w-20 h-1 bg-zinc-900 mb-1"></div>
                <div className="w-14 h-1 bg-zinc-900"></div>
              </div>

              <article className="cerpen-text-content">
                <div 
                  className="prose prose-zinc prose-lg max-w-none text-zinc-800 leading-relaxed text-justify"
                  dangerouslySetInnerHTML={{ __html: data.content }} 
                />
              </article>

              {/* QUOTE DI AKHIR TEKS */}
              {data.quote && (
                <div className="mt-12 pt-8 border-t border-zinc-200">
                  <p className="text-lg italic text-zinc-500 text-center leading-relaxed">
                    "{data.quote}"
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* FOOTER AKSARA */}
          <div className="mt-10 flex justify-center gap-6">
             <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Tautan disalin!");
                }}
                className="text-zinc-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-2 hover:text-amber-600 transition-colors"
             >
               <Share2 className="h-4 w-4" /> Share Story
             </button>
          </div>

        </div>
      </main>

      <Footer />

      <style jsx global>{`
        /* Mengatur agar teks rapi dan tidak ada huruf besar di awal */
        .cerpen-text-content p {
          margin-bottom: 1.5rem;
          text-indent: 2rem;
          line-height: 1.8;
          font-size: 1.1rem;
        }

        /* Mematikan fitur huruf pertama besar (Dropcap) */
        .cerpen-text-content p:first-of-type::first-letter {
          all: unset !important;
        }

        .cerpen-text-content p:first-of-type {
          text-indent: 0;
        }

        /* Scrollbar halus untuk halaman buku */
        .book-container div::-webkit-scrollbar {
          width: 4px;
        }
        .book-container div::-webkit-scrollbar-track {
          background: transparent;
        }
        .book-container div::-webkit-scrollbar-thumb {
          background: #d4d4d8;
          border-radius: 10px;
        }

        @media (max-width: 768px) {
          .book-container {
            min-height: auto;
            grid-template-cols: 1fr;
          }
          .cerpen-text-content p {
            text-indent: 1rem;
            text-align: left;
          }
        }
      `}</style>
    </div>
  )
}
