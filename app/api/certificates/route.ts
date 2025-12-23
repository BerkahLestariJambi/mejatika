import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get("userId")

  let certificates = db.certificates

  if (userId) {
    certificates = certificates.filter((cert) => cert.userId === userId)
  }

  return NextResponse.json(certificates)
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const newCertificate = {
      id: `cert-${Date.now()}`,
      userId: data.userId,
      courseId: data.courseId,
      certificateNumber: `CERT-${Date.now()}`,
      issuedAt: new Date(),
      pdfUrl: `/certificates/${data.userId}-${data.courseId}.pdf`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    db.certificates.push(newCertificate)

    return NextResponse.json(newCertificate)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
