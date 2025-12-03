import { ResumeData } from "@/types/resume"
import fs from "fs/promises"
import path from "path"

// Escape special LaTeX characters
export function escapeLatex(text: string): string {
  if (!text) return ""

  const replacements: Record<string, string> = {
    "&": "\\&",
    "%": "\\%",
    "$": "\\$",
    "#": "\\#",
    "_": "\\_",
    "{": "\\{",
    "}": "\\}",
    "~": "\\textasciitilde{}",
    "^": "\\textasciicircum{}",
    "\\": "\\textbackslash{}",
  }

  return text.replace(/[&%$#_{}~^\\]/g, (match) => replacements[match] || match)
}

export function generateLatexContent(resumeData: ResumeData): string {
  const { contact, education, experience, projects, skills } = resumeData

  let latex = ""

  // Header with contact info
  latex += "\\begin{center}\n"
  latex += `    \\textbf{\\Huge \\scshape ${escapeLatex(contact.name)}} \\\\ \\vspace{1pt}\n`
  latex += "    \\small "

  const contactParts = []
  if (contact.phone) contactParts.push(escapeLatex(contact.phone))
  if (contact.email) contactParts.push(`\\href{mailto:${contact.email}}{\\underline{${escapeLatex(contact.email)}}}`)
  if (contact.linkedin) contactParts.push(`\\href{https://${contact.linkedin}}{\\underline{LinkedIn}}`)
  if (contact.github) contactParts.push(`\\href{https://${contact.github}}{\\underline{GitHub}}`)
  if (contact.website) contactParts.push(`\\href{https://${contact.website}}{\\underline{${escapeLatex(contact.website)}}}`)

  latex += contactParts.join(" $|$ ")
  latex += "\n\\end{center}\n\n"

  // Education Section
  if (education && education.length > 0) {
    latex += "%-----------EDUCATION-----------\n"
    latex += "\\section{Education}\n"
    latex += "  \\resumeSubHeadingListStart\n"

    education.forEach((edu) => {
      latex += "    \\resumeSubheading\n"
      latex += `      {${escapeLatex(edu.school)}}{${escapeLatex(edu.location)}}\n`
      latex += `      {${escapeLatex(edu.degree)}}{${escapeLatex(edu.date)}}\n`

      if (edu.gpa || (edu.coursework && edu.coursework.length > 0)) {
        latex += "      \\resumeItemListStart\n"
        if (edu.gpa) {
          latex += `        \\resumeItem{GPA: ${escapeLatex(edu.gpa)}}\n`
        }
        if (edu.coursework && edu.coursework.length > 0) {
          latex += `        \\resumeItem{Relevant Coursework: ${edu.coursework.map(c => escapeLatex(c)).join(", ")}}\n`
        }
        latex += "      \\resumeItemListEnd\n"
      }
    })

    latex += "  \\resumeSubHeadingListEnd\n\n"
  }

  // Experience Section
  if (experience && experience.length > 0) {
    latex += "%-----------EXPERIENCE-----------\n"
    latex += "\\section{Experience}\n"
    latex += "  \\resumeSubHeadingListStart\n"

    experience.forEach((exp) => {
      latex += "    \\resumeSubheading\n"
      latex += `      {${escapeLatex(exp.position)}}{${escapeLatex(exp.date)}}\n`
      latex += `      {${escapeLatex(exp.company)}}{${escapeLatex(exp.location)}}\n`

      if (exp.bullets && exp.bullets.length > 0) {
        latex += "      \\resumeItemListStart\n"
        exp.bullets.forEach((bullet) => {
          latex += `        \\resumeItem{${escapeLatex(bullet)}}\n`
        })
        latex += "      \\resumeItemListEnd\n"
      }
    })

    latex += "  \\resumeSubHeadingListEnd\n\n"
  }

  // Projects Section
  if (projects && projects.length > 0) {
    latex += "%-----------PROJECTS-----------\n"
    latex += "\\section{Projects}\n"
    latex += "  \\resumeSubHeadingListStart\n"

    projects.forEach((project) => {
      const projectHeader = `\\textbf{${escapeLatex(project.name)}} $|$ \\emph{${project.technologies.map(t => escapeLatex(t)).join(", ")}}`
      const projectDate = project.date ? escapeLatex(project.date) : ""

      latex += `    \\resumeProjectHeading\n`
      latex += `      {${projectHeader}}{${projectDate}}\n`

      if (project.bullets && project.bullets.length > 0) {
        latex += "      \\resumeItemListStart\n"
        project.bullets.forEach((bullet) => {
          latex += `        \\resumeItem{${escapeLatex(bullet)}}\n`
        })
        latex += "      \\resumeItemListEnd\n"
      }
    })

    latex += "  \\resumeSubHeadingListEnd\n\n"
  }

  // Skills Section
  if (skills && Object.keys(skills).length > 0) {
    latex += "%-----------TECHNICAL SKILLS-----------\n"
    latex += "\\section{Technical Skills}\n"
    latex += " \\begin{itemize}[leftmargin=0.15in, label={}]\n"
    latex += "    \\small{\\item{\n"

    const skillEntries = Object.entries(skills).map(([category, skillList]) => {
      return `     \\textbf{${escapeLatex(category)}}{: ${skillList.map(s => escapeLatex(s)).join(", ")}} \\\\`
    })

    latex += skillEntries.join("\n")
    latex += "\n    }}\n"
    latex += " \\end{itemize}\n\n"
  }

  latex += "%-------------------------------------------\n"
  latex += "\\end{document}\n"

  return latex
}

export async function generateFullLatex(resumeData: ResumeData): Promise<string> {
  const templatePath = path.join(process.cwd(), "templates", "jake-resume.tex")
  const template = await fs.readFile(templatePath, "utf-8")

  const content = generateLatexContent(resumeData)

  // Replace the content placeholder
  return template.replace("{{CONTENT}}", content)
}
