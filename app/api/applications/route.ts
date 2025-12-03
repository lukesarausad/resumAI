import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { tailorResume } from "@/lib/openai"
import { generateLatexContent } from "@/lib/latex"
import { ResumeData } from "@/types/resume"
import { z } from "zod"

const createApplicationSchema = z.object({
  resumeId: z.string(),
  jobTitle: z.string().min(1),
  jobDescription: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { resumeId, jobTitle, jobDescription } = createApplicationSchema.parse(body)

    // Fetch the resume
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: user.id,
      },
    })

    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      )
    }

    const originalContent: ResumeData = JSON.parse(resume.originalContent)

    // Tailor the resume with AI
    const tailoredContent = await tailorResume(
      originalContent,
      jobTitle,
      jobDescription
    )

    // Generate LaTeX
    const latexContent = generateLatexContent(tailoredContent)

    // Create application
    const application = await prisma.application.create({
      data: {
        resumeId,
        jobTitle,
        jobDescription,
        tailoredContent: JSON.stringify(tailoredContent),
        tailoredLatex: latexContent,
        questionResponses: null,
      },
    })

    return NextResponse.json({
      id: application.id,
      jobTitle: application.jobTitle,
      tailoredContent,
      tailoredLatex: latexContent,
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Create application error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create application" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const resumeId = searchParams.get("resumeId")

    const where: any = {}

    // If resumeId is provided, filter by it
    if (resumeId) {
      // Verify the resume belongs to the user
      const resume = await prisma.resume.findFirst({
        where: {
          id: resumeId,
          userId: user.id,
        },
      })

      if (!resume) {
        return NextResponse.json(
          { error: "Resume not found" },
          { status: 404 }
        )
      }

      where.resumeId = resumeId
    } else {
      // Get all applications for user's resumes
      const userResumes = await prisma.resume.findMany({
        where: { userId: user.id },
        select: { id: true },
      })

      where.resumeId = {
        in: userResumes.map((r) => r.id),
      }
    }

    const applications = await prisma.application.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        resume: {
          select: {
            title: true,
          },
        },
      },
    })

    return NextResponse.json(
      applications.map((app) => ({
        id: app.id,
        jobTitle: app.jobTitle,
        resumeTitle: app.resume.title,
        createdAt: app.createdAt,
      }))
    )
  } catch (error: any) {
    console.error("Get applications error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch applications" },
      { status: 500 }
    )
  }
}
