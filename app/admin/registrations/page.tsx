import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

export default function RegistrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold lg:text-3xl">Course Registrations</h1>
        <p className="text-muted-foreground">Manage student course registrations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registration List</CardTitle>
          <CardDescription>View and manage student enrollments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No registrations yet</p>
            <p className="text-sm text-muted-foreground">Student registrations will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
