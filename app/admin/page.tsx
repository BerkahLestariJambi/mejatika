import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, GraduationCap, ImageIcon, Settings } from "lucide-react"

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Users",
      value: "342",
      description: "Active users",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "News Articles",
      value: "128",
      description: "Published articles",
      icon: FileText,
      color: "text-green-600",
    },
    {
      title: "Active Courses",
      value: "24",
      description: "Running courses",
      icon: GraduationCap,
      color: "text-purple-600",
    },
    {
      title: "Gallery Items",
      value: "89",
      description: "Photos uploaded",
      icon: ImageIcon,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold lg:text-3xl">Dashboard</h1>
        <p className="text-muted-foreground">Selamat datang di panel admin MEJATIKA</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest activities in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New user registered</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">News article published</p>
                  <p className="text-xs text-muted-foreground">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Course enrollment</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <button className="flex items-center gap-2 rounded-lg border p-3 text-left hover:bg-accent">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">Create News Article</span>
              </button>
              <button className="flex items-center gap-2 rounded-lg border p-3 text-left hover:bg-accent">
                <GraduationCap className="h-4 w-4" />
                <span className="text-sm font-medium">Add New Course</span>
              </button>
              <button className="flex items-center gap-2 rounded-lg border p-3 text-left hover:bg-accent">
                <Settings className="h-4 w-4" />
                <span className="text-sm font-medium">Update Settings</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
