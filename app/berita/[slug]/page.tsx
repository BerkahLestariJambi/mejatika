import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, ArrowLeft } from "lucide-react"
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
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Link href="/berita">
          <Button variant="ghost" className="mb-6 hover:bg-primary/10 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Berita
          </Button>
        </Link>

        <article className="mx-auto max-w-4xl">
          <Card className="border-none shadow-xl overflow-hidden bg-card">
            <CardContent className="p-0 pt-8 md:pt-10"> {/* Memberi jarak ke atas sebelum gambar */}
              
              {/* --- BAGIAN GAMBAR DENGAN BATAS KIRI-KANAN --- */}
              <div className="px-6 md:px-12"> 
                <div className="relative w-full aspect-video bg-muted rounded-2xl overflow-hidden shadow-lg ring-1 ring-border">
                  {article.image ? (
                    <img
                      src={article.image}
                      alt={article.title || "Berita"}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      Tidak ada gambar tersedia
                    </div>
                  )}
                </div>
              </div>
              {/* ------------------------------------------- */}
              
              <div className="p-6 md:p-12">
                <div className="mb-6">
                  {article.category?.name && (
                    <Badge variant="secondary" className="px-3 py-1 uppercase tracking-wider text-xs font-semibold">
                      {article.category.name}
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-3xl md:text-5xl font-extrabold mb-8 leading-tight tracking-tight text-foreground">
                  {article.title}
                </h1>

                <div className="flex flex-wrap gap-6 text-sm text-muted-foreground mb-10 pb-8 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium">
                      {article.created_at ? new Date(article.created_at).toLocaleDateString("id-ID", {
                        day: 'numeric', month: 'long', year: 'numeric'
                      }) : "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium">
                      {article.author?.name || article.user?.name || "Admin MEJATIKA"}
                    </span>
                  </div>
                </div>

                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <div className="whitespace-pre-line text-foreground/80 leading-relaxed text-lg md:text-xl">
                    {article.content}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </article>
      </main>
      
      <Footer />
    </div>
  )
}
