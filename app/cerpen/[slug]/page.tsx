"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"

export default function DetailCerpen() {
  const { slug } = useParams()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [pages, setPages] = useState<string[][]>([])

  useEffect(() => {
    if (!slug) return;
    fetch(`https://backend.mejatika.com/api/news/${slug}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json.data)
          const tempDiv = document.createElement('div')
          tempDiv.innerHTML = json.data.content
          // Ambil semua elemen paragraf
          const paragraphs = Array.from(tempDiv.querySelectorAll('p')).map(p => p.outerHTML)
          
          // Batasi 4 paragraf per halaman
          const chunkSize = 4
          const paginated: string[][] = []
          for (let i = 0; i < paragraphs.length; i += chunkSize) {
            paginated.push(paragraphs.slice(i, i + chunkSize))
          }
          setPages(paginated)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  const nextPg = () => { if (currentPage < pages.length - 1) setCurrentPage(v => v + 1) }
  const prevPg = () => { if (currentPage > 0) setCurrentPage(v => v - 1) }

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-zinc-100">
      <Loader2 className="animate-spin text-amber-600 h-10 w-10" />
    </div>
  )

  if (!data) return <div className="text-center py-20 font-serif">Naskah tidak ditemukan.</div>

  return (
    <div className="min-h-screen bg-zinc-200 flex flex-col font-serif">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-10 lg:py-20 flex flex-col items-center">
        <div className="max-w-6xl w-full">
          
          <button onClick={() => router.push('/cerpen')} className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-black uppercase text-[10px] font-sans font-black tracking-widest">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </button>

          {/* FRAME BUKU - UKURAN KIRI KANAN SAMA (50:50) */}
          <div className="flex flex-col md:flex-row bg-[#fdfbf7] shadow-[0_40px_80px_rgba(0,0,0,0.15)] border border-zinc-300 min-h-[650px] relative rounded-sm overflow-hidden">
            
            {/* Lipatan Tengah */}
            <div className="absolute inset-y-0 left-1/2 w-[1px] bg-black/10 z-20 hidden md:block -translate-x-1/2"></div>
            <div className="absolute inset-y-0 left-1/2 w-16 -translate-x-1/2 bg-gradient-to-r from-black/[0.02] via-black/[0.08] to-black/[0.02] z-10 hidden md:block"></div>

            {/* HALAMAN KIRI: JUDUL & GAMBAR */}
            <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-zinc-200 bg-[#faf8f3]">
              <h1 className="text-3xl md:text-5xl font-black text-zinc-900 leading-tight mb-8 uppercase tracking-tighter italic break-words w-full">
                {data.title}
              </h1>
              <div className="w-full max-w-[280px] aspect-[3/4] shadow-2xl border-[8px] border-white rotate-[-1deg] overflow-hidden">
                <img src={data.image} alt={data.title} className="w-full h-full object-cover" />
              </div>
              <div className="mt-8 opacity-30 italic text-[10px] tracking-[0.5em] uppercase">— Mejatika Literasi —</div>
            </div>

            {/* HALAMAN KANAN: ISI CERPEN (TERKUNCI DI DALAM FRAME) */}
            <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 relative bg-white flex flex-col justify-between overflow-hidden">
              <div className="w-full overflow-hidden">
                <div className="flex justify-between items-center mb-8 text-zinc-300 font-sans text-[9px] font-bold uppercase tracking-widest border-b pb-4">
                   <span>Arsip Naskah</span>
                   <span>Hal. {currentPage + 1} / {pages.length}</span>
                </div>

                {/* KONTEN DENGAN WRAPPER ANTI-MELUBER */}
                <article className="cerpen-paginated-container w-full">
                  <div className="prose prose-zinc prose-base md:prose-lg max-w-full overflow-hidden">
                    {pages[currentPage]?.map((p, i) => (
                      <div 
                        key={i} 
                        dangerouslySetInnerHTML={{ __html: p }} 
                        className="mb-6 text-justify text-zinc-800 leading-relaxed overflow-wrap-anywhere" 
                      />
                    ))}
                  </div>
                </article>

                {currentPage === pages.length - 1 && data.quote && (
                  <div className="mt-8 p-5 bg-zinc-50 border-l-4 border-amber-400 italic text-zinc-500 text-sm">
                    "{data.quote}"
                  </div>
                )}
              </div>

              {/* NAVIGASI HALAMAN */}
              <div className="mt-10 flex justify-between items-center border-t pt-6">
                <button 
                  onClick={prevPg} 
                  disabled={currentPage === 0}
                  className={`flex items-center text-[10px] font-black uppercase tracking-widest transition-colors ${currentPage === 0 ? 'text-zinc-200' : 'text-zinc-400 hover:text-amber-600'}`}
                >
                  <ChevronLeft className="mr-1 h-3 w-3" /> Prev
                </button>
                
                <div className="flex gap-1.5">
                    {[...Array(pages.length)].map((_, i) => (
                        <div key={i} className={`h-1.5 w-1.5 rounded-full transition-all ${i === currentPage ? 'bg-amber-500 w-4' : 'bg-zinc-200'}`} />
                    ))}
                </div>

                <button 
                  onClick={nextPg} 
                  disabled={currentPage === pages.length - 1}
                  className={`flex items-center text-[10px] font-black uppercase tracking-widest transition-colors ${currentPage === pages.length - 1 ? 'text-zinc-200' : 'text-zinc-400 hover:text-amber-600'}`}
                >
                  Next <ChevronRight className="ml-1 h-3 w-3" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />

      <style jsx global>{`
        /* Kunci utama agar teks tidak keluar frame */
        .cerpen-paginated-container {
          word-wrap: break-word;
          overflow-wrap: break-word;
          hyphens: auto;
        }

        .cerpen-paginated-container p {
          margin-bottom: 1.5rem !important;
          text-indent: 2rem;
          max-width: 100%;
          display: block;
        }

        .cerpen-paginated-container p:first-of-type {
          text-indent: 0;
        }

        /* Mematikan Dropcap agar rapi */
        .cerpen-paginated-container p:first-of-type::first-letter {
          all: unset !important;
        }

        .overflow-wrap-anywhere {
          overflow-wrap: anywhere;
        }

        @media (max-width: 768px) {
          .cerpen-paginated-container p {
            text-indent: 1rem;
            text-align: left;
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  )
}
