export interface ContactInfo {
  name: string
  phone?: string
  email: string
  linkedin?: string
  github?: string
  website?: string
}

export interface Education {
  school: string
  degree: string
  location: string
  date: string
  gpa?: string
  coursework?: string[]
}

export interface Experience {
  company: string
  position: string
  location: string
  date: string
  bullets: string[]
}

export interface Project {
  name: string
  technologies: string[]
  date?: string
  bullets: string[]
}

export interface Skills {
  [category: string]: string[]
}

export interface ResumeData {
  contact: ContactInfo
  education: Education[]
  experience: Experience[]
  projects?: Project[]
  skills: Skills
}

export interface QuestionResponse {
  question: string
  response: string
}
