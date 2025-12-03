import pdf from "pdf-parse"
import { ResumeData } from "@/types/resume"

export async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer)
    return data.text
  } catch (error) {
    console.error("PDF parsing error:", error)
    throw new Error("Failed to parse PDF")
  }
}

export function parseResumeText(text: string): Partial<ResumeData> {
  // Basic parsing logic - extract sections and basic information
  // This is a simplified version - in production, you'd use more sophisticated parsing

  const lines = text.split("\n").filter(line => line.trim())

  // Try to extract email
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/
  const emailMatch = text.match(emailRegex)

  // Try to extract phone
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/
  const phoneMatch = text.match(phoneRegex)

  // Try to extract LinkedIn
  const linkedinRegex = /linkedin\.com\/in\/([a-zA-Z0-9-]+)/
  const linkedinMatch = text.match(linkedinRegex)

  // Try to extract GitHub
  const githubRegex = /github\.com\/([a-zA-Z0-9-]+)/
  const githubMatch = text.match(githubRegex)

  return {
    contact: {
      name: lines[0] || "Unknown",
      email: emailMatch ? emailMatch[1] : "",
      phone: phoneMatch ? phoneMatch[0] : undefined,
      linkedin: linkedinMatch ? linkedinMatch[0] : undefined,
      github: githubMatch ? githubMatch[0] : undefined,
    },
    education: [],
    experience: [],
    projects: [],
    skills: {},
  }
}

export async function parseResume(buffer: Buffer): Promise<Partial<ResumeData>> {
  const text = await parsePDF(buffer)
  return parseResumeText(text)
}
