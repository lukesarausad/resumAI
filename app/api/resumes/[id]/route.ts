import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    const resume = await prisma.resume.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        applications: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: resume.id,
      title: resume.title,
      content: JSON.parse(resume.originalContent),
      applications: resume.applications.map(app => ({
        id: app.id,
        jobTitle: app.jobTitle,
        createdAt: app.createdAt,
      })),
    })
  } catch (error: any) {
    console.error("Get resume error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch resume" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    const resume = await prisma.resume.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      )
    }

    await prisma.resume.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Delete resume error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete resume" },
      { status: 500 }
    )
  }
}
