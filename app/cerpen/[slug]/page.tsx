"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight, Share2, Twitter, MessageCircle } from "lucide-react"

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
          const paragraphs = Array.from(tempDiv.querySelectorAll('p')).map(p => p.outerHTML)
          
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

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    alert("Tautan naskah berhasil disalin!")
  }

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
          
          {/* FRAME BUKU 50:50 */}
          <div className="flex flex-col md:flex-row bg-[#fdfbf7] shadow-[0_40px_80px_rgba(0,0,0,0.15)] border border-zinc-300 min-h-[700px] relative rounded-sm overflow-hidden">
            
            {/* Lipatan Tengah */}
            <div className="absolute inset-y-0 left-1/2 w-[1px] bg-black/10 z-20 hidden md:block -translate-x-1/2"></div>
            <div className="absolute inset-y-0 left-1/2 w-16 -translate-x-1/2 bg-gradient-to-r from-black/[0.02] via-black/[0.08] to-black/[0.02] z-10 hidden md:block"></div>

            {/* HALAMAN KIRI: JUDUL & COVER */}
            <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-zinc-200 bg-[#faf8f3]">
              <h1 className="text-3xl md:text-5xl font-black text-zinc-900 leading-tight mb-8 uppercase tracking-tighter italic w-full">
                {data.title}
              </h1>
              <div className="w-full max-w-[260px] aspect-[3/4] shadow-2xl border-[8px] border-white rotate-[-1deg] overflow-hidden mb-10">
                <img src={data.image} alt={data.title} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex flex-col items-center gap-4">
                <div className="opacity-30 italic text-[10px] tracking-[0.5em] uppercase">— Mejatika Literasi —</div>
                
                {/* TOMBOL KEMBALI BULAT */}
                <button 
                  onClick={() => router.push('/cerpen')}
                  className="w-12 h-12 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-amber-600 hover:border-amber-600 transition-all bg-white shadow-sm group"
                  title="Kembali ke Ruang Cerpen"
                >
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* HALAMAN KANAN: ISI & SHARE */}
            <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 relative bg-white flex flex-col justify-between overflow-hidden">
              <div className="w-full">
                <div className="flex justify-between items-center mb-8 text-zinc-300 font-sans text-[9px] font-bold uppercase tracking-widest border-b pb-4">
                   <span>Arsip Naskah Cerpen</span>
                   <span>Hal. {currentPage + 1} / {pages.length}</span>
                </div>

                <article className="cerpen-paginated-container w-full min-h-[350px]">
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

              {/* NAVIGASI HALAMAN & SHARE AREA */}
              <div className="mt-10">
                {/* Navigasi Hal */}
                <div className="flex justify-between items-center border-t border-zinc-100 pt-6 mb-8">
                  <button 
                    onClick={prevPg} 
                    disabled={currentPage === 0}
                    className={`flex items-center text-[10px] font-black uppercase tracking-widest transition-colors ${currentPage === 0 ? 'text-zinc-200' : 'text-zinc-400 hover:text-amber-600'}`}
                  >
                    <ChevronLeft className="mr-1 h-3 w-3" /> Prev
                  </button>
                  
                  <div className="flex gap-1.5 font-sans text-[10px] text-zinc-300 font-bold">
                      {currentPage + 1} / {pages.length}
                  </div>

                  <button 
                    onClick={nextPg} 
                    disabled={currentPage === pages.length - 1}
                    className={`flex items-center text-[10px] font-black uppercase tracking-widest transition-colors ${currentPage === pages.length - 1 ? 'text-zinc-200' : 'text-zinc-400 hover:text-amber-600'}`}
                  >
                    Next <ChevronRight className="ml-1 h-3 w-3" />
                  </button>
                </div>

                {/* AREA SHARE BAGIAN BAWAH */}
                <div className="flex flex-col items-center gap-4 py-4 border-t border-dashed border-zinc-100">
                  <span className="text-[9px] font-sans font-black uppercase tracking-[0.3em] text-zinc-300">Bagikan Aksara</span>
                  <div className="flex gap-4">
                    <button onClick={handleShare} className="p-2.5 rounded-full bg-zinc-50 text-zinc-400 hover:bg-amber-500 hover:text-white transition-all shadow-sm">
                      <Share2 className="h-4 w-4" />
                    </button>
                    <button onClick={handleShare} className="p-2.5 rounded-full bg-zinc-50 text-zinc-400 hover:bg-[#25D366] hover:text-white transition-all shadow-sm">
                      <MessageCircle className="h-4 w-4" />
                    </button>
                    <button onClick={handleShare} className="p-2.5 rounded-full bg-zinc-50 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all shadow-sm">
                      <Twitter className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </main>

      <Footer />

      <style jsx global>{`
        .cerpen-paginated-container p {
          margin-bottom: 1.5rem !important;
          text-indent: 2.5rem;
          max-width: 100%;
          display: block;
        }

        .cerpen-paginated-container p:first-of-type {
          text-indent: 0;
        }

        .cerpen-paginated-container p:first-of-type::first-letter {
          all: unset !important;
        }

        .overflow-wrap-anywhere {
          overflow-wrap: anywhere;
        }

        @media (max-width: 768px) {
          .cerpen-paginated-container p {
            text-indent: 1.5rem;
            text-align: left;
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  )
}
