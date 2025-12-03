import { GoogleGenerativeAI } from "@google/generative-ai"
import { ResumeData, QuestionResponse } from "@/types/resume"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

// Helper function to extract JSON from markdown code blocks
function extractJSON(text: string): string {
  // Remove markdown code blocks if present - try multiple patterns
  let cleaned = text.trim()

  // Try to match ```json ... ``` format
  let match = cleaned.match(/```json\s*([\s\S]*?)\s*```/)
  if (match) {
    return match[1].trim()
  }

  // Try to match ``` ... ``` format
  match = cleaned.match(/```\s*([\s\S]*?)\s*```/)
  if (match) {
    return match[1].trim()
  }

  // If no code blocks, return as is
  return cleaned
}

export async function enhanceResumeWithAI(
  pdfText: string
): Promise<ResumeData> {
  const prompt = `You are a resume parser. Extract and structure the following resume into JSON format.

Resume text:
${pdfText}

Return ONLY a valid JSON object with this exact structure (no markdown, no explanations):
{
  "contact": {
    "name": "string",
    "phone": "string or null",
    "email": "string",
    "linkedin": "string or null",
    "github": "string or null",
    "website": "string or null"
  },
  "education": [
    {
      "school": "string",
      "degree": "string",
      "location": "string",
      "date": "string",
      "gpa": "string or null",
      "coursework": ["string"] or null
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
      "date": "string or null",
      "bullets": ["string"]
    }
  ],
  "skills": {
    "Category Name": ["skill1", "skill2"]
  }
}

Extract all information accurately. If a field is not found, use null for optional fields or empty arrays. Return ONLY the JSON object.`

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
      }
    })

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    if (!text) {
      throw new Error("No response from Gemini")
    }

    // Extract JSON and parse
    const jsonText = extractJSON(text)
    return JSON.parse(jsonText)
  } catch (error) {
    console.error("Gemini parsing error:", error)
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
Return ONLY a valid JSON object matching the original resume data structure exactly. No markdown formatting, no explanations.
Ensure bullet points are concise, impactful, and action-oriented.`

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      }
    })

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    if (!text) {
      throw new Error("No response from Gemini")
    }

    // Extract JSON and parse
    const jsonText = extractJSON(text)
    return JSON.parse(jsonText)
  } catch (error) {
    console.error("Gemini tailoring error:", error)
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
A well-structured, professional response. Return only the response text, no formatting or explanations.`

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 1024,
      }
    })

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    if (!text) {
      throw new Error("No response from Gemini")
    }

    return text.trim()
  } catch (error) {
    console.error("Gemini question response error:", error)
    throw new Error("Failed to generate question response")
  }
}
