import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Award, Download, Calendar } from "lucide-react"

// Mock certificates data
const certificates = [
  {
    id: "1",
    userName: "Ahmad Rizki",
    courseName: "Web Development Fundamental",
    certificateNumber: "CERT-2024-001",
    issuedDate: "2024-12-15",
    status: "issued",
  },
  {
    id: "2",
    userName: "Siti Nurhaliza",
    courseName: "Mobile App Development",
    certificateNumber: "CERT-2024-002",
    issuedDate: "2024-12-14",
    status: "issued",
  },
  {
    id: "3",
    userName: "Budi Santoso",
    courseName: "Digital Marketing",
    certificateNumber: "CERT-2024-003",
    issuedDate: "2024-12-13",
    status: "issued",
  },
]

export default function CertificatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl">Certificates</h1>
          <p className="text-muted-foreground">Manage course completion certificates</p>
        </div>
        <Button>
          <Award className="mr-2 h-4 w-4" />
          Issue Certificate
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Certificates</CardTitle>
          <CardDescription>List of issued certificates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-600" />
                    <h3 className="font-medium">{cert.userName}</h3>
                    <Badge variant="outline">{cert.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{cert.courseName}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Issued: {cert.issuedDate}</span>
                    <span>•</span>
                    <span>No: {cert.certificateNumber}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                  <Button variant="outline" size="sm">
                    View
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
