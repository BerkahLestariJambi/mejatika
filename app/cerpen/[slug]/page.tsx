"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
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
          
          <button 
            onClick={() => router.push('/cerpen')}
            className="mb-8 flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-all uppercase text-[10px] font-sans font-black tracking-widest"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke Ruang Cerpen
          </button>

          {/* FRAME BUKU UTAMA */}
          <div className="flex flex-col md:flex-row bg-[#fdfbf7] shadow-[0_50px_100px_rgba(0,0,0,0.15)] border border-zinc-300 rounded-sm relative overflow-hidden min-h-[600px]">
            
            {/* 1. HALAMAN KIRI (TERKUNCI) */}
            <div className="md:w-[40%] bg-[#faf7f0] p-8 md:p-12 border-b md:border-b-0 md:border-r border-zinc-200 relative shrink-0">
              <div className="md:sticky md:top-24 flex flex-col items-center text-center">
                <div className="mb-6 opacity-20"><BookOpen className="h-8 w-8 mx-auto" /></div>
                
                <h1 className="text-3xl md:text-5xl font-black text-zinc-900 leading-[1.1] mb-8 uppercase tracking-tighter italic">
                  {data.title}
                </h1>

                <div className="w-full relative px-4">
                  <div className="absolute inset-0 bg-zinc-200 rounded-sm rotate-2"></div>
                  <img 
                    src={data.image || "/placeholder.svg"} 
                    alt={data.title} 
                    className="relative w-full aspect-[4/5] object-cover shadow-lg border-4 border-white" 
                  />
                </div>

                <div className="mt-10 text-zinc-400 font-sans text-[9px] font-bold uppercase tracking-[0.3em]">
                   <span className="flex items-center justify-center gap-2 border-y border-zinc-200 py-3">
                     <Calendar className="h-3 w-3" /> {new Date(data.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                   </span>
                </div>
              </div>
            </div>

            {/* 2. HALAMAN KANAN (ISI CERPEN - DIPAKSA DALAM FRAME) */}
            <div className="md:w-[60%] p-8 md:p-16 lg:p-20 relative bg-white overflow-hidden flex flex-col">
              {/* Efek Bayangan Lipatan Tengah */}
              <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/[0.06] to-transparent pointer-events-none"></div>

              {/* Kontainer Teks dengan Pembatas Lebar */}
              <article className="cerpen-content-box w-full max-w-full overflow-hidden">
                <div 
                  className="prose prose-zinc prose-lg lg:prose-xl max-w-full text-zinc-800 leading-relaxed text-justify font-serif break-words"
                  dangerouslySetInnerHTML={{ __html: data.content }} 
                />
              </article>

              {data.quote && (
                <div className="mt-16 pt-8 border-t border-zinc-100 italic text-zinc-400 text-center text-lg md:text-xl">
                    "{data.quote}"
                </div>
              )}

              <div className="mt-auto pt-10 flex justify-center">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Tautan disalin!");
                  }}
                  className="flex items-center gap-2 text-zinc-300 hover:text-amber-600 transition-colors uppercase text-[9px] font-sans font-black tracking-widest border border-zinc-200 px-5 py-2 rounded-full"
                >
                  <Share2 className="h-3 w-3" /> Salin Tautan
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />

      <style jsx global>{`
        /* Memaksa elemen di dalam prose untuk tidak melebar keluar kontainer */
        .cerpen-content-box .prose {
          width: 100% !important;
          max-width: 100% !important;
          overflow-wrap: break-word !important;
          word-wrap: break-word !important;
          word-break: break-word !important;
        }

        .cerpen-content-box p {
          margin-bottom: 1.5rem;
          text-indent: 2rem;
          line-height: 1.8;
          font-size: 1.15rem;
          /* Mencegah teks meluber */
          max-width: 100%;
          overflow: hidden;
        }

        .cerpen-content-box p:first-of-type {
          text-indent: 0;
        }

        /* Matikan fitur dropcap */
        .cerpen-content-box p:first-of-type::first-letter {
          all: unset !important;
        }

        @media (max-width: 768px) {
          .cerpen-content-box p {
            text-indent: 1rem;
            text-align: left;
          }
        }
      `}</style>
    </div>
  )
}
