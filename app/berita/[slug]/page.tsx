import { notFound } from "next/navigation";

export const dynamic = "force-dynamic"; // Memastikan data selalu segar

async function getArticleDetail(slug: string) {
  const res = await fetch(`https://backend.mejatika.com/api/news/${slug}`, {
    cache: 'no-store'
  });
  if (!res.ok) return null;
  return res.json();
}

// Params di Next.js 15+ adalah Promise
export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleDetail(slug);

  if (!article) {
    notFound(); // Ini yang memicu tampilan 404 jika data tidak ada di Laravel
  }

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-4xl font-bold">{article.title}</h1>
      <div className="mt-4 prose max-w-none">
        {article.content}
      </div>
    </main>
  );
}
