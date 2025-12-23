import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { notFound } from "next/navigation"

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
  const article = await db.getNewsBySlug(params.slug)

  if (!article) {
    notFound()
  }

  const category = await db.getNewsCategoryById(article.categoryId)
  const author = await db.getUserById(article.authorId)

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
          <Card>
            <CardContent className="p-0">
              <img
                src={article.image || "/placeholder.svg"}
                alt={article.title}
                className="w-full h-[300px] md:h-[400px] object-cover rounded-t-lg"
              />
              <div className="p-6 md:p-8">
                <div className="mb-4">
                  <Badge>{category?.name}</Badge>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-balance">{article.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(article.publishedAt!).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {author?.name}
                  </div>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-lg text-muted-foreground mb-6">{article.excerpt}</p>
                  <div className="whitespace-pre-line leading-relaxed">{article.content}</div>
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
