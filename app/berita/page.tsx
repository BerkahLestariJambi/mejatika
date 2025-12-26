import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export const dynamic = "force-dynamic";

async function getNewsData() {
  const res = await fetch("https://backend.mejatika.com/api/news", {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

async function getCategoriesData() {
  // Pastikan route ini sudah publik di Laravel api.php
  const res = await fetch("https://backend.mejatika.com/api/categories", {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function BeritaPage() {
  const [news, categories] = await Promise.all([
    getNewsData(),
    getCategoriesData()
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Berita & Artikel</h1>
          <p className="text-muted-foreground">Berita terbaru dari MEJATIKA</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="grid gap-6">
              {news.length > 0 ? (
                news.map((article: any) => {
                  const category = categories.find((c: any) => c.id === article.category_id);
                  // Gunakan slug, jika tidak ada fallback ke ID agar tidak 404
                  const slugPath = article.slug || article.id;

                  return (
                    <Card key={article.id} className="overflow-hidden border-none shadow-md">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/3 relative h-48 md:h-auto">
                            <img
                              src={article.image || "/placeholder.svg"}
                              alt={article.title}
                              className="w-full h-full object-cover"
                            />
                            {category && (
                              <Badge className="absolute top-3 left-3">{category.name}</Badge>
                            )}
                          </div>
                          <div className="md:w-2/3 p-6">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                              <Calendar className="w-4 h-4" />
                              {article.created_at ? new Date(article.created_at).toLocaleDateString("id-ID", {
                                day: "numeric", month: "long", year: "numeric"
                              }) : "-"}
                            </div>
                            <h2 className="text-xl font-bold mb-3 line-clamp-2">{article.title}</h2>
                            <p className="text-muted-foreground mb-4 line-clamp-3">{article.content}</p>
                            <Link href={`/berita/${slugPath}`}>
                              <Button variant="outline">
                                Baca Selengkapnya <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="text-center py-20 border rounded-lg">
                  <p className="text-muted-foreground">Belum ada berita yang tersedia.</p>
                </div>
              )}
            </div>
          </div>

          <aside className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Kategori Berita</h3>
                <div className="space-y-1">
                  {categories.map((category: any) => (
                    <button key={category.id} className="w-full text-left px-3 py-2 rounded-md hover:bg-muted text-sm transition-colors">
                      {category.name}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  )
}
