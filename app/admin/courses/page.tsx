import { CourseClient } from "@/components/courses/course-client"

async function getCourses() {
  try {
    const res = await fetch("https://backend.mejatika.com/api/courses", {
      cache: "no-store", // Penting agar data selalu fresh
      headers: { "Accept": "application/json" }
    })
    const json = await res.json()
    
    // Laravel sering membungkus data: { data: [...] }
    return Array.isArray(json) ? json : json.data || []
  } catch (error) {
    console.error("Fetch error:", error)
    return []
  }
}

export default async function CoursesManagementPage() {
  const initialCourses = await getCourses()

  return (
    <div className="space-y-8 p-6 bg-zinc-50/50 min-h-screen">
      {/* Jika initialCourses kosong, kita tetap kirim array kosong */}
      <CourseClient initialData={initialCourses} />
    </div>
  )
}
