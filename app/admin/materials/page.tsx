import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FileText } from "lucide-react"

export default function MaterialsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl">Course Materials</h1>
          <p className="text-muted-foreground">Manage learning materials</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Material
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Materials Library</CardTitle>
          <CardDescription>Upload and organize course content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No materials uploaded yet</p>
            <p className="text-sm text-muted-foreground">Start adding course materials</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
