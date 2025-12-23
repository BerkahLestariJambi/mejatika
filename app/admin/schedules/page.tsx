import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Calendar } from "lucide-react"
import { db } from "@/lib/db"

export default async function SchedulesManagementPage() {
  const schedules = await db.getCourseSchedules()
  const schedulesWithCourses = await Promise.all(
    schedules.map(async (schedule) => {
      const course = await db.getCourseById(schedule.courseId)
      return { ...schedule, course }
    }),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl">Schedule Management</h1>
          <p className="text-muted-foreground">Manage course schedules</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Schedule
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Schedules</CardTitle>
          <CardDescription>Manage when courses are available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schedulesWithCourses.map((schedule) => (
              <div key={schedule.id} className="flex items-start justify-between border-b pb-4 last:border-0">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{schedule.title}</h3>
                    <p className="text-sm text-muted-foreground">{schedule.course?.title}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>
                        {new Date(schedule.startDate).toLocaleDateString("id-ID")} -{" "}
                        {new Date(schedule.endDate).toLocaleDateString("id-ID")}
                      </span>
                      <span>•</span>
                      <span>{schedule.time}</span>
                      <span>•</span>
                      <span>{schedule.location}</span>
                      <span>•</span>
                      <span>
                        {schedule.currentParticipants}/{schedule.maxParticipants} peserta
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      schedule.status === "upcoming"
                        ? "default"
                        : schedule.status === "ongoing"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {schedule.status}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
