import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, User, DollarSign } from "lucide-react"
import { db } from "@/lib/db"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default async function KursusPage() {
  const courses = await db.getCourses()

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Program Kursus</h1>
          <p className="text-muted-foreground">Pilih kursus yang sesuai dengan kebutuhan Anda</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <CardContent className="p-0">
                <img src={course.image || "/placeholder.svg"} alt={course.title} className="h-48 w-full object-cover" />
                <div className="p-6">
                  <Badge className="mb-3">Popular</Badge>
                  <h3 className="mb-2 text-xl font-bold text-balance">{course.title}</h3>
                  <p className="mb-4 text-sm text-muted-foreground text-pretty">{course.description}</p>
                  <div className="mb-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{course.instructor}</span>
                    </div>
                    <div className="flex items-center gap-2 font-semibold">
                      <DollarSign className="h-4 w-4" />
                      <span>Rp {course.price.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                  <Button className="w-full">Daftar Sekarang</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
