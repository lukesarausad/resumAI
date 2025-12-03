import OpenAI from "openai"
import { ResumeData, QuestionResponse } from "@/types/resume"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function enhanceResumeWithAI(
  pdfText: string
): Promise<ResumeData> {
  const prompt = `You are a resume parser. Extract and structure the following resume into JSON format.

Resume text:
${pdfText}

Return a JSON object with this exact structure:
{
  "contact": {
    "name": "string",
    "phone": "string (optional)",
    "email": "string",
    "linkedin": "string (optional)",
    "github": "string (optional)",
    "website": "string (optional)"
  },
  "education": [
    {
      "school": "string",
      "degree": "string",
      "location": "string",
      "date": "string",
      "gpa": "string (optional)",
      "coursework": ["string"] (optional)
    }
  ],
  "experience": [
    {
      "company": "string",
      "position": "string",
      "location": "string",
      "date": "string",
      "bullets": ["string"]
    }
  ],
  "projects": [
    {
      "name": "string",
      "technologies": ["string"],
      "date": "string (optional)",
      "bullets": ["string"]
    }
  ],
  "skills": {
    "Category Name": ["skill1", "skill2"]
  }
}

Extract all information accurately. If a field is not found, use null for optional fields or empty arrays.`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional resume parser. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    })

    const content = completion.choices[0].message.content
    if (!content) {
      throw new Error("No response from OpenAI")
    }

    return JSON.parse(content)
  } catch (error) {
    console.error("OpenAI parsing error:", error)
    throw new Error("Failed to parse resume with AI")
  }
}

export async function tailorResume(
  originalResume: ResumeData,
  jobTitle: string,
  jobDescription: string
): Promise<ResumeData> {
  const prompt = `You are a professional resume writer specializing in ATS optimization.

Input:
- Original resume (JSON format): ${JSON.stringify(originalResume, null, 2)}
- Job title: ${jobTitle}
- Job description: ${jobDescription}

Task:
Tailor the resume to maximize relevance for this specific job by:
1. Reordering experience bullet points (most relevant first)
2. Emphasizing metrics and achievements relevant to the role
3. Adjusting skill prominence to match job requirements
4. Incorporating keywords from job description naturally
5. Maintaining truthfulness (no fabrication)

Output:
Valid JSON matching the resume data structure exactly.
Ensure bullet points are concise, impactful, and action-oriented.`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional resume writer. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    })

    const content = completion.choices[0].message.content
    if (!content) {
      throw new Error("No response from OpenAI")
    }

    return JSON.parse(content)
  } catch (error) {
    console.error("OpenAI tailoring error:", error)
    throw new Error("Failed to tailor resume with AI")
  }
}

export async function generateQuestionResponse(
  tailoredResume: ResumeData,
  jobTitle: string,
  jobDescription: string,
  question: string
): Promise<string> {
  const prompt = `You are helping a job applicant answer application questions professionally.

Input:
- Tailored resume content: ${JSON.stringify(tailoredResume, null, 2)}
- Job title: ${jobTitle}
- Job description: ${jobDescription}
- Application question: ${question}

Task:
Generate a compelling response that:
1. References specific experiences from the resume
2. Demonstrates fit for the role
3. Shows genuine enthusiasm
4. Stays within 150-300 words (unless specified)
5. Uses concrete examples, not generic statements

Output:
A well-structured, professional response.`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional career coach helping write compelling application responses.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 500,
    })

    const content = completion.choices[0].message.content
    if (!content) {
      throw new Error("No response from OpenAI")
    }

    return content.trim()
  } catch (error) {
    console.error("OpenAI question response error:", error)
    throw new Error("Failed to generate question response")
  }
}
