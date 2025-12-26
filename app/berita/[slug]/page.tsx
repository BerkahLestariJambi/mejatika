import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { notFound } from "next/navigation"

// MEMAKSA Next.js untuk selalu mengambil data terbaru (bukan static cache)
export const dynamic = "force-dynamic";

async function getArticleDetail(slug: string) {
  try {
    const res = await fetch(`https://backend.mejatika.com/api/news/${slug}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Fetch Error:", error);
    return null;
  }
}

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const article = await getArticleDetail(slug);

  if (!article) {
    notFound();
  }

  const category = article.category;
  const authorName = article.author?.name || article.user?.name || "Admin MEJATIKA";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Link href="/berita">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Berita
          </Button>
        </Link>

        <article className="mx-auto max-w-4xl">
          <Card className="shadow-lg border-none overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-video relative w-full">
                <img
                  src={article.image || "/placeholder.svg"}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 md:p-10">
                {category && (
                  <Badge variant="secondary" className="px-3 py-1 text-sm mb-4">
                    {category.name}
                  </Badge>
                )}

                <h1 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight tracking-tight text-balance">
                  {article.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8 pb-8 border-b">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    {article.created_at
                      ? new Date(article.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "-"}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    <span>{authorName}</span>
                  </div>
                </div>

                <div className="prose prose-blue prose-lg max-w-none">
                  {typeof article.content === "string" ? (
                    <div className="whitespace-pre-line leading-relaxed text-foreground/80 text-lg">
                      {article.content}
                    </div>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: article.content }} />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </article>
      </main>
      <Footer />
    </div>
  );
}
