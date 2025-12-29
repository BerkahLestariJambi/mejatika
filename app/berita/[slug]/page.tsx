import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, ArrowLeft, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic";

async function getArticleDetail(slug: string) {
  try {
    const res = await fetch(`https://backend.mejatika.com/api/news/${slug}`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const article = await getArticleDetail(resolvedParams.slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Navigation />
      
      {/* HEADER DEKORATIF (Opsional, agar senada dengan halaman dinamis lainnya) */}
      <div className="h-24 bg-amber-500 w-full relative overflow-hidden">
         <div className="absolute inset-0 opacity-10 pointer-events-none" 
              style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/batik-fractal.png')` }} />
      </div>

      <main className="flex-grow container mx-auto px-4 -mt-12 relative z-10 pb-20">
        <div className="max-w-4xl mx-auto">
          
          {/* TOMBOL KEMBALI */}
          <Link href="/berita">
            <Button variant="outline" className="mb-6 bg-white/80 backdrop-blur shadow-sm border-amber-200 hover:bg-amber-50 hover:text-amber-600 rounded-full transition-all group">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
              KEMBALI KE BERITA
            </Button>
          </Link>

          <article>
            <Card className="border-none shadow-2xl overflow-hidden bg-white rounded-[2.5rem]">
              <CardContent className="p-0">
                
                {/* --- HEADER KONTEN --- */}
                <div className="p-8 md:p-12 pb-0">
                  <div className="flex items-center gap-3 mb-6">
                    <Badge className="bg-amber-500 hover:bg-amber-600 px-4 py-1.5 uppercase tracking-widest text-[10px] font-black border-none shadow-sm">
                      {article.category?.name || "UMUM"}
                    </Badge>
                    <div className="h-[2px] w-12 bg-amber-200 rounded-full" />
                  </div>
                  
                  <h1 className="text-3xl md:text-5xl font-black mb-8 leading-[1.1] tracking-tighter text-zinc-900 uppercase italic">
                    {article.title}
                  </h1>

                  <div className="flex flex-wrap gap-6 text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-10 pb-8 border-b border-zinc-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-500" />
                      <span>
                        {article.created_at ? new Date(article.created_at).toLocaleDateString("id-ID", {
                          day: 'numeric', month: 'long', year: 'numeric'
                        }) : "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-amber-500" />
                      <span>
                        {article.author?.name || article.user?.name || "ADMIN MEJATIKA"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* --- GAMBAR UTAMA --- */}
                <div className="px-8 md:px-12"> 
                  <div className="relative w-full aspect-video bg-zinc-100 rounded-3xl overflow-hidden shadow-inner ring-1 ring-zinc-100">
                    {article.image ? (
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300">
                        <BookOpen className="w-12 h-12 mb-2 opacity-20" />
                        <span className="text-xs font-bold uppercase tracking-widest">No Image Preview</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* --- ISI BERITA --- */}
                <div className="p-8 md:p-12 md:pt-10">
                  <div className="prose prose-zinc prose-lg max-w-none">
                    <div className="whitespace-pre-line text-zinc-700 leading-relaxed text-lg font-medium">
                      {article.content}
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </article>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
