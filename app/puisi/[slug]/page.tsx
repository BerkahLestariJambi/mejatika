"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  ChevronLeft, 
  Share2, 
  Feather, 
  Music, 
  Heart,
  Quote,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function PoetryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [poem, setPoem] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.slug) {
      fetchPoem()
    }
  }, [params.slug])

  const fetchPoem = async () => {
    try {
      const res = await fetch(`https://backend.mejatika.com/api/articles/read/${params.slug}`)
      const json = await res.json()
      if (json.success) {
        setPoem(json.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfcf7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-700" />
      </div>
    )
  }

  if (!poem) return null

  return (
    <div className="bg-[#fdfcf7] min-h-screen pb-32 selection:bg-amber-100 selection:text-amber-900">
      
      {/* MINIMAL NAV */}
      <nav className="fixed top-0 w-full z-50 px-6 h-20 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="rounded-full hover:bg-white/50 backdrop-blur-sm group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="ml-2 font-serif italic uppercase text-[10px] tracking-widest">Kembali</span>
          </Button>
        </div>
        <div className="pointer-events-auto flex gap-2">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/50" onClick={() => toast.success("Karya disimpan ke favorit")}>
            <Heart className="w-4 h-4 text-zinc-400" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/50" onClick={() => {
            navigator.clipboard.writeText(window.location.href)
            toast.success("Link puisi berhasil disalin")
          }}>
            <Share2 className="w-4 h-4 text-zinc-400" />
          </Button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pt-32 lg:pt-40">
        
        {/* HEADER POETRY */}
        <header className="text-center mb-20">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-[1px] bg-amber-200 self-center"></div>
            <Feather className="w-6 h-6 text-amber-700 mx-6 opacity-40" />
            <div className="w-16 h-[1px] bg-amber-200 self-center"></div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-serif italic text-zinc-900 leading-tight mb-6">
            {poem.title}
          </h1>
          
          <div className="font-serif italic text-zinc-500 text-lg flex items-center justify-center gap-2">
            <span>Karya</span>
            <span className="text-zinc-800 font-bold border-b border-amber-300 pb-1 px-2">
              {poem.author_name}
            </span>
          </div>
        </header>

        {/* POETRY BODY */}
        <div className="relative">
          {/* Ikon Quote Dekorasi */}
          <Quote className="absolute -top-10 -left-10 w-20 h-20 text-zinc-100 -z-10" />
          
          <div 
            className="poetry-content font-serif text-xl md:text-3xl leading-[3.5rem] md:leading-[4rem] text-zinc-800 text-center italic whitespace-pre-wrap px-4"
            dangerouslySetInnerHTML={{ 
              // Menghilangkan tag HTML jika content dari Editor membawa tag P atau DIV yang merusak spasi puisi
              __html: poem.content 
            }}
          />

          <Quote className="absolute -bottom-10 -right-10 w-20 h-20 text-zinc-100 -z-10 rotate-180" />
        </div>

        {/* FOOTER INFO */}
        <footer className="mt-32 pt-16 border-t border-zinc-200/60 text-center">
          <div className="mb-10">
            <img 
              src={poem.author_photo || `https://ui-avatars.com/api/?name=${poem.author_name}`} 
              className="w-20 h-20 rounded-full mx-auto grayscale hover:grayscale-0 transition-all duration-700 border-4 border-white shadow-xl"
              alt={poem.author_name}
            />
            <p className="mt-4 font-serif italic text-zinc-400">
              Menulis adalah cara terbaik <br /> untuk mengabadikan apa yang tak bisa diucapkan.
            </p>
          </div>

          <div className="flex items-center justify-center gap-6">
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300">Dibaca</span>
              <span className="font-serif italic text-xl text-zinc-600">{poem.views}x</span>
            </div>
            <div className="w-px h-8 bg-zinc-100"></div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300">Waktu</span>
              <span className="font-serif italic text-xl text-zinc-600">
                {new Date(poem.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </footer>

      </main>

      {/* AMBIENCE BUTTON (Hanya Visual Dekoratif) */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2">
        <Button className="bg-white/80 backdrop-blur-md border border-zinc-200 text-zinc-900 rounded-full px-6 py-6 shadow-2xl hover:bg-amber-50 group">
          <Music className="w-4 h-4 mr-3 text-amber-600 group-hover:animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest">Aktifkan Suasana</span>
        </Button>
      </div>

      {/* Custom Styles untuk Puisi */}
      <style jsx global>{`
        .poetry-content p {
          margin-bottom: 2rem;
          display: block;
        }
        .poetry-content br {
          display: block;
          content: "";
          margin-top: 1rem;
        }
      `}</style>
    </div>
  )
}
