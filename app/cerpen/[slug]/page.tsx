"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Calendar, User, Share2, BookOpen, Quote } from "lucide-react"

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
    <div className="h-screen flex items-center justify-center bg-[#f4f1ea]">
      <Loader2 className="animate-spin text-amber-600 h-10 w-10" />
    </div>
  )

  if (!data) return <div className="text-center py-20 font-serif text-zinc-500">Naskah tidak ditemukan.</div>

  return (
    <div className="min-h-screen bg-[#e5e1d8] flex flex-col font-serif">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8 lg:py-16">
        <div className="max-w-4xl mx-auto">
          
          {/* PEMBUNGKUS UTAMA LEMBARAN KERTAS */}
          <div className="paper-container relative bg-white shadow-[20px_20px_60px_rgba(0,0,0,0.15)] border border-zinc-200 overflow-hidden rounded-sm">
            
            {/* Garis Margin Merah Vertikal (Khas Folio) */}
            <div className="absolute left-12 md:left-24 top-0 bottom-0 w-[1.5px] bg-red-200 z-10"></div>

            {/* Efek Lubang Binder Samping */}
            <div className="absolute left-4 top-0 bottom-0 flex flex-col justify-around py-12 z-20 opacity-40">
                {[...Array(15)].map((_, i) => (
                    <div key={i} className="w-3.5 h-3.5 bg-[#e5e1d8] rounded-full shadow-inner border border-zinc-300"></div>
                ))}
            </div>

            {/* KONTEN DI DALAM KERTAS */}
            <div className="relative z-0 px-16 md:px-32 py-12 md:py-20 paper-lines">
              
              {/* 1. Tombol Kembali (Di dalam kertas) */}
              <button 
                onClick={() => router.push('/cerpen')}
                className="mb-10 flex items-center gap-2 text-zinc-400 hover:text-amber-700 transition-colors uppercase text-[10px] tracking-[0.2em] font-sans font-bold"
              >
                <ArrowLeft className="h-3 w-3" /> Kembali ke Arsip
              </button>

              {/* 2. Judul Naskah */}
              <header className="mb-12 border-b-2 border-zinc-100 pb-8">
                <h1 className="text-4xl md:text-6xl font-black text-zinc-900 leading-tight mb-4 italic uppercase tracking-tighter">
                  {data.title}
                </h1>
                <div className="flex flex-wrap gap-6 text-zinc-400 font-sans font-bold uppercase text-[9px] tracking-widest">
                   <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-amber-500" /> {new Date(data.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                   <span className="flex items-center gap-1"><User className="h-3 w-3 text-amber-500" /> Mejatika Literasi</span>
                </div>
              </header>

              {/* 3. Gambar Utama (Sekarang di dalam kertas) */}
              <div className="mb-12 relative group">
                <div className="absolute -inset-1 bg-zinc-100 rounded-lg transform -rotate-1 group-hover:rotate-0 transition-transform"></div>
                <img 
                  src={data.image || "/placeholder.svg"} 
                  alt={data.title} 
                  className="relative w-full h-[250px] md:h-[450px] object-cover rounded-sm grayscale-[30%] hover:grayscale-0 transition-all duration-500 shadow-md border-4 border-white" 
                />
              </div>

              {/* 4. Quote (Jika ada) */}
              {data.quote && (
                <div className="mb-12 flex gap-4 p-6 bg-zinc-50 border-l-4 border-amber-500 italic text-zinc-600 text-lg md:text-xl font-serif">
                  <Quote className="h-6 w-6 text-amber-300 shrink-0" />
                  <p>"{data.quote}"</p>
                </div>
              )}

              {/* 5. Isi Cerita */}
              <article className="cerpen-wrapper">
                <div 
                  className="prose prose-zinc prose-lg md:prose-xl max-w-none text-zinc-800"
                  dangerouslySetInnerHTML={{ __html: data.content }} 
                />
              </article>

              {/* 6. Penutup Lembaran */}
              <div className="mt-20 pt-10 border-t border-dashed border-zinc-200 text-center">
                 <div className="inline-block p-2 border-2 border-amber-600/20 rounded-full mb-4">
                    <BookOpen className="h-6 w-6 text-amber-600" />
                 </div>
                 <p className="text-[10px] font-sans font-black uppercase tracking-[0.4em] text-zinc-300">Tamat / Finis</p>
              </div>

            </div>
          </div>

          {/* Share Button (Di luar kertas agar tetap bersih) */}
          <div className="mt-10 flex justify-center">
             <Button 
                onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Tautan berhasil disalin!");
                }}
                className="bg-zinc-900 text-white rounded-full px-10 hover:bg-amber-600 transition-all font-sans font-bold uppercase text-[10px] tracking-widest shadow-xl"
             >
                <Share2 className="mr-2 h-4 w-4" /> Bagikan Kisah Ini
             </Button>
          </div>

        </div>
      </main>

      <Footer />

      <style jsx global>{`
        /* EFEK GARIS BUKU */
        .paper-lines {
          background-image: linear-gradient(#e5e7eb 1.5px, transparent 1.5px);
          background-size: 100% 3.2rem; /* Jarak antar baris */
          line-height: 3.2rem;
        }

        .cerpen-wrapper {
          line-height: 3.2rem !important;
        }

        .cerpen-wrapper p {
          margin-bottom: 3.2rem !important; /* Menjaga teks tetap pada garis */
          text-indent: 3rem;
          line-height: 3.2rem !important;
        }

        .cerpen-wrapper p:first-of-type {
          text-indent: 0;
        }

        /* Huruf Pertama (Dropcap) */
        .cerpen-wrapper p:first-of-type::first-letter {
          float: left;
          font-size: 6rem;
          line-height: 1;
          font-weight: 900;
          margin-top: 0.5rem;
          margin-right: 0.8rem;
          color: #d97706;
          font-style: italic;
          text-transform: uppercase;
        }

        /* Matikan garis default prose agar tidak bertabrakan dengan garis buku */
        .prose hr { border: none; }
        .prose blockquote { border: none; padding-left: 0; }
      `}</style>
    </div>
  )
}
