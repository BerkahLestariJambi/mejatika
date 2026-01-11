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
    <div className="h-screen flex items-center justify-center bg-[#f0ede5]">
      <Loader2 className="animate-spin text-amber-600 h-10 w-10" />
    </div>
  )

  if (!data) return <div className="text-center py-20 font-serif text-zinc-500 uppercase">Naskah Tidak Ditemukan</div>

  return (
    <div className="min-h-screen bg-[#e5e1d8] flex flex-col font-serif">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-10 lg:py-16">
        <div className="max-w-4xl mx-auto">
          
          {/* PEMBUNGKUS KERTAS (FRAME) */}
          <div className="relative bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-zinc-200 rounded-sm overflow-hidden">
            
            {/* Garis Margin Merah (Kiri) */}
            <div className="absolute left-10 md:left-24 top-0 bottom-0 w-[1.5px] bg-red-200 z-20"></div>

            {/* Efek Lubang Binder */}
            <div className="absolute left-3 top-0 bottom-0 flex flex-col justify-around py-12 z-30 opacity-30">
                {[...Array(16)].map((_, i) => (
                    <div key={i} className="w-3.5 h-3.5 bg-[#e5e1d8] rounded-full shadow-inner border border-zinc-300"></div>
                ))}
            </div>

            {/* ISI KONTEN DI DALAM FRAME */}
            <div className="relative z-10 px-14 md:px-36 py-16 md:py-24 folio-paper">
              
              {/* 1. JUDUL (DI DALAM FRAME) */}
              <header className="mb-12 border-b-2 border-zinc-100 pb-8">
                <h1 className="text-4xl md:text-7xl font-black text-zinc-900 leading-[0.85] italic uppercase tracking-tighter mb-6">
                  {data.title}
                </h1>
                <div className="flex flex-wrap items-center gap-6 text-zinc-400 font-sans font-bold uppercase text-[10px] tracking-[0.2em]">
                   <span className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-amber-500" /> {new Date(data.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                   <span className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-amber-500" /> Mejatika Literasi</span>
                </div>
              </header>

              {/* 2. GAMBAR UTAMA (DI DALAM FRAME) */}
              <div className="mb-16">
                <div className="bg-white p-3 shadow-md border border-zinc-100 transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                  <img 
                    src={data.image || "/placeholder.svg"} 
                    alt={data.title} 
                    className="w-full h-auto max-h-[500px] object-cover rounded-sm" 
                  />
                </div>
              </div>

              {/* 3. ISI CERITA (SUDAH DIKUNCI AGAR TIDAK LEBAR) */}
              <article className="cerpen-content mb-16 overflow-hidden">
                <div 
                  className="prose prose-zinc prose-lg md:prose-xl max-w-none text-zinc-800 leading-[3rem]"
                  dangerouslySetInnerHTML={{ __html: data.content }} 
                />
              </article>

              {/* 4. QUOTE (DI DALAM FRAME) */}
              {data.quote && (
                <div className="mb-16 p-8 bg-zinc-50 border-y-2 border-zinc-100 text-center relative italic">
                   <QuoteIcon className="absolute top-2 left-2 h-10 w-10 text-zinc-200/50" />
                   <p className="text-xl md:text-3xl text-zinc-600 font-serif leading-relaxed">
                     "{data.quote}"
                   </p>
                </div>
              )}

              {/* 5. TOMBOL KEMBALI (DI DALAM FRAME) */}
              <div className="pt-12 border-t border-zinc-100 text-center">
                <button 
                  onClick={() => router.push('/cerpen')}
                  className="inline-flex items-center gap-3 text-zinc-400 hover:text-amber-600 transition-all uppercase text-[10px] font-sans font-black tracking-[0.4em]"
                >
                  <ArrowLeft className="h-4 w-4" /> Kembali ke Ruang Arsip
                </button>
              </div>

            </div>
          </div>

          {/* TOMBOL SHARE (DI LUAR FRAME AGAR BERSIH) */}
          <div className="mt-10 flex justify-center opacity-40 hover:opacity-100 transition-opacity">
             <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Tautan berhasil disalin bos!");
                }}
                className="text-zinc-600 text-[9px] uppercase font-black tracking-widest flex items-center gap-2 border-b border-zinc-400 pb-1"
             >
               <Share2 className="h-3 w-3" /> Bagikan Naskah Ini
             </button>
          </div>

        </div>
      </main>

      <Footer />

      <style jsx global>{`
        /* KUNCI TAMPILAN GARIS */
        .folio-paper {
          background-image: linear-gradient(#f0f0f0 1.5px, transparent 1.5px);
          background-size: 100% 3rem; /* Tinggi baris garis */
        }

        .cerpen-content {
          line-height: 3rem !important; /* WAJIB SAMA DENGAN background-size */
        }

        .cerpen-content p {
          margin-bottom: 3rem !important; 
          text-indent: 3.5rem;
          line-height: 3rem !important;
          word-break: break-word; /* INI KUNCINYA AGAR TEKS TIDAK KELUAR */
        }

        .cerpen-content p:first-of-type {
          text-indent: 0;
        }

        /* Huruf Pertama (Dropcap) */
        .cerpen-content p:first-of-type::first-letter {
          float: left;
          font-size: 6.5rem;
          line-height: 1;
          font-weight: 900;
          margin-top: 0.8rem;
          margin-right: 1.2rem;
          color: #d97706;
          font-style: italic;
          text-transform: uppercase;
        }

        /* Override Prose Defaults */
        .prose p {
          margin-top: 0 !important;
          margin-bottom: 3rem !important;
        }

        /* Mobile Optimization */
        @media (max-width: 768px) {
          .folio-paper {
            padding-left: 3.5rem;
            padding-right: 1.5rem;
          }
          .cerpen-content p {
            text-indent: 1.5rem;
            font-size: 1.15rem;
          }
        }
      `}</style>
    </div>
  )
}
