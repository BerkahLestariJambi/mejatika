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
      cache: 'no-store'
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleDetail(slug);

  if (!article) {
    notFound();
  }

  const authorName = article.user?.name || article.author?.name || "Admin MEJATIKA";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Link href="/berita">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Berita
          </Button>
        </Link>

        <article className="mx-auto max-w-4xl">
          <Card className="border-none shadow-xl overflow-hidden bg-card">
            <CardContent className="p-0">
              {/* CONTAINER GAMBAR */}
              <div className="relative w-full h-[300px] md:h-[500px] bg-muted">
                {article.image ? (
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    // Fallback jika gambar gagal dimuat dari server
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Tidak ada gambar utama
                  </div>
                )}
              </div>
              
              <div className="p-6 md:p-10">
                <div className="mb-4">
                  {article.category && (
                    <Badge variant="secondary" className="px-3 py-1">
                      {article.category.name}
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight tracking-tight">
                  {article.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8 pb-8 border-b">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    {new Date(article.created_at).toLocaleDateString("id-ID", {
                      day: "numeric", month: "long", year: "numeric"
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    <span>{authorName}</span>
                  </div>
                </div>

                {/* ISI BERITA */}
                <div className="prose prose-blue prose-lg max-w-none">
                  <div className="whitespace-pre-line leading-relaxed text-foreground/90 text-lg">
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
