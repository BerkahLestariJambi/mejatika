"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Calendar, User, Share2, BookOpen } from "lucide-react"

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

  if (!data) return <div className="text-center py-20 font-bold uppercase tracking-widest text-zinc-400">Naskah tidak ditemukan.</div>

  return (
    <div className="min-h-screen bg-[#f4f1ea] flex flex-col"> {/* Warna background cream kertas lama */}
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-12 lg:py-20">
        <div className="max-w-4xl mx-auto">
          
          <Button 
            variant="ghost" 
            onClick={() => router.push('/cerpen')}
            className="mb-8 group text-zinc-500 hover:text-amber-700 font-black uppercase text-[10px] tracking-widest"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Kembali ke Ruang Cerpen
          </Button>

          {/* Judul & Meta */}
          <header className="mb-12 text-center">
            <div className="flex justify-center mb-4 text-amber-600">
                <BookOpen className="h-8 w-8" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-zinc-900 leading-[0.9] mb-6 drop-shadow-sm">
              {data.title}
            </h1>
            <div className="flex flex-wrap justify-center items-center gap-6 text-zinc-500 font-bold uppercase text-[10px] tracking-widest py-4 border-y border-zinc-300/50">
              <div className="flex items-center gap-2"><Calendar className="h-3 w-3 text-amber-600" /> {new Date(data.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              <div className="flex items-center gap-2"><User className="h-3 w-3 text-amber-600" /> Penulis Mejatika</div>
            </div>
          </header>

          {/* Featured Image */}
          <div className="relative h-[300px] md:h-[500px] w-full rounded-2xl overflow-hidden mb-16 shadow-2xl rotate-1 group transition-transform hover:rotate-0">
            <img src={data.image || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          {/* TAMPILAN KERTAS BERGARIS */}
          <div className="paper-container relative shadow-[0_20px_50px_rgba(0,0,0,0.1)] mb-20">
            {/* Lubang Binder (Variasi) */}
            <div className="absolute left-4 top-0 bottom-0 flex flex-col justify-around py-10 z-20 opacity-30">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-[#f4f1ea] rounded-full shadow-inner border border-zinc-300"></div>
                ))}
            </div>

            <article className="paper-content relative bg-white min-h-[500px] px-12 md:px-24 py-16 border border-zinc-200">
              {/* Garis Margin Merah Khas Buku */}
              <div className="absolute left-10 md:left-20 top-0 bottom-0 w-[2px] bg-red-200 opacity-60"></div>
              
              <div 
                className="content-inner prose prose-zinc prose-lg lg:prose-xl max-w-none relative z-10"
                dangerouslySetInnerHTML={{ __html: data.content }} 
              />
            </article>
          </div>

          {/* Footer Card */}
          <div className="mt-20 p-10 bg-white/50 backdrop-blur-sm rounded-3xl border border-zinc-200 text-center shadow-sm">
            <h4 className="font-black italic uppercase text-zinc-900 mb-2">Selesai Membaca</h4>
            <p className="text-sm text-zinc-500 mb-6 font-medium uppercase tracking-tight">Kisah ini hanyalah sebagian dari ribuan aksara yang kami miliki</p>
            <div className="flex justify-center gap-4">
               <Button className="rounded-full bg-amber-600 hover:bg-zinc-900 text-white transition-all px-8 font-black uppercase text-[10px] tracking-widest shadow-lg">
                 <Share2 className="mr-2 h-4 w-4" /> Sebarkan Aksara
               </Button>
            </div>
          </div>

        </div>
      </main>

      <Footer />

      <style jsx global>{`
        /* KONFIGURASI KERTAS BERGARIS */
        .paper-content {
          background-image: linear-gradient(#e5e7eb 1px, transparent 1px);
          background-size: 100% 3rem; /* Jarak antar garis (sesuaikan dengan line-height) */
          line-height: 3rem;
        }

        .content-inner {
          font-family: 'Georgia', serif;
          color: #27272a;
          line-height: 3rem !important; /* Harus sama dengan background-size */
        }

        .content-inner p {
          margin: 0 0 3rem 0 !important; /* Margin bawah antar paragraf harus kelipatan line-height */
          text-indent: 3rem;
          padding: 0;
        }

        /* Penanganan khusus untuk teks HTML dari Editor */
        .content-inner * {
            line-height: 3rem !important;
        }

        .content-inner p:first-of-type {
          text-indent: 0;
        }

        /* Dropcap Estetik */
        .content-inner p:first-of-type::first-letter {
          float: left;
          font-size: 5.5rem;
          line-height: 4.5rem;
          font-weight: 900;
          padding-top: 0.5rem;
          padding-right: 0.8rem;
          padding-left: 0.2rem;
          color: #d97706;
          font-style: italic;
          text-transform: uppercase;
        }

        /* Styling Tabel di dalam kertas jika ada */
        .content-inner table {
          border-collapse: collapse;
          margin: 3rem 0;
          line-height: 1.5rem !important;
          background: rgba(255,255,255,0.5);
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
            .paper-content {
                padding-left: 3rem;
                padding-right: 1.5rem;
            }
            .content-inner p {
                text-indent: 1.5rem;
            }
        }
      `}</style>
    </div>
  )
}
