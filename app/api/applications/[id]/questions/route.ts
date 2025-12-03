import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { generateQuestionResponse } from "@/lib/ai"
import { ResumeData, QuestionResponse } from "@/types/resume"
import { z } from "zod"

const questionSchema = z.object({
  question: z.string().min(1),
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { question } = questionSchema.parse(body)

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

    // Generate response with AI
    const response = await generateQuestionResponse(
      tailoredContent,
      application.jobTitle,
      application.jobDescription,
      question
    )

    // Update application with new question-response pair
    const existingQR = application.questionResponses
      ? JSON.parse(application.questionResponses)
      : []

    const newQR: QuestionResponse[] = [
      ...existingQR,
      { question, response },
    ]

    await prisma.application.update({
      where: { id: params.id },
      data: {
        questionResponses: JSON.stringify(newQR),
      },
    })

    return NextResponse.json({
      question,
      response,
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Generate question response error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate response" },
      { status: 500 }
    )
  }
}
