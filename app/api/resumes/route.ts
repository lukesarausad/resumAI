import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { parsePDF } from "@/lib/pdf-parser"
import { enhanceResumeWithAI } from "@/lib/openai"

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const formData = await request.formData()

    const file = formData.get("file") as File
    const title = formData.get("title") as string

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      )
    }

    // Validate file size (5MB limit)
    const maxSize = parseInt(process.env.MAX_RESUME_SIZE_MB || "5") * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size must be less than ${process.env.MAX_RESUME_SIZE_MB || "5"}MB` },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Parse PDF to text
    const pdfText = await parsePDF(buffer)

    // Use AI to structure the resume
    const resumeData = await enhanceResumeWithAI(pdfText)

    // Save to database
    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        title: title || file.name.replace(".pdf", ""),
        originalContent: JSON.stringify(resumeData),
      },
    })

    return NextResponse.json({
      id: resume.id,
      title: resume.title,
      content: resumeData,
    })
  } catch (error: any) {
    console.error("Resume upload error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to upload resume" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const user = await requireAuth()

    const resumes = await prisma.resume.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    })

    return NextResponse.json(
      resumes.map(resume => ({
        id: resume.id,
        title: resume.title,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
        applicationsCount: resume._count.applications,
      }))
    )
  } catch (error: any) {
    console.error("Get resumes error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch resumes" },
      { status: 500 }
    )
  }
}
