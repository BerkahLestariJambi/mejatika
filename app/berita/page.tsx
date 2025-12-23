import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ArrowRight } from "lucide-react"
import { db } from "@/lib/db"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default async function BeritaPage() {
  const news = await db.getNews()
  const categories = await db.getNewsCategories()

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Berita & Artikel</h1>
          <p className="text-muted-foreground">Berita terbaru dan informasi dari MEJATIKA</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="grid gap-6">
              {news.map((article) => {
                const category = categories.find((c) => c.id === article.categoryId)
                return (
                  <Card key={article.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3 relative">
                          <img
                            src={article.image || "/placeholder.svg"}
                            alt={article.title}
                            className="w-full h-[200px] md:h-full object-cover"
                          />
                          <Badge className="absolute top-3 left-3">{category?.name}</Badge>
                        </div>
                        <div className="md:w-2/3 p-6">
                          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                            <Calendar className="w-4 h-4" />
                            {new Date(article.publishedAt!).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </div>
                          <h2 className="text-xl font-bold mb-3 text-balance">{article.title}</h2>
                          <p className="text-muted-foreground mb-4 text-pretty">{article.excerpt}</p>
                          <Link href={`/berita/${article.slug}`}>
                            <Button>
                              Baca Selengkapnya
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Kategori</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
