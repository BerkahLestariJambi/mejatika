import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

// Fungsi untuk mengambil data dari Backend Laravel
async function getNewsData() {
  const res = await fetch("https://backend.mejatika.com/api/news", {
    next: { revalidate: 60 }, // Cache diperbarui setiap 60 detik
  });
  if (!res.ok) return [];
  return res.json();
}

async function getCategoriesData() {
  // Karena rute categories di backend Anda diproteksi (Admin), 
  // pastikan API categories bisa diakses publik jika ingin ditampilkan di sini.
  // Jika masih diproteksi, rute ini mungkin akan return 401.
  const res = await fetch("https://backend.mejatika.com/api/categories", {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function BeritaPage() {
  // Ambil data secara paralel
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
          <p className="text-muted-foreground">Berita terbaru dan informasi dari MEJATIKA</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="grid gap-6">
              {news.length > 0 ? (
                news.map((article: any) => {
                  // Sesuaikan properti sesuai response JSON Laravel (category_id, bukan categoryId)
                  const category = categories.find((c: any) => c.id === article.category_id);
                  
                  return (
                    <Card key={article.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/3 relative">
                            <img
                              // Image sekarang sudah full URL dari Laravel asset()
                              src={article.image || "/placeholder.svg"}
                              alt={article.title}
                              className="w-full h-[200px] md:h-full object-cover"
                            />
                            {category && (
                              <Badge className="absolute top-3 left-3">{category.name}</Badge>
                            )}
                          </div>
                          <div className="md:w-2/3 p-6">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                              <Calendar className="w-4 h-4" />
                              {/* Laravel menggunakan created_at atau updated_at */}
                              {new Date(article.created_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </div>
                            <h2 className="text-xl font-bold mb-3 text-balance">{article.title}</h2>
                            {/* Menampilkan potongan isi berita */}
                            <p className="text-muted-foreground mb-4 text-pretty line-clamp-3">
                              {article.content}
                            </p>
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
                  );
                })
              ) : (
                <div className="text-center py-20">
                  <p className="text-muted-foreground">Belum ada berita yang diterbitkan.</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Kategori</h3>
                <div className="space-y-2">
                  {categories.map((category: any) => (
                    <button
                      key={category.id}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      {category.name}
                    </button>
                  ))}
                  {categories.length === 0 && <p className="text-xs text-muted-foreground">Tidak ada kategori.</p>}
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
