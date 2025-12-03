import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { compileLatexToPDF } from "@/lib/latex-compiler"

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

    if (!application.tailoredLatex) {
      return NextResponse.json(
        { error: "No LaTeX content available" },
        { status: 400 }
      )
    }

    // Compile LaTeX to PDF
    const pdfBuffer = await compileLatexToPDF(application.tailoredLatex)

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${application.jobTitle.replace(/[^a-zA-Z0-9]/g, "_")}_resume.pdf"`,
      },
    })
  } catch (error: any) {
    console.error("PDF generation error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate PDF" },
      { status: 500 }
    )
  }
}
