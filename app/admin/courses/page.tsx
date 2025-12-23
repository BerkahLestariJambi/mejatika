import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"
import { db } from "@/lib/db"

export default async function CoursesManagementPage() {
  const courses = await db.getCourses()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl">Course Management</h1>
          <p className="text-muted-foreground">Create and manage courses</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id}>
            <CardContent className="p-0">
              <img src={course.image || "/placeholder.svg"} alt={course.title} className="h-48 w-full object-cover" />
              <div className="p-6">
                <h3 className="mb-2 font-bold text-balance">{course.title}</h3>
                <p className="mb-4 text-sm text-muted-foreground text-pretty">{course.description}</p>
                <div className="mb-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Durasi:</span>
                    <span className="font-medium">{course.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Instruktur:</span>
                    <span className="font-medium">{course.instructor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Harga:</span>
                    <span className="font-medium">Rp {course.price.toLocaleString("id-ID")}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant={course.status === "active" ? "default" : "secondary"}>{course.status}</Badge>
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
