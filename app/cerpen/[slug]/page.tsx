"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Calendar, User, Share2, Quote as QuoteIcon } from "lucide-react"

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
    <div className="h-screen flex items-center justify-center bg-[#f0ede5]">
      <Loader2 className="animate-spin text-amber-600 h-10 w-10" />
    </div>
  )

  if (!data) return <div className="text-center py-20 font-serif text-zinc-500 uppercase tracking-widest">Naskah Tidak Ditemukan</div>

  return (
    <div className="min-h-screen bg-[#e5e1d8] flex flex-col font-serif">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-10 lg:py-16">
        <div className="max-w-4xl mx-auto">
          
          {/* FRAME LEMBARAN KERTAS (SEMUA DI DALAM SINI) */}
          <div className="paper-frame relative bg-white shadow-[25px_25px_60px_rgba(0,0,0,0.15)] border border-zinc-200 overflow-hidden rounded-sm">
            
            {/* Garis Margin Merah (Khas Folio) */}
            <div className="absolute left-12 md:left-24 top-0 bottom-0 w-[1.5px] bg-red-200 z-20"></div>

            {/* Efek Lubang Binder */}
            <div className="absolute left-4 top-0 bottom-0 flex flex-col justify-around py-12 z-30 opacity-40">
                {[...Array(18)].map((_, i) => (
                    <div key={i} className="w-3.5 h-3.5 bg-[#e5e1d8] rounded-full shadow-inner border border-zinc-300"></div>
                ))}
            </div>

            {/* AREA KONTEN BERGARIS */}
            <div className="relative z-10 px-16 md:px-32 py-16 md:py-24 paper-lines">
              
              {/* 1. JUDUL */}
              <header className="mb-10 relative">
                <h1 className="text-4xl md:text-7xl font-black text-zinc-900 leading-[0.9] italic uppercase tracking-tighter mb-4">
                  {data.title}
                </h1>
                <div className="flex items-center gap-4 text-zinc-400 font-sans font-bold uppercase text-[9px] tracking-[0.2em] mb-8">
                   <Calendar className="h-3 w-3 text-amber-500" /> 
                   {new Date(data.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                   <span className="mx-2">|</span>
                   <User className="h-3 w-3 text-amber-500" /> 
                   Mejatika Literasi
                </div>
              </header>

              {/* 2. GAMBAR UTAMA */}
              <div className="mb-14 relative">
                <div className="absolute -inset-2 bg-zinc-50 border border-zinc-100 rotate-1"></div>
                <img 
                  src={data.image || "/placeholder.svg"} 
                  alt={data.title} 
                  className="relative w-full h-[300px] md:h-[500px] object-cover shadow-lg border-[10px] border-white" 
                />
              </div>

              {/* 3. ISI CERPEN */}
              <article className="cerpen-body mb-16">
                <div 
                  className="prose prose-zinc prose-lg md:prose-xl max-w-none text-zinc-800 leading-[3.2rem]"
                  dangerouslySetInnerHTML={{ __html: data.content }} 
                />
              </article>

              {/* 4. QUOTE (Jika ada) */}
              {data.quote && (
                <div className="mb-16 p-8 bg-amber-50/50 border-y-2 border-amber-200/50 relative overflow-hidden">
                   <QuoteIcon className="absolute -top-2 -left-2 h-16 w-16 text-amber-100/50 -rotate-12" />
                   <p className="relative z-10 text-xl md:text-2xl text-amber-900 italic font-serif leading-relaxed text-center">
                     "{data.quote}"
                   </p>
                </div>
              )}

              {/* 5. TOMBOL KEMBALI KE ARSIP (Paling Bawah di dalam Lembaran) */}
              <div className="pt-10 border-t border-zinc-100 flex flex-col items-center">
                <button 
                  onClick={() => router.push('/cerpen')}
                  className="group flex items-center gap-3 text-zinc-400 hover:text-amber-700 transition-all uppercase text-[10px] font-sans font-black tracking-[0.3em]"
                >
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-2 transition-transform" /> 
                  Kembali ke Ruang Arsip
                </button>
                <div className="mt-8 opacity-20 text-[10px] tracking-[1em] uppercase text-zinc-400">Mejatika</div>
              </div>

            </div>
          </div>

          {/* Tombol Share (Opsional - Di luar frame agar tidak merusak naskah) */}
          <div className="mt-8 flex justify-center opacity-50 hover:opacity-100 transition-opacity">
             <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Tautan disalin!");
                }}
                className="text-zinc-500 text-[9px] uppercase font-black tracking-widest flex items-center gap-2"
             >
               <Share2 className="h-3 w-3" /> Share This Script
             </button>
          </div>

        </div>
      </main>

      <Footer />

      <style jsx global>{`
        /* EFEK GARIS BUKU TULIS */
        .paper-lines {
          background-image: linear-gradient(#f0f0f0 1.5px, transparent 1.5px);
          background-size: 100% 3.2rem;
        }

        /* Tipografi Cerpen */
        .cerpen-body p {
          margin-bottom: 3.2rem !important; /* Pas dengan jarak garis */
          text-indent: 3.5rem;
          line-height: 3.2rem !important;
        }

        .cerpen-body p:first-of-type {
          text-indent: 0;
        }

        /* Dropcap (Huruf Pertama) */
        .cerpen-body p:first-of-type::first-letter {
          float: left;
          font-size: 6.5rem;
          line-height: 1;
          font-weight: 900;
          margin-top: 0.8rem;
          margin-right: 1rem;
          color: #d97706;
          font-style: italic;
          text-transform: uppercase;
        }

        /* Menghilangkan margin default prose agar teks duduk di garis */
        .prose :where(p):not(:where([class~="not-prose"] *)) {
          margin-top: 0;
          margin-bottom: 3.2rem;
        }

        /* Responsive Fix */
        @media (max-width: 768px) {
          .paper-lines {
            padding-left: 2.5rem;
            padding-right: 1.5rem;
          }
          .cerpen-body p {
            text-indent: 1.5rem;
          }
        }
      `}</style>
    </div>
  )
}
