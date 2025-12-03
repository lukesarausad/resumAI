import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { ResumeData } from "@/types/resume"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    const application = await prisma.application.findFirst({
      where: {
        id: params.id,
      },
      include: {
        resume: true,
      },
    })

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      )
    }

    // Verify ownership
    if (application.resume.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    const tailoredContent: ResumeData = JSON.parse(application.tailoredContent)
    const questionResponses = application.questionResponses
      ? JSON.parse(application.questionResponses)
      : []

    return NextResponse.json({
      id: application.id,
      jobTitle: application.jobTitle,
      jobDescription: application.jobDescription,
      tailoredContent,
      tailoredLatex: application.tailoredLatex,
      questionResponses,
      resumeTitle: application.resume.title,
      createdAt: application.createdAt,
    })
  } catch (error: any) {
    console.error("Get application error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch application" },
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

    const application = await prisma.application.findFirst({
      where: {
        id: params.id,
      },
      include: {
        resume: true,
      },
    })

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      )
    }

    // Verify ownership
    if (application.resume.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    await prisma.application.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Delete application error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete application" },
      { status: 500 }
    )
  }
}
