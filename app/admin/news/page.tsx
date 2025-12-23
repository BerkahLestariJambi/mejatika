import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"
import { db } from "@/lib/db"

export default async function NewsManagementPage() {
  const news = await db.getNews()
  const categories = await db.getNewsCategories()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl">News Management</h1>
          <p className="text-muted-foreground">Create and manage news articles</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Article
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Articles</CardTitle>
          <CardDescription>Manage your news articles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {news.map((article) => {
              const category = categories.find((c) => c.id === article.categoryId)
              return (
                <div key={article.id} className="flex items-start gap-4 border-b pb-4 last:border-0">
                  <img
                    src={article.image || "/placeholder.svg"}
                    alt={article.title}
                    className="h-20 w-32 rounded object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-balance">{article.title}</h3>
                        <p className="text-sm text-muted-foreground">{article.excerpt}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="outline">{category?.name}</Badge>
                          <Badge variant={article.status === "published" ? "default" : "secondary"}>
                            {article.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(article.publishedAt!).toLocaleDateString("id-ID")}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
