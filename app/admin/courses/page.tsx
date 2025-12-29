import { db } from "@/lib/db"
import { CourseClient } from "@/components/courses/course-client"

export default async function CoursesManagementPage() {
  const initialCourses = await db.getCourses()

  return (
    <div className="space-y-8 p-6 bg-zinc-50/50 min-h-screen">
      <CourseClient initialData={initialCourses} />
    </div>
  )
}
