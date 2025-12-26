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
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Berita
          </Button>
        </Link>

        <article className="mx-auto max-w-4xl">
          <Card className="border-none shadow-xl overflow-hidden">
            <CardContent className="p-0">
              {/* Logic Gambar yang Aman agar tidak Server Exception */}
              <div className="relative w-full aspect-video bg-muted">
                {article.image ? (
                  <img
                    src={article.image}
                    alt={article.title || "Berita"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    Tidak ada gambar
                  </div>
                )}
              </div>
              
              <div className="p-6 md:p-10">
                <div className="mb-4">
                  {article.category?.name && (
                    <Badge variant="secondary">{article.category.name}</Badge>
                  )}
                </div>
                
                <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                  {article.title}
                </h1>

                <div className="flex flex-wrap gap-6 text-sm text-muted-foreground mb-8 pb-8 border-b">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {article.created_at ? new Date(article.created_at).toLocaleDateString("id-ID") : "-"}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{article.author?.name || article.user?.name || "Admin"}</span>
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <div className="whitespace-pre-line text-foreground/80 leading-relaxed">
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
