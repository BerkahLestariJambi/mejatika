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

  if (!data) return <div className="text-center py-20 font-serif text-zinc-500 uppercase">Naskah Tidak Ditemukan</div>

  return (
    <div className="min-h-screen bg-[#e5e1d8] flex flex-col font-serif">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-2 py-10 lg:py-16">
        <div className="max-w-4xl mx-auto">
          
          {/* FRAME UTAMA - BINGKAI KERTAS */}
          <div className="relative bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-zinc-200 rounded-sm overflow-hidden">
            
            {/* Garis Margin Merah Vertikal */}
            <div className="absolute left-8 md:left-20 top-0 bottom-0 w-[1px] bg-red-200 z-20"></div>

            {/* Efek Lubang Binder */}
            <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-around py-10 z-30 opacity-30">
                {[...Array(15)].map((_, i) => (
                    <div key={i} className="w-3 h-3 bg-[#e5e1d8] rounded-full shadow-inner border border-zinc-300"></div>
                ))}
            </div>

            {/* AREA ISI NASKAH (Garis Folio) */}
            <div className="relative z-10 px-12 md:px-28 py-12 md:py-20 folio-lines">
              
              {/* 1. JUDUL */}
              <header className="mb-8 border-b border-zinc-100 pb-6">
                <h1 className="text-3xl md:text-6xl font-black text-zinc-900 leading-tight italic uppercase tracking-tighter mb-4">
                  {data.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-zinc-400 font-sans font-bold uppercase text-[9px] tracking-widest">
                   <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-amber-500" /> {new Date(data.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                   <span className="flex items-center gap-1"><User className="h-3 w-3 text-amber-500" /> Penulis Mejatika</span>
                </div>
              </header>

              {/* 2. GAMBAR UTAMA */}
              <div className="mb-10">
                <div className="bg-zinc-50 p-2 border border-zinc-100 shadow-sm inline-block w-full">
                  <img 
                    src={data.image || "/placeholder.svg"} 
                    alt={data.title} 
                    className="w-full h-auto max-h-[500px] object-cover" 
                  />
                </div>
              </div>

              {/* 3. ISI CERITA */}
              <article className="cerpen-content mb-12 overflow-hidden">
                <div 
                  className="prose prose-zinc prose-lg md:prose-xl max-w-none text-zinc-800"
                  dangerouslySetInnerHTML={{ __html: data.content }} 
                />
              </article>

              {/* 4. QUOTE */}
              {data.quote && (
                <div className="mb-12 p-6 md:p-10 bg-zinc-50 border-y border-zinc-100 text-center relative">
                   <QuoteIcon className="absolute top-2 left-2 h-8 w-8 text-zinc-200" />
                   <p className="text-xl md:text-2xl italic text-zinc-600 font-serif leading-relaxed">
                     "{data.quote}"
                   </p>
                </div>
              )}

              {/* 5. TOMBOL KEMBALI */}
              <div className="pt-10 border-t border-zinc-100 text-center">
                <button 
                  onClick={() => router.push('/cerpen')}
                  className="inline-flex items-center gap-2 text-zinc-400 hover:text-amber-600 transition-colors uppercase text-[10px] font-sans font-black tracking-[0.3em]"
                >
                  <ArrowLeft className="h-4 w-4" /> Kembali ke Ruang Cerpen
                </button>
              </div>

            </div>
          </div>

          {/* TOMBOL SHARE (DI LUAR FRAME) */}
          <div className="mt-8 flex justify-center">
             <Button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Tautan berhasil disalin!");
                }}
                className="bg-zinc-900 text-white rounded-full px-8 hover:bg-amber-600 transition-all font-sans font-bold uppercase text-[10px] tracking-widest"
             >
                <Share2 className="mr-2 h-4 w-4" /> Salin Link Cerita
             </Button>
          </div>

        </div>
      </main>

      <Footer />

      <style jsx global>{`
        /* KONFIGURASI GARIS FOLIO */
        .folio-lines {
          background-image: linear-gradient(#f1f1f1 1.2px, transparent 1.2px);
          background-size: 100% 2.8rem; /* Ukuran baris */
        }

        .cerpen-content {
          line-height: 2.8rem !important;
        }

        .cerpen-content p {
          margin-bottom: 2.8rem !important; /* Pas dengan garis */
          text-indent: 2.5rem;
          line-height: 2.8rem !important;
          word-wrap: break-word; /* Mencegah teks keluar frame */
        }

        .cerpen-content p:first-of-type {
          text-indent: 0;
        }

        /* Dropcap (Huruf Pertama) */
        .cerpen-content p:first-of-type::first-letter {
          float: left;
          font-size: 5.5rem;
          line-height: 1;
          font-weight: 900;
          margin-top: 0.5rem;
          margin-right: 0.8rem;
          color: #d97706;
          font-style: italic;
        }

        /* Perbaikan untuk elemen di dalam prose */
        .prose p {
          margin-top: 0 !important;
          margin-bottom: 2.8rem !important;
        }

        /* Mobile Fix */
        @media (max-width: 640px) {
          .folio-lines {
            padding-left: 2.5rem;
            padding-right: 1rem;
          }
          .cerpen-content p {
            text-indent: 1.5rem;
            font-size: 1.1rem;
          }
          .absolute.left-8 { left: 1.5rem; }
        }
      `}</style>
    </div>
  )
}
