import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const registrations = await db.getRegistrations()

    // Get user, course details for each registration
    const registrationsWithDetails = await Promise.all(
      registrations.map(async (registration) => {
        const user = await db.getUserById(registration.userId)
        const course = await db.getCourseById(registration.courseId)
        const schedule = registration.scheduleId ? await db.getScheduleById(registration.scheduleId) : null

        return {
          ...registration,
          user,
          course,
          schedule,
        }
      }),
    )

    return NextResponse.json(registrationsWithDetails)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const registration = await db.createRegistration(body)
    return NextResponse.json(registration, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create registration" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const body = await request.json()
    const registration = await db.updateRegistration(id, body)

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    return NextResponse.json(registration)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update registration" }, { status: 500 })
  }
}
