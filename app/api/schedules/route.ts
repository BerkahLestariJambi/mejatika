import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit")

    const schedules = await db.getUpcomingSchedules(limit ? Number.parseInt(limit) : undefined)

    // Get course details for each schedule
    const schedulesWithCourses = await Promise.all(
      schedules.map(async (schedule) => {
        const course = await db.getCourseById(schedule.courseId)
        return {
          ...schedule,
          course,
        }
      }),
    )

    return NextResponse.json(schedulesWithCourses)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const schedule = await db.createSchedule(body)
    return NextResponse.json(schedule, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create schedule" }, { status: 500 })
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
    const schedule = await db.updateSchedule(id, body)

    if (!schedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 })
    }

    return NextResponse.json(schedule)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update schedule" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const success = await db.deleteSchedule(id)

    if (!success) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete schedule" }, { status: 500 })
  }
}
