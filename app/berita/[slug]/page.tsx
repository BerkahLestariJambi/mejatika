import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { notFound } from "next/navigation"

// Fungsi Fetch Detail Berita dari Laravel
async function getArticleDetail(slug: string) {
  try {
    const res = await fetch(`https://backend.mejatika.com/api/news/${slug}`, {
      next: { revalidate: 60 }, // Cache detail selama 60 detik
    });

    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Fetch Error:", error);
    return null;
  }
}

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
  // Ambil data artikel dari API
  const article = await getArticleDetail(params.slug);

  // Jika artikel tidak ditemukan di backend, tampilkan halaman 404
  if (!article) {
    notFound();
  }

  // Catatan: Karena di Laravel NewsController Anda sudah menggunakan ->load('category'),
  // data kategori biasanya sudah ada di dalam objek 'article.category'
  const category = article.category;
  
  // Jika author dikirim dari backend, sesuaikan namanya (biasanya article.user atau article.author)
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
          <Card className="shadow-lg border-none">
            <CardContent className="p-0">
              <img
                // Gunakan URL gambar dari backend yang sudah lengkap (asset URL)
                src={article.image || "/placeholder.svg"}
                alt={article.title}
                className="w-full h-[300px] md:h-[500px] object-cover rounded-t-lg"
              />
              <div className="p-6 md:p-10">
                <div className="mb-4">
                  {category && (
                    <Badge variant="secondary" className="px-3 py-1">
                      {category.name}
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight text-balance">
                  {article.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8 pb-8 border-b">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    {new Date(article.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    <span>{authorName}</span>
                  </div>
                </div>

                <div className="prose prose-blue prose-lg max-w-none">
                  {/* Menampilkan isi berita dengan format line break yang terjaga */}
                  <div className="whitespace-pre-line leading-relaxed text-foreground/90">
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
